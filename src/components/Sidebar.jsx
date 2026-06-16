// CHANGED: responsive sidebar widths (64/200 on lg, 80/240 on xl+), tighter padding on lg
/* Sidebar nav — glass-card shell + Jaksel tooltips/labels. */
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar({ onSignOut, isCollapsed, onToggle }) {
  const [isXl, setIsXl] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const handler = (e) => setIsXl(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const collapsedWidth = isXl ? 80 : 64;
  const expandedWidth = isXl ? 240 : 200;
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;

  const itemPadding = isCollapsed
    ? 'justify-center p-2 xl:p-3'
    : 'gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3';

  const linkClass = ({ isActive }) =>
    `flex items-center rounded-xl transition-all duration-200 cursor-pointer ${itemPadding} text-sm font-medium ${isActive
      ? 'bg-[#F9D0CD]/10 text-[#F9D0CD]'
      : 'text-[#7a6570] hover:text-[#F9D0CD] hover:bg-[#F9D0CD]/5'
    }`;

  const IconTooltip = ({ label, children }) => (
    <div className="relative group/tip">
      {children}
      {isCollapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
          <div className="bg-[#2D2328]/90 border border-[#4B3D3F] text-[#F9D0CD] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl glass-card-sm">
            {label}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="shrink-0 flex flex-col glass-card p-3 xl:p-4 justify-between shadow-2xl shadow-black/40 overflow-hidden"
      style={{ minWidth: sidebarWidth }}
    >
      <div className="flex flex-col gap-4 xl:gap-6">
        {/* Header Logo + Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1`}>
          <div className={`flex items-center gap-2 xl:gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src="/logo.png" alt="Kumala Logo" className="w-8 h-8 xl:w-9 xl:h-9 object-contain shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="font-cormorant font-semibold text-[#F9D0CD] text-lg xl:text-xl tracking-wide leading-tight whitespace-nowrap block">
                    Kumala Space
                  </span>
                  <span className="font-cormorant text-[9px] xl:text-[10px] text-[#7a6570] font-light mt-0.5 whitespace-nowrap block tracking-wide">
                    Tempat buat nyimpen memori lu
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          <IconTooltip label="Home — back to main">
            <NavLink to="/" className={linkClass} end>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                    Home
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </IconTooltip>

          <IconTooltip label="Memories — foto-foto lu">
            <NavLink to="/gallery" className={linkClass}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                    Memories
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </IconTooltip>

          <IconTooltip label="Notes — curhat & catatan">
            <NavLink to="/notes" className={linkClass}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.1 3.25a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                    Notes
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </IconTooltip>

          <IconTooltip label="18th Birthday — replay experience">
            <NavLink to="/18birthday" className={linkClass}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                    18th Birthday
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </IconTooltip>
        </nav>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 xl:gap-3">
        <div className="border-t border-[#4B3D3F]/50 w-full" />

        {/* Logout */}
        <IconTooltip label="Logout — bye dulu ya">
          <button
            onClick={onSignOut}
            className={`w-full flex items-center rounded-xl text-sm text-[#7a6570] hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 cursor-pointer ${itemPadding}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </IconTooltip>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center rounded-xl text-[#4B3D3F] hover:text-[#F9D0CD]/60 hover:bg-[#F9D0CD]/5 transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center p-2 xl:p-3' : 'gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2'
          }`}
        >
          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-xs whitespace-nowrap">
                Tutup sidebar dulu
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
