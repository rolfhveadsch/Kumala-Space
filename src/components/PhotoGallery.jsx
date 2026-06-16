/* PhotoGallery — glass cards/modals + Jaksel UI copy. */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrive } from '../hooks/useDrive';
import Lightbox from './Lightbox';
import DriveImage from './DriveImage';

function PhotoGallery() {
  const { fetchPhotos, upload, remove, updateDesc } = useDrive();
  const [photos, setPhotos] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [pendingUploads, setPendingUploads] = useState([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadPhotos = useCallback(async () => {
    setFetching(true);
    const list = await fetchPhotos();
    setPhotos(list || []);
    setFetching(false);
  }, [fetchPhotos]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const getCleanFileName = (name) => name.substring(0, name.lastIndexOf('.')) || name;

  const handleFilesSelected = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    const newPending = imageFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPendingUploads(prev => {
      const updated = [...prev, ...newPending];
      if (prev.length === 0) { setUploadTitle(getCleanFileName(newPending[0].file.name)); setUploadDesc(''); }
      return updated;
    });
    setUploadError(null);
  };

  const handleCancelCurrentUpload = () => {
    if (pendingUploads.length > 0) {
      URL.revokeObjectURL(pendingUploads[0].previewUrl);
      const remaining = pendingUploads.slice(1);
      setPendingUploads(remaining);
      if (remaining.length > 0) { setUploadTitle(getCleanFileName(remaining[0].file.name)); setUploadDesc(''); }
      else { setUploadTitle(''); setUploadDesc(''); }
    }
    setUploadProgress(null); setUploadError(null);
  };

  const handleStartUpload = async () => {
    if (pendingUploads.length === 0) return;
    const currentItem = pendingUploads[0];
    setUploadProgress(0); setUploadError(null);
    try {
      await upload(currentItem.file, uploadTitle, uploadDesc, setUploadProgress);
      URL.revokeObjectURL(currentItem.previewUrl);
      const remaining = pendingUploads.slice(1);
      setPendingUploads(remaining);
      setUploadProgress(null);
      if (remaining.length > 0) { setUploadTitle(getCleanFileName(remaining[0].file.name)); setUploadDesc(''); }
      else { setUploadTitle(''); setUploadDesc(''); loadPhotos(); }
    } catch (err) {
      setUploadError(err.message || 'Upload gagal bre, coba lagi.');
      setUploadProgress(null);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFilesSelected(e.dataTransfer.files); };
  const handleDelete = async (id) => { await remove(id); setDeleteConfirm(null); setPhotos((prev) => prev.filter((p) => p.id !== id)); };

  return (
    <div className="flex flex-col h-full p-7 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F9D0CD] tracking-tight">Memories</h1>
          <p className="text-[#7a6570] text-xs md:text-sm mt-1">
            Simpen foto & momen yang berarti buat lu — biar kagak lupa vibes-nya
          </p>
        </div>
        <label className="glass-card cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#F9D0CD] transition-all shadow-lg shadow-black/20 shrink-0 hover:border-[#F9D0CD]/40">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          Upload foto
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
        </label>
      </div>

      {/* Empty State */}
      {!fetching && photos.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center glass-card border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-[#F9D0CD]/40 bg-[#F9D0CD]/5' : 'border-[#4B3D3F]/50'
            }`}
        >
          <svg className="w-12 h-12 text-[#4B3D3F] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
          </svg>
          <p className="text-[#7a6570] text-sm">Drag & drop foto di sini, atau tap Upload bre</p>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl transition-all ${isDragging ? 'ring-2 ring-[#F9D0CD]/30' : ''}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 glass-card flex flex-col cursor-pointer group hover:border-[#F9D0CD]/30 transition-all duration-300 shadow-xl shadow-black/20"
                  onClick={() => setLightboxIndex(i)}
                >
                  <div className="relative aspect-square w-full bg-[#1F181B] rounded-xl overflow-hidden mb-3">
                    <DriveImage
                      fileId={photo.id}
                      thumbnailLink={photo.thumbnailLink}
                      mode="thumbnail"
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(photo.id); }}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-red-500/80 p-2 rounded-lg text-white/80 hover:text-white shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col px-1 pb-1">
                    <span className="text-[#F9D0CD] text-sm font-semibold truncate leading-tight">{photo.name}</span>
                    <span className="text-[#7a6570] text-[10px] md:text-xs mt-1.5 font-light">Tap buat liat detail</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetching && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-3 glass-card-sm flex flex-col animate-pulse">
              <div className="aspect-square rounded-xl bg-[#1F181B] mb-3" />
              <div className="h-4 bg-[#1F181B] rounded w-2/3 mb-2" />
              <div className="h-3 bg-[#1F181B] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, i - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, i + 1))}
          onUpdateDesc={updateDesc}
        />
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {pendingUploads.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal p-6 max-w-md w-full flex flex-col"
            >
              <h3 className="text-[#F9D0CD] font-semibold text-lg mb-1">Upload foto lu</h3>
              <p className="text-[#7a6570] text-xs mb-6">{pendingUploads.length} file lagi di queue</p>

              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#2D2328] border border-[#4B3D3F]/60 mb-6 flex items-center justify-center">
                <img src={pendingUploads[0].previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#F9D0CD]/70 font-medium">Judul foto</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Kasih judul yang aesthetic..."
                    className="px-4 py-3 bg-[#2D2328] border border-[#4B3D3F] rounded-xl text-white text-sm outline-none focus:border-[#F9D0CD]/40 transition-colors"
                    disabled={uploadProgress !== null}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#F9D0CD]/70 font-medium">Caption / cerita</label>
                  <textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Tulis cerita di balik fotonya..." rows={3}
                    className="px-4 py-3 bg-[#2D2328] border border-[#4B3D3F] rounded-xl text-white text-sm outline-none focus:border-[#F9D0CD]/40 transition-colors resize-none"
                    disabled={uploadProgress !== null}
                  />
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-[#7a6570] mb-2">
                    <span>Uploading...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-[#2D2328] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F891BB] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">⚠️ {uploadError}</div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCancelCurrentUpload} disabled={uploadProgress !== null}
                  className="flex-1 py-3 rounded-xl border border-[#4B3D3F] text-[#7a6570] text-sm hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={handleStartUpload} disabled={uploadProgress !== null || !uploadTitle.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#F891BB] text-[#191416] font-semibold text-sm hover:bg-[#F9D0CD] transition-all flex items-center justify-center disabled:opacity-50">
                  {uploadProgress !== null ? 'Uploading...' : 'Gas upload!'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[#F9D0CD] font-semibold mb-2 text-lg">Hapus foto ini?</h3>
              <p className="text-[#7a6570] text-sm mb-6">Bakal kehapus permanent dari Drive — kagak bisa undo.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#4B3D3F] text-[#7a6570] text-sm hover:bg-white/5 transition-all">Cancel dulu</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all">Hapus aja</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhotoGallery;
