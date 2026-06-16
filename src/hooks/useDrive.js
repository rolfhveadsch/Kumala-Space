import { useState, useEffect, useCallback } from 'react';
import {
  listPhotos, uploadPhoto, deleteFile, getPhotoUrl, updatePhotoDescription,
  listNotes, getNote, saveNote,
} from '../services/googleDrive';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Include Drive scopes so the user's access token can be used by server functions
// `drive.file` allows read/write access to files created or opened by the app.
// `drive.metadata.readonly` helps listing files metadata. Use broader scopes only if needed.
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient = null;

// Load Google Identity Services script
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

export function useDrive() {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await loadScript('https://accounts.google.com/gsi/client');

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error) {
              console.error('Token error:', resp);
              return;
            }
            sessionStorage.setItem('google_token', resp.access_token);
            setAccessToken(resp.access_token);
            setIsSignedIn(true);
          },
        });

        setIsReady(true);

        // Restore session if available
        const saved = sessionStorage.getItem('google_token');
        if (saved) {
          // Validate token is still alive
          try {
            const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
              headers: { Authorization: `Bearer ${saved}` },
            });
            if (res.ok) {
              setAccessToken(saved);
              setIsSignedIn(true);
            } else {
              sessionStorage.removeItem('google_token');
            }
          } catch {
            sessionStorage.removeItem('google_token');
          }
        }
      } catch (e) {
        setError(e.message);
        setIsReady(true);
      }
    };
    setup();
  }, []);

  const signIn = useCallback(() => {
    setError(null);
    if (tokenClient) {
      // Force consent prompt so the user can grant Drive scopes if token was previously issued without them
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }, []);

  const signOut = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken, () => { });
    }
    setIsSignedIn(false);
    setAccessToken(null);
    sessionStorage.removeItem('google_token');
  }, [accessToken]);

  // ── Photos ──────────────────────────────────────────────
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { return await listPhotos(); }
    catch (e) { setError(e.message); return []; }
    finally { setLoading(false); }
  }, []);

  const upload = useCallback(async (file, customName, description, onProgress) => {
    setError(null);
    try {
      // Simulate progress since we're now using fetch (no XHR progress)
      if (onProgress) onProgress(10);
      const result = await uploadPhoto(file, customName, description);
      if (onProgress) onProgress(100);
      return result;
    }
    catch (e) { setError(e.message); throw e; }
  }, []);

  const remove = useCallback(async (fileId) => {
    try { await deleteFile(fileId); }
    catch (e) { setError(e.message); }
  }, []);

  const photoUrl = useCallback((fileId) => getPhotoUrl(fileId), []);

  const updateDesc = useCallback(async (fileId, description) => {
    try { await updatePhotoDescription(fileId, description); }
    catch (e) { setError(e.message); }
  }, []);

  // ── Notes ───────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { return await listNotes(); }
    catch (e) { setError(e.message); return []; }
    finally { setLoading(false); }
  }, []);

  const fetchNote = useCallback(async (fileId) => {
    try { return await getNote(fileId); }
    catch (e) { setError(e.message); return null; }
  }, []);

  const save = useCallback(async (note) => {
    try { return await saveNote(note); }
    catch (e) { setError(e.message); return null; }
  }, []);

  return {
    isReady, isSignedIn, loading, error,
    signIn, signOut,
    fetchPhotos, upload, remove, photoUrl, updateDesc,
    fetchNotes, fetchNote, save,
  };
}
