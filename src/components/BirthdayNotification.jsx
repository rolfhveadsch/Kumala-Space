/**
 * BirthdayNotification — auto-shows a glass modal on every June 18 (local date).
 * Dismiss sets localStorage bday_shown_{year}; reappears next calendar year.
 * Dev test: ?mockDate=2026-06-18
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  shouldShowBirthdayNotification,
  markBirthdayNotificationShown,
  isBirthdayToday,
} from '../utils/birthdayDate';

const GREETING = {
  title: 'Hii, Gua adalah gua',
  body: "Lu tau kgak ni apaan",
  sub: "Mana gua tau jird???",
};

export default function BirthdayNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShowBirthdayNotification()) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    markBirthdayNotificationShown();
    setVisible(false);
  };

  if (!isBirthdayToday()) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 glass-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bday-notif-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="glass-modal max-w-md w-full p-8 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-4xl mb-4 block animate-bounce" aria-hidden="true">
              🙄
            </span>
            <h2
              id="bday-notif-title"
              className="font-cormorant text-2xl md:text-3xl font-bold text-white mb-3 tracking-wide"
            >
              {GREETING.title}
            </h2>
            <p className="text-[#F9D0CD]/85 text-sm md:text-base leading-relaxed mb-3">
              {GREETING.body}
            </p>
            <p className="text-[#F891BB]/80 text-xs md:text-sm italic mb-8">
              {GREETING.sub}
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="w-full py-3.5 rounded-xl border border-[#F891BB]/40 bg-[#F891BB]/15 hover:bg-[#F891BB]/25 text-[#F9D0CD] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer"
            >
              Apaan dah?
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
