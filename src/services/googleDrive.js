/**
 * googleDrive.js — Frontend service layer
 *
 * All Drive operations go through Netlify Functions (Service Account).
 * The user's Google OAuth token is only used for identity verification
 * on the server side. No direct Google Drive API calls from the browser.
 */

const API_BASE = '/.netlify/functions';

// ─── Auth helpers ────────────────────────────────────────
const getToken = () => {
  const token = sessionStorage.getItem('google_token');
  if (!token) throw new Error('Not authenticated');
  return token;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

// ─── Photos ──────────────────────────────────────────────
export const uploadPhoto = async (file, customName, description) => {
  // Convert File to base64 for Netlify Function (max ~6MB)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the data URL prefix (e.g., "data:image/jpeg;base64,")
      const result = reader.result.split(',')[1];
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch(`${API_BASE}/upload-photo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      fileName: customName || file.name,
      mimeType: file.type,
      description: description || '',
      fileBase64: base64,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
};

export const listPhotos = async () => {
  const res = await fetch(`${API_BASE}/list-photos`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to list photos');
  }

  return res.json();
};

/**
 * Returns a public thumbnail URL for a Drive file.
 * Works because uploaded photos are made publicly readable.
 */
export const getPhotoUrl = (fileId) => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

export const updatePhotoDescription = async (fileId, description) => {
  const res = await fetch(`${API_BASE}/update-photo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fileId, description }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to update description');
  }

  return res.json();
};

export const deleteFile = async (fileId) => {
  const res = await fetch(`${API_BASE}/delete-file`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fileId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to delete file');
  }

  return res.json();
};

// ─── Notes ───────────────────────────────────────────────
export const saveNote = async (note) => {
  const res = await fetch(`${API_BASE}/save-note`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(note),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to save note');
  }

  return res.json();
};

export const listNotes = async () => {
  const res = await fetch(`${API_BASE}/list-notes`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to list notes');
  }

  return res.json();
};

export const getNote = async (fileId) => {
  const res = await fetch(`${API_BASE}/get-file?fileId=${encodeURIComponent(fileId)}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to fetch note');
  }

  return res.json();
};
