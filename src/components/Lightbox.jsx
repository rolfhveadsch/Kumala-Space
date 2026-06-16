/* Lightbox — glass sidebar + Jaksel copy for photo notes. */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import DriveImage from './DriveImage';

function Lightbox({ photos, currentIndex, onClose, onPrev, onNext, onUpdateDesc }) {
  const photo = photos[currentIndex];
  const [desc, setDesc] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && !isEditing) onPrev();
      if (e.key === 'ArrowRight' && !isEditing) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext, isEditing]);

  useEffect(() => {
    if (photo) {
      setDesc(photo.description || '');
      setIsEditing(false);
    }
  }, [photo]);

  if (!photo) return null;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateDesc(photo.id, desc);
    photo.description = desc; // sync local object
    setIsEditing(false);
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col md:flex-row bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6 relative" onClick={onClose}>
          <motion.div
            key={photo.id}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}
            className="relative max-w-full max-h-[80vh] md:max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DriveImage fileId={photo.id} mode="full" alt={photo.name} className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </motion.div>

          {/* Navigation Controls */}
          {currentIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}
        </div>

        {/* Sidebar Info & Notes */}
        <div className="w-full md:w-80 shrink-0 glass-card md:rounded-none md:rounded-l-[20px] border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-base font-semibold truncate max-w-[80%]" title={photo.name}>{photo.name}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Caption / notes</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Tulis caption buat foto ini..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 outline-none focus:border-white/20 transition-all resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setDesc(photo.description || ''); setIsEditing(false); }} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:bg-white/5 transition-all">Cancel</button>
                      <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs bg-white text-black font-medium hover:bg-gray-200 transition-all disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save bre'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setIsEditing(true)} className="group cursor-pointer min-h-[80px] p-3 rounded-xl bg-white/4 hover:bg-white/6 border border-transparent hover:border-white/5 transition-all">
                    {photo.description ? (
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{photo.description}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic leading-relaxed">Tap buat nambah caption...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-xs text-gray-600">
            <span>{currentIndex + 1} dari {photos.length}</span>
            <span>{photo.createdTime ? new Date(photo.createdTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Lightbox;
