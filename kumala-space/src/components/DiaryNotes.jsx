import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrive } from '../hooks/useDrive';
import NoteEditor from './NoteEditor';

function DiaryNotes() {
  const { fetchNotes, fetchNote, save, remove } = useDrive();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteData, setNoteData] = useState(null); // { id, title, content }
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [fetching, setFetching] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const autoSaveTimer = useRef(null);

  const loadNotes = useCallback(async () => {
    setFetching(true);
    const list = await fetchNotes();
    setNotes(list || []);
    setFetching(false);
  }, [fetchNotes]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const selectNote = async (file) => {
    setSelectedId(file.id);
    setSaveStatus('idle');
    const data = await fetchNote(file.id);
    setNoteData({ id: file.id, title: data?.title || file.name.replace('.json', ''), content: data?.content || '' });
  };

  const createNote = async () => {
    const now = new Date().toISOString();
    const newNote = { title: 'Catatan Baru', content: '', updatedAt: now };
    const created = await save(newNote);
    if (created?.id) {
      const fullNote = { ...newNote, id: created.id };
      setNotes((prev) => [{ id: created.id, name: 'Catatan Baru.json', modifiedTime: now, createdTime: now }, ...prev]);
      setSelectedId(created.id);
      setNoteData(fullNote);
    }
  };

  const handleContentChange = (html) => {
    if (!noteData) return;
    const updated = { ...noteData, content: html, updatedAt: new Date().toISOString() };
    setNoteData(updated);
    setSaveStatus('saving');

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

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await save(updated);
      setNotes((prev) =>
        prev.map((n) => n.id === noteData.id ? { ...n, name: `${title}.json` } : n)
      );
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  };

  const handleDelete = async (id) => {
    await remove(id);
    setDeleteConfirm(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setNoteData(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Notes Sidebar */}
      <div className="w-64 shrink-0 border-r border-white/5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Catatan</h2>
          <button
            onClick={createNote}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            title="Buat catatan baru"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {fetching && (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!fetching && notes.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm">Belum ada catatan.</p>
              <button onClick={createNote} className="mt-3 text-xs text-gray-500 hover:text-white transition-colors underline underline-offset-2">
                Buat catatan pertama
              </button>
            </div>
          )}

          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => selectNote(note)}
                className={`group flex items-start justify-between px-4 py-3 cursor-pointer border-b border-white/5 transition-all ${
                  selectedId === note.id ? 'bg-white/8 text-white' : 'hover:bg-white/4 text-gray-400'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${selectedId === note.id ? 'text-white' : 'text-gray-300'}`}>
                    {note.name?.replace('.json', '') || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{formatDate(note.modifiedTime)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(note.id); }}
                  className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {noteData ? (
          <>
            {/* Title + save status */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <input
                type="text"
                value={noteData.title}
                onChange={handleTitleChange}
                placeholder="Judul catatan..."
                className="flex-1 bg-transparent text-lg font-semibold text-white placeholder-gray-600 outline-none"
              />
              <div className="ml-4 text-xs shrink-0">
                {saveStatus === 'saving' && <span className="text-gray-500">Menyimpan...</span>}
                {saveStatus === 'saved' && <span className="text-green-500">Tersimpan ✓</span>}
              </div>
            </div>

            {/* TipTap Editor */}
            <div className="flex-1 overflow-hidden">
              <NoteEditor
                content={noteData.content}
                onChange={handleContentChange}
                placeholder="Tulis catatan lu di sini..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <svg className="w-12 h-12 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.862 4.487 18.1 3.25a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            <p className="text-gray-600 text-sm">Pilih catatan di sebelah kiri,</p>
            <p className="text-gray-600 text-sm">atau buat catatan baru.</p>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold mb-2">Hapus catatan ini?</h3>
              <p className="text-gray-500 text-sm mb-6">Catatan akan dihapus dari Google Drive dan tidak bisa dipulihkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all">
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiaryNotes;
