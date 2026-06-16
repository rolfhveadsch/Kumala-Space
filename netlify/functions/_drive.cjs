/**
 * _drive.cjs — Shared Drive helpers
 *
 * Provides:
 *  - getDriveClient()            -> Drive client using Service Account (if configured)
 *  - getDriveClientForUserToken  -> Drive client using an end-user OAuth access token
 *  - extractAuthHeaderFromEvent  -> helper to read Bearer token from event (header/query/body)
 *  - verifyGoogleToken           -> validate an access token via userinfo/tokeninfo and return {email, token}
 *  - CORS_HEADERS, handleOptions, jsonResponse, makePublic
 */

const { google } = require('googleapis');
const crypto = require('crypto');

let clockOffsetMs = 0;

async function fetchClockOffset() {
  try {
    const before = Date.now();
    const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST' });
    const after = Date.now();
    const localMid = Math.floor((before + after) / 2);
    const serverDate = res.headers.get('date');
    if (serverDate) {
      clockOffsetMs = new Date(serverDate).getTime() - localMid;
      console.log(`[Clock] Offset: ${Math.round(clockOffsetMs / 1000)}s`);
    }
  } catch (e) {
    console.log('[Clock] Skew check failed:', e.message);
  }
}

function googleNow() {
  return Date.now() + clockOffsetMs;
}

// Create a Drive client using an end-user OAuth access token (delegated user)
function getDriveClientForUserToken(accessToken) {
  if (!accessToken) throw new Error('accessToken is required');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

// Manual service account token exchange (kept for backwards compatibility if SA is configured)
async function getServiceAccountToken(credentials) {
  const nowSec = Math.floor(googleNow() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${b64(header)}.${b64(payload)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(credentials.private_key, 'base64url');

  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[SA] Token exchange failed: ${res.status} ${err}`);
    throw new Error(`Service account token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

let cachedDrive = null;
let cachedTokenExpiry = 0;

async function getDriveClient() {
  const privateKey = process.env.SA_PRIVATE_KEY;
  if (!privateKey) throw new Error('SA_PRIVATE_KEY environment variable is not set');

  const credentials = {
    type: 'service_account',
    project_id: process.env.SA_PROJECT_ID,
    private_key_id: process.env.SA_PRIVATE_KEY_ID,
    private_key: privateKey.replace(/\\n/g, '\n'),
    client_email: process.env.SA_CLIENT_EMAIL,
    client_id: process.env.SA_CLIENT_ID,
  };

  await fetchClockOffset();

  const nowSec = Math.floor(googleNow() / 1000);
  if (cachedDrive && cachedTokenExpiry > nowSec + 60) {
    return cachedDrive;
  }

  const accessToken = await getServiceAccountToken(credentials);
  cachedTokenExpiry = nowSec + 3600;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  cachedDrive = google.drive({ version: 'v3', auth });
  return cachedDrive;
}

const FOLDER_IDS = {
  photos: process.env.DRIVE_PHOTOS_FOLDER_ID,
  notes: process.env.DRIVE_NOTES_FOLDER_ID,
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  return null;
}

// Extract Authorization header from event — support header, query param, or token in JSON body
function extractAuthHeaderFromEvent(event) {
  try {
    if (event.headers && event.headers.authorization) return event.headers.authorization;
    if (event.queryStringParameters && event.queryStringParameters.token) return `Bearer ${event.queryStringParameters.token}`;
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body && body.token) return `Bearer ${body.token}`;
      } catch (e) {
        // body may be non-json
      }
    }
  } catch (e) {}
  return null;
}

async function verifyGoogleToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] No Bearer token in header');
    return false;
  }
  const token = authHeader.slice(7);
  try {
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    let info;
    if (!res.ok) {
      console.log(`[Auth] Userinfo failed: ${res.status}`);
      const fallback = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
      if (!fallback.ok) {
        console.log(`[Auth] Tokeninfo also failed: ${fallback.status}`);
        return false;
      }
      info = await fallback.json();
      console.log(`[Auth] Tokeninfo response:`, JSON.stringify(info));
    } else {
      info = await res.json();
    }

    const allowed = process.env.ALLOWED_USER_EMAIL;
    console.log(`[Auth] Userinfo email: ${info.email}, Allowed: ${allowed}`);
    if (allowed) {
      // Support comma-separated list of allowed emails
      const allowedList = allowed.split(',').map(e => e.trim().toLowerCase());
      if (!allowedList.includes((info.email || '').toLowerCase())) {
        console.log(`[Auth] EMAIL MISMATCH: ${info.email} not in [${allowed}]`);
        return false;
      }
    }

    return { email: info.email, token };
  } catch (e) {
    console.log('[Auth] Exception:', e.message);
    return false;
  }
}

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

async function makePublic(drive, fileId) {
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });
}

module.exports = { getDriveClient, getDriveClientForUserToken, FOLDER_IDS, CORS_HEADERS, handleOptions, verifyGoogleToken, jsonResponse, makePublic, extractAuthHeaderFromEvent };
