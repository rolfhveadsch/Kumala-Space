import { useState, useEffect, useCallback } from 'react';
import {
  initGapi,
  initTokenClient,
  requestToken,
  revokeToken,
  listPhotos,
  uploadPhoto,
  deleteFile,
  getPhotoUrl,
  listNotes,
  getNote,
  saveNote,
} from '../services/googleDrive';

export function useDrive() {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Init GAPI + GIS on mount
  useEffect(() => {
    const setup = async () => {
      await initGapi();
      await initTokenClient((token) => {
        setAccessToken(token);
        setIsSignedIn(true);
        window.gapi.client.setToken({ access_token: token });
      });
      setIsReady(true);

      // Check if we have a saved token
      const saved = sessionStorage.getItem('gapi_token');
      if (saved) {
        window.gapi.client.setToken({ access_token: saved });
        setAccessToken(saved);
        setIsSignedIn(true);
      }
    };
    setup().catch((e) => setError(e.message));
  }, []);

  // Save token to session storage when it changes
  useEffect(() => {
    if (accessToken) sessionStorage.setItem('gapi_token', accessToken);
  }, [accessToken]);

  const signIn = useCallback(() => {
    requestToken();
  }, []);

  const signOut = useCallback(() => {
    if (accessToken) revokeToken(accessToken);
    setIsSignedIn(false);
    setAccessToken(null);
    window.gapi.client.setToken(null);
    sessionStorage.removeItem('gapi_token');
  }, [accessToken]);

  // ── Photos ──────────────────────────────────────────────
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await listPhotos();
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(async (file, onProgress) => {
    setLoading(true);
    setError(null);
    try {
      return await uploadPhoto(file, onProgress);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (fileId) => {
    try {
      await deleteFile(fileId);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const photoUrl = useCallback((fileId) => getPhotoUrl(fileId), []);

  // ── Notes ───────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      return await listNotes();
    } catch (e) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNote = useCallback(async (fileId) => {
    try {
      return await getNote(fileId);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const save = useCallback(async (note) => {
    try {
      return await saveNote(note);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return {
    isReady,
    isSignedIn,
    loading,
    error,
    signIn,
    signOut,
    // photos
    fetchPhotos,
    upload,
    remove,
    photoUrl,
    // notes
    fetchNotes,
    fetchNote,
    save,
  };
}
