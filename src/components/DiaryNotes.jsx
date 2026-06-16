// CHANGED: mobile-first padding, stacked layout below lg, min-h note cards, xs/sm grid columns
/* DiaryNotes — glass panels + Jaksel UI copy. */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrive } from '../hooks/useDrive';
import NoteEditor from './NoteEditor';

function DiaryNotes() {
  const { fetchNotes, fetchNote, save, remove } = useDrive();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteData, setNoteData] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [fetching, setFetching] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const autoSaveTimer = useRef(null);

  const loadNotes = useCallback(async () => {
    setFetching(true);
    const list = await fetchNotes();
    setNotes(list || []);
    setFetching(false);
  }, [fetchNotes]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const selectNote = useCallback(async (file) => {
    setSelectedId(file.id);
    setSaveStatus('idle');
    const data = await fetchNote(file.id);
    setNoteData({
      id: file.id,
      title: data?.title || file.name?.replace('.json', '') || 'Untitled',
      content: data?.content || ''
    });
  }, [fetchNote]);

  useEffect(() => {
    if (!fetching && notes.length > 0 && !selectedId) {
      selectNote(notes[0]);
    }
  }, [fetching, notes, selectedId, selectNote]);

  const createNote = async () => {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const now = new Date().toISOString();
      const newNote = { title: 'Catatan Baru', content: '', updatedAt: now };
      const created = await save(newNote);
      const newId = created?.id ?? created?.file?.id;
      if (!newId) throw new Error('Kagak dapet ID dari server bre');
      setNotes((prev) => [
        { id: newId, name: 'Catatan Baru.json', modifiedTime: now, createdTime: now, description: '' },
        ...prev
      ]);
      setSelectedId(newId);
      setNoteData({ id: newId, title: 'Catatan Baru', content: '', updatedAt: now });
    } catch (err) {
      setCreateError('Gagal bikin notes baru — coba lagi ya bre.');
      console.error('[createNote]', err);
      setTimeout(() => setCreateError(null), 4000);
    } finally {
      setCreating(false);
    }
  };

  const handleContentChange = (html) => {
    if (!noteData) return;
    const updated = { ...noteData, content: html, updatedAt: new Date().toISOString() };
    setNoteData(updated);
    setSaveStatus('saving');
    const snippet = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
    setNotes((prev) => prev.map((n) => n.id === noteData.id ? { ...n, description: snippet } : n));
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await save(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1800);
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!noteData) return;
    const updated = { ...noteData, title };
    setNoteData(updated);
    setSaveStatus('saving');
    setNotes((prev) => prev.map((n) => n.id === noteData.id ? { ...n, name: `${title}.json` } : n));
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await save(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  };

  const handleDelete = async (id) => {
    await remove(id);
    setDeleteConfirm(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) { setSelectedId(null); setNoteData(null); }
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const gridCols = 'grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 xs:gap-3';

  return (
    <div className="flex flex-col h-full p-3 xs:p-4 md:p-6 lg:p-7 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 xs:mb-5 md:mb-7 shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-[#F9D0CD] tracking-tight">Notes</h1>
          <p className="text-[#93797A] text-[11px] xs:text-xs md:text-sm mt-1">Tulis apapun yang lu mau — literally terserah lu bre.</p>
        </div>
        {saveStatus !== 'idle' && (
          <div className="text-[10px] xs:text-xs shrink-0">
            {saveStatus === 'saving' && <span className="text-[#93797A]">Saving dulu ya...</span>}
            {saveStatus === 'saved' && <span className="text-[#F9D0CD]">Udah ke-save ✓</span>}
          </div>
        )}
      </div>

      {createError && (
        <div className="mb-3 xs:mb-4 px-3 xs:px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs shrink-0">
          {createError}
        </div>
      )}

      {/* Split Layout — stack below lg, side-by-side on lg+ */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 xs:gap-4 md:gap-5 overflow-hidden min-h-0">
        {/* Editor — top on mobile/tablet, left on desktop */}
        <div className="flex flex-col glass-card p-3 xs:p-4 md:p-5 relative shrink-0 h-[40vh] sm:h-[45vh] lg:h-auto lg:flex-1 lg:max-w-[45%] min-h-0">
          {noteData ? (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <input
                type="text"
                value={noteData.title}
                onChange={handleTitleChange}
                placeholder="Judul notes lu..."
                className="w-full min-w-0 bg-transparent text-lg sm:text-xl font-bold text-[#F9D0CD] placeholder-[#4B3D3F] outline-none pb-3 xs:pb-4 mb-3 xs:mb-4 border-b border-[#4B3D3F]/60 truncate"
              />
              <div className="flex-1 overflow-hidden min-h-0">
                <NoteEditor content={noteData.content} onChange={handleContentChange} placeholder="Mulai nulis curhat lu di sini..." />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 xs:p-8">
              <svg className="w-10 h-10 xs:w-12 xs:h-12 text-[#4B3D3F] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.862 4.487 18.1 3.25a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              <p className="text-[#93797A] text-xs xs:text-sm">Pilih notes, atau bikin yang baru bre.</p>
            </div>
          )}
        </div>

        {/* Notes grid — bottom on mobile/tablet, right on desktop */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 xs:pr-1">
          {fetching ? (
            <div className={gridCols}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-h-[120px] sm:min-h-0 aspect-square rounded-2xl glass-card-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className={`${gridCols} pb-6 xs:pb-8`}>
              {/* Creator card */}
              <div
                onClick={creating ? undefined : createNote}
                className={`p-3 xs:p-4 glass-card-sm border border-dashed border-[#4B3D3F]/50 flex flex-col items-center justify-center transition-all min-h-[120px] sm:min-h-0 aspect-square min-w-0 text-center group ${
                  creating ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-[#F9D0CD]/30'
                }`}
              >
                {creating ? (
                  <svg className="w-6 h-6 xs:w-7 xs:h-7 text-[#F891BB] mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 xs:w-7 xs:h-7 text-[#4B3D3F] group-hover:text-[#F9D0CD]/50 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
                <span className="text-[10px] xs:text-xs text-[#93797A] group-hover:text-[#F9D0CD]/60 transition-colors font-medium">
                  {creating ? 'Bikin dulu...' : '+ Notes Baru'}
                </span>
              </div>

              {/* Note Cards */}
              <AnimatePresence>
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => selectNote(note)}
                    className={`p-3 xs:p-4 glass-card-sm flex flex-col cursor-pointer group transition-all duration-300 relative min-h-[120px] sm:min-h-0 aspect-square min-w-0 select-none overflow-hidden ${selectedId === note.id
                        ? 'border-[#F9D0CD]/40 bg-[#F9D0CD]/5 shadow-lg shadow-[#F9D0CD]/5'
                        : 'border-[#4B3D3F]/60 hover:border-[#F9D0CD]/20'
                      }`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(note.id); }}
                      className="absolute top-2 right-2 xs:top-2.5 xs:right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-red-500/80 p-1.5 rounded-lg text-white/80 hover:text-white z-20"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="text-[#F9D0CD] text-xs xs:text-sm font-semibold truncate leading-snug mb-1 min-w-0">
                      {note.name?.replace('.json', '') || 'Untitled'}
                    </span>
                    <span className="text-[#93797A] text-[9px] xs:text-[10px] mb-1.5 xs:mb-2 font-light shrink-0">{formatDate(note.modifiedTime)}</span>
                    <p className="text-[#93797A] text-[10px] xs:text-[11px] leading-relaxed line-clamp-3 xs:line-clamp-4 font-light overflow-hidden mt-1 whitespace-pre-wrap flex-1 break-words min-w-0">
                      {note.description || 'Kosong...'}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal p-5 xs:p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold mb-2 text-base xs:text-lg">Hapus notes ini?</h3>
              <p className="text-[#93797A] text-xs xs:text-sm mb-5 xs:mb-6">Bakal kehapus permanent dari Google Drive — kagak bisa undo ya.</p>
              <div className="flex gap-2 xs:gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#4B3D3F] text-[#93797A] text-xs xs:text-sm hover:bg-white/5 transition-all">Cancel dulu</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs xs:text-sm hover:bg-red-500/30 transition-all">Hapus aja</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiaryNotes;
