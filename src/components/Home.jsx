/* Home dashboard — glass cards, shared birthdayDate util, Jaksel copy. */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDrive } from '../hooks/useDrive';
import DriveImage from './DriveImage';
import GreetingHero from './GreetingHero';
import { motion, AnimatePresence } from 'framer-motion';
import { isBirthdayToday, getBirthdayCountdown, getEffectiveDate } from '../utils/birthdayDate';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

const CountBox = ({ value, label }) => (
  <div className="flex-1 flex flex-col items-center justify-center glass-card-sm py-4 md:py-5">
    <span className="text-2xl md:text-4xl font-extrabold text-[#F9D0CD] leading-none tabular-nums">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] md:text-[10px] text-[#7a6570] font-semibold uppercase tracking-widest mt-1.5">
      {label}
    </span>
  </div>
);

const BirthdayBanner = ({ mobile = false }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className={`glass-card-accent shrink-0 text-center ${mobile ? 'mx-3 mt-2 p-4' : 'mx-0 mt-0 mb-4 p-5'}`}
  >
    <span className={`block animate-bounce ${mobile ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>🎂✨🌸</span>
    <h2 className={`font-bold text-white ${mobile ? 'text-base mb-0.5' : 'text-lg md:text-2xl mb-1'}`}>
      Happy bday Kumala!! 🎉
    </h2>
    <p className={`text-[#F9D0CD]/70 leading-relaxed ${mobile ? 'text-[11px]' : 'text-xs md:text-sm max-w-xl mx-auto'}`}>
      {mobile
        ? "It's your day bestie — semoga semua mimpi lu tercapai fr fr "
        : "It's giving birthday vibes today! Semoga semua mimpi lu tercapai, dan lu selalu dikelilingi good energy di umur baru ini "}
    </p>
  </motion.div>
);

const DesktopLayout = ({ isBirthdayToday: isBday, timeLeft, loading, photos, desktopNoteSlots, fmt }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <AnimatePresence>
      {isBday && <BirthdayBanner />}
    </AnimatePresence>

    <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
      <GreetingHero />
    </div>

    <div className="shrink-0 flex gap-4 pb-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">

        {!isBday && (
          <div className="shrink-0 glass-card p-4 md:p-5">
            <p className="text-center text-[9px] md:text-[10px] font-bold text-[#7a6570] tracking-[0.18em] uppercase mb-3 md:mb-4">
              Countdown ke 18 Juni — mark your calendar cuyy
            </p>
            <div className="flex gap-2 md:gap-3">
              <CountBox value={timeLeft.days} label="Day" />
              <CountBox value={timeLeft.hours} label="Hour" />
              <CountBox value={timeLeft.minutes} label="Minit" />
              <CountBox value={timeLeft.seconds} label="Sec" />
            </div>
          </div>
        )}

        <div className="shrink-0 glass-card p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F9D0CD]">Latest Memories</h3>
            <Link to="/gallery" className="text-[10px] text-[#F9D0CD]/60 hover:text-[#F9D0CD] transition-colors font-medium">
              Lihat semua →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="aspect-square glass-card-sm animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <p className="text-[#4B3D3F] text-xs text-center py-4">Belum ada memori nih — upload dulu yuk!</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <Link key={photo.id} to="/gallery" className="flex flex-col gap-1.5 group">
                  <div className="aspect-square glass-card-sm overflow-hidden group-hover:border-[#F9D0CD]/30 transition-colors">
                    <DriveImage
                      fileId={photo.id}
                      thumbnailLink={photo.thumbnailLink}
                      mode="thumbnail"
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-0.5">
                    <span className="text-[#F9D0CD] text-[11px] font-semibold truncate block leading-tight">{photo.name}</span>
                    {photo.description && (
                      <span className="text-[#7a6570] text-[10px] truncate block mt-0.5">{photo.description}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 glass-card p-4 md:p-5 flex flex-col gap-3 overflow-hidden" style={{ width: '340px' }}>
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-[#F9D0CD]">Latest Notes</h3>
          <Link to="/notes" className="text-[10px] text-[#F9D0CD]/60 hover:text-[#F9D0CD] transition-colors font-medium">
            Lihat semua →
          </Link>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-0">
          {desktopNoteSlots.map((note, i) =>
            note ? (
              <Link
                key={note.id}
                to="/notes"
                className="flex-1 min-h-0 p-3 glass-card-sm flex flex-col transition-all group hover:border-[#F9D0CD]/25"
              >
                <span className="text-[#F9D0CD]/60 text-xs font-semibold truncate mb-0.5 group-hover:text-[#F9D0CD]/90 transition-colors">
                  {note.name?.replace('.json', '') || 'Untitled'}
                </span>
                {note.description && (
                  <p className="text-[#7a6570] text-[10px] leading-relaxed line-clamp-2 flex-1">{note.description}</p>
                )}
                <span className="text-[#4B3D3F] text-[9px] mt-auto pt-0.5">Edited {fmt(note.modifiedTime)}</span>
              </Link>
            ) : (
              <div key={`empty-${i}`} className="flex-1 min-h-0 rounded-xl border border-dashed border-[#4B3D3F]/30 bg-white/[0.02]" />
            )
          )}
        </div>
      </div>
    </div>
  </div>
);

const MobileLayout = ({ isBirthdayToday: isBday, timeLeft, loading, photos, notes, fmt }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <AnimatePresence>
      {isBday && <BirthdayBanner mobile />}
    </AnimatePresence>

    <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
      <GreetingHero />
    </div>

    <div className="shrink-0 flex flex-col gap-3 px-3 pb-3 overflow-y-auto" style={{ maxHeight: '58vh' }}>

      {!isBday && (
        <div className="glass-card p-4">
          <p className="text-center text-[9px] font-bold text-[#7a6570] tracking-[0.18em] uppercase mb-3">
            Countdown ke 18 Juni
          </p>
          <div className="flex gap-2">
            <CountBox value={timeLeft.days} label="Day" />
            <CountBox value={timeLeft.hours} label="Hour" />
            <CountBox value={timeLeft.minutes} label="Minit" />
            <CountBox value={timeLeft.seconds} label="Sec" />
          </div>
        </div>
      )}

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F9D0CD]">Latest Memories</h3>
          <Link to="/gallery" className="text-[10px] text-[#F9D0CD]/60 hover:text-[#F9D0CD] transition-colors font-medium">
            Lihat semua →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array(2).fill(null).map((_, i) => (
              <div key={i} className="aspect-square glass-card-sm animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-[#4B3D3F] text-xs text-center py-4">Belum ada memori — upload dulu yuk!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <Link key={photo.id} to="/gallery" className="flex flex-col gap-1.5 group">
                <div className="aspect-square glass-card-sm overflow-hidden group-hover:border-[#F9D0CD]/30 transition-colors">
                  <DriveImage
                    fileId={photo.id}
                    thumbnailLink={photo.thumbnailLink}
                    mode="thumbnail"
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-0.5">
                  <span className="text-[#F9D0CD] text-[11px] font-semibold truncate block leading-tight">{photo.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#F9D0CD] shrink-0">Latest Notes</h3>

        <div className="flex gap-3 items-stretch">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="h-[76px] glass-card-sm animate-pulse" />
            ) : notes.length === 0 ? (
              <div className="h-[76px] flex items-center justify-center rounded-xl border border-dashed border-[#4B3D3F]/40">
                <p className="text-[#4B3D3F] text-xs text-center">Belum ada notes nih.</p>
              </div>
            ) : (
              <Link
                to="/notes"
                className="h-full p-3 glass-card-sm flex flex-col transition-all group hover:border-[#F9D0CD]/25"
              >
                <span className="text-[#F9D0CD] text-xs font-semibold truncate mb-0.5 group-hover:text-[#F9D0CD]/90">
                  {notes[0]?.name?.replace('.json', '') || 'Untitled'}
                </span>
                {notes[0]?.description && (
                  <p className="text-[#7a6570] text-[10px] leading-relaxed line-clamp-2">{notes[0].description}</p>
                )}
                <span className="text-[#4B3D3F] text-[9px] mt-auto pt-0.5">Edited {fmt(notes[0]?.modifiedTime)}</span>
              </Link>
            )}
          </div>

          <Link
            to="/notes"
            className="shrink-0 w-[72px] flex flex-col items-center justify-center glass-card-sm transition-all group gap-1 hover:border-[#F9D0CD]/25"
          >
            <svg className="w-4 h-4 text-[#7a6570] group-hover:text-[#F9D0CD] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <span className="text-[9px] text-[#7a6570] group-hover:text-[#F9D0CD] transition-colors font-medium text-center leading-tight">
              Lihat semua →
            </span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

function Home() {
  const { fetchPhotos, fetchNotes } = useDrive();
  const [allPhotos, setAllPhotos] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useIsDesktop();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBday, setIsBday] = useState(false);

  const photos = allPhotos.slice(0, isDesktop ? 3 : 2);
  const notes = allNotes.slice(0, isDesktop ? 5 : 1);

  useEffect(() => {
    (async () => {
      try {
        const [p, n] = await Promise.all([fetchPhotos(), fetchNotes()]);
        setAllPhotos(p || []);
        setAllNotes(n || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [fetchPhotos, fetchNotes]);

  useEffect(() => {
    const tick = () => {
      const now = getEffectiveDate();
      setIsBday(isBirthdayToday(now));
      setTimeLeft(getBirthdayCountdown(now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const desktopNoteSlots = loading
    ? Array(5).fill(null)
    : [...notes, ...Array(Math.max(0, 5 - notes.length)).fill(null)];

  const sharedProps = { isBirthdayToday: isBday, timeLeft, loading, photos, notes, fmt };

  return (
    <div className="h-full overflow-hidden">
      <div className="hidden md:block h-full">
        <DesktopLayout {...sharedProps} desktopNoteSlots={desktopNoteSlots} />
      </div>
      <div className="md:hidden h-full">
        <MobileLayout {...sharedProps} />
      </div>
    </div>
  );
}

export default Home;
