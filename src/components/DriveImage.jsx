import { useState, useEffect } from 'react';

/**
 * DriveImage — Renders images from Google Drive.
 * 
 * Since uploaded files are made publicly readable (anyone with link),
 * we can use Drive's public thumbnail endpoint directly without auth.
 */
function DriveImage({ fileId, thumbnailLink, mode = 'thumbnail', alt = '', className = '', ...props }) {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [triedAuth, setTriedAuth] = useState(false);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!fileId) {
      setError(true);
      setLoading(false);
      return;
    }

    // For thumbnails: prefer the public Drive thumbnail URL
    // sz=w1000 requests a 1000px wide image
    const publicUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    setSrc(publicUrl);
    setLoading(false);
  }, [fileId, thumbnailLink, mode]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white/5 animate-pulse ${className}`} {...props}>
        <span className="text-xs text-gray-600">Loading dulu ya...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-950/10 border border-red-900/20 ${className}`} {...props}>
        <span className="text-xs text-red-500/80">Gagal load bre</span>
      </div>
    );
  }

  const handleImgError = async () => {
    // Try authenticated fetch via Netlify Function once
    if (triedAuth) {
      setError(true);
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem('google_token');
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/.netlify/functions/get-file?fileId=${encodeURIComponent(fileId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Auth fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      setSrc(url);
      setTriedAuth(true);
      setError(false);
      setLoading(false);
    } catch (e) {
      setTriedAuth(true);
      setError(true);
      setLoading(false);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImgError}
      {...props}
    />
  );
}

export default DriveImage;
