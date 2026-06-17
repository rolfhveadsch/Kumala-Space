/* GreetingHero — rotating Jaksel greetings; birthday-specific lines on June 18. */
import { useState, useEffect, useRef, useMemo } from 'react';
import { isBirthdayToday } from '../utils/birthdayDate';

const GREETINGS = [
  'Hi, gimana vibe hari ini?',
  'Btw, lu udah minum aer putih belum?',
  'Keep slaying, walopun semua kagak sesuai ekspektasi fr',
  'Cape ya? Take a break dulu cuyy',
  "It's giving main character energy today ✨",
];

const BIRTHDAY_GREETINGS = [
  "It's giving birthday vibes fr fr 🎂",
  'Yooo, happy bday!! Lu deserve the world today',
  'Literally your day — go slay, kagak ada yang bisa halangin lu',
  "18 tahun cuyyy, that's actually insane. Enjoy every sec!",
];

const GREETING_TTL = 3 * 60 * 60 * 1000;

function getGreeting() {
  const pool = isBirthdayToday() ? BIRTHDAY_GREETINGS : GREETINGS;
  const storageKey = isBirthdayToday() ? 'greetingTextBday' : 'greetingText';
  const tsKey = isBirthdayToday() ? 'greetingTsBday' : 'greetingTs';

  try {
    const saved = localStorage.getItem(storageKey);
    const ts = parseInt(localStorage.getItem(tsKey) || '0', 10);
    if (saved && Date.now() - ts < GREETING_TTL) return saved;
  } catch (_) { /* ignore */ }

  const prev = localStorage.getItem(storageKey) || '';
  const choices = pool.filter((g) => g !== prev);
  const chosen = choices[Math.floor(Math.random() * choices.length)] || pool[0];

  try {
    localStorage.setItem(storageKey, chosen);
    localStorage.setItem(tsKey, String(Date.now()));
  } catch (_) { /* ignore */ }

  return chosen;
}

function useTypewriter(text, speed = 55) {
  const textRef = useRef(text);
  const indexRef = useRef(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const target = textRef.current;
    if (!target) {
      setDone(true);
      return;
    }

    const iv = setInterval(() => {
      const next = indexRef.current + 1;
      setDisplayed(target.slice(0, next));
      indexRef.current = next;

      if (next >= target.length) {
        setDone(true);
        clearInterval(iv);
      }
    }, speed);

    return () => clearInterval(iv);
  }, []);

  return { displayed, done };
}

function GreetingHero() {
  const greeting = useMemo(() => getGreeting(), []);
  const { displayed, done } = useTypewriter(greeting);

  return (
    <div className="flex items-center justify-center w-full px-4 py-4">
      <h1
        // Hapus 'whitespace-nowrap' dan 'truncate'
        // Tambahkan 'text-center' agar teks rata tengah saat turun ke bawah
        className="font-cormorant font-semibold text-[#F9D0CD] tracking-wider leading-relaxed text-center max-w-[90%]"
        style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)' }}
      >
        {displayed}
        <span 
          className={`inline-block w-[2px] h-[0.85em] bg-[#F891BB] ml-1 align-middle transition-opacity duration-300 ${done ? 'opacity-0' : 'animate-pulse'}`} 
        />
      </h1>
    </div>
  );
}

export default GreetingHero;
