// CHANGED: layout split at lg (1024px), sidebar default-collapsed below xl, safe-area insets
/* PersonalSpace layout — glass-app wrapper + frosted page bg on all main routes. */
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Home from './Home';
import PhotoGallery from './PhotoGallery';
import DiaryNotes from './DiaryNotes';

function PersonalSpace({ onSignOut }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) return saved === 'true';
    return window.innerWidth < 1280;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  const PageRoutes = () => (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<PhotoGallery />} />
      <Route path="/notes" element={<DiaryNotes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <>
      {/* ── Desktop layout (lg and up) ───────────────────────── */}
      <div className="glass-app glass-page-bg hidden lg:flex h-screen p-3 xl:p-4 gap-3 xl:gap-4 overflow-hidden">
        <Sidebar onSignOut={onSignOut} isCollapsed={isCollapsed} onToggle={toggleSidebar} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <main className="flex-1 overflow-hidden min-h-0">
            <PageRoutes />
          </main>
        </div>
      </div>

      {/* ── Mobile/tablet layout (below lg) ──────────────────── */}
      <div className="glass-app glass-page-bg flex lg:hidden flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-between px-4 xs:px-5 pt-3 xs:pt-4 pb-2 shrink-0 safe-top">
          <div className="flex items-center gap-2 xs:gap-2.5 min-w-0">
            <img src="/logo.png" alt="Kumala Logo" className="w-7 h-7 xs:w-8 xs:h-8 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="font-cormorant font-semibold text-sm xs:text-base text-[#F9D0CD] leading-tight tracking-wide truncate">Kumala Space</p>
              <p className="font-cormorant text-[8px] xs:text-[9px] text-[#7a6570] font-light tracking-wide truncate">Tempat buat nyimpen memori lu</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-xl text-[#7a6570] hover:text-red-400 hover:bg-red-500/8 transition-all shrink-0"
            title="Logout — bye bye dulu ya"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>

        <main className="flex-1 overflow-hidden min-h-0">
          <PageRoutes />
        </main>

        <div className="shrink-0 px-2 xs:px-3 pt-2 safe-bottom">
          <BottomNav />
        </div>
      </div>
    </>
  );
}

export default PersonalSpace;
