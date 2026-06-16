import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlitchButton from "./GlitchButton";

const Typewriter = ({ text, speed = 45, delayAfter = 3000, onComplete, onDoneTyping, suppressAutoAdvance = false, className }) => {
  const [displayed, setDisplayed] = useState("");

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const onDoneTypingRef = useRef(onDoneTyping);
  useEffect(() => { onDoneTypingRef.current = onDoneTyping; }, [onDoneTyping]);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    let timeoutId;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDoneTypingRef.current) onDoneTypingRef.current();
        if (!suppressAutoAdvance && onCompleteRef.current) {
          timeoutId = setTimeout(onCompleteRef.current, delayAfter);
        }
      }
    }, speed);
    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // exclude onDoneTyping from deps to avoid restarting when inline callbacks change
  }, [text, speed, delayAfter, suppressAutoAdvance]);

  return <span className={className}>{displayed}</span>;
};

const epilogueMessages = [
  {
    text: "Ohh, iya... Gua juga buatin web-pribadi ini special buat 18th birthday lu ini.",
    delay: 3500,
  },
  {
    text: "Dimana, birthday ke 18 itu menurut gua adalah masa atau fase terpenting dalam hidup kita, karena secara resmi itu menandai berakhirnya masa kanak-kanak atau remaja, dan dimulainya fase dewasa.",
    delay: 4500,
  },
  {
    text: "Dan di umur ini tuh, seseorang mulai punya hak sekaligus tanggung jawab hukum yang penuh atas kehidupannya.",
    delay: 3500, nextButton: { required: true, position: 'below' }
  },
  {
    text: "Gua bikin web ini khusus buat lu nyimpen beberapa foto dengan momen-momen yang berharga ato penting buat lu, bikin diary notes...",
    delay: 4000,
  },
  {
    text: "Dan mungkin, buat update kedepannya gua bakal nambahin game kuis didalemnya, AI ChatBot, atau beberapa fitur lain yang mungkin bisa berguna buat lu (kalo ga sibuk, wkwk).",
    delay: 4000, nextButton: { required: true, position: 'below' }
  },
  {
    text: "Dan... klo semisalnya kita uda asing... lu bakal tetep dapet birthday greeting secara otomatis lewat notif ato di greeting text yang ada di home page.",
    delay: 4000,
    italic: true,
    nextButton: { required: true, position: 'below' }
  },
  {
    text: "Karna mau gimana juga, kita pasti bakal disibukan dengan hal-hal yang gabisa lepas dari hidup kita.",
    delay: 4000,
    nextButton: { required: true, position: 'below' }
  },
  {
    text: "Masalah privasi... tenang aja, cuma lu doang kok yang bisa akses web ini, dan gua juga gak bakal ngambil data apapun dari web ini.",
    delay: 4500,
    nextButton: { required: true, position: 'below' }
  },
  {
    text: "Dah, gitu aja sih dari gua.",
    delay: 2500,
  },
  {
    text: "Sekali lagi...",
    delay: 2500,
  },
];

function Epilogue({ next, nextButtonPosition = 'below', nextButtonsEnabled = false }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(false);
  const autoTimerRef = useRef(null);
  const showTimerRef = useRef(null);
  const navigate = useNavigate();

  const nextStep = () => setStep((s) => s + 1);

  const handleFinish = () => {
    if (next) next();
    else navigate('/');
  };

  return (
    <div
      className="text-center px-6 w-full max-w-3xl flex flex-col items-center justify-center min-h-[60vh] font-cormorant"
    >
      <AnimatePresence mode="wait">
        {step < epilogueMessages.length && (
          <motion.div
            key={`epilogue-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className={`text-lg md:text-2xl text-gray-300 font-light leading-relaxed ${epilogueMessages[step].italic ? "italic" : ""}`}
          >
            <div className="relative">
              <Typewriter
                text={epilogueMessages[step].text}
                speed={45}
                delayAfter={epilogueMessages[step].delay}
                onDoneTyping={() => {
                  if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
                  showTimerRef.current = setTimeout(() => { showTimerRef.current = null; setTyped(true); }, 2500);
                  if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
                  const requiresNext = Boolean(epilogueMessages[step].nextButton?.required ?? nextButtonsEnabled);
                  if (!requiresNext) {
                    autoTimerRef.current = setTimeout(() => { autoTimerRef.current = null; nextStep(); }, epilogueMessages[step].delay);
                  }
                }}
                suppressAutoAdvance={true}
              />

              {/* per-message next button */}
              {(() => {
                const position = epilogueMessages[step].nextButton?.position ?? nextButtonPosition;
                const requiresNext = Boolean(epilogueMessages[step].nextButton?.required ?? nextButtonsEnabled);
                const showNext = typed && requiresNext;
                if (position === 'overlay-right' && showNext) {
                  return (
                    <GlitchButton
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      onClick={(e) => { e.stopPropagation(); if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; } if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; } nextStep(); }}
                      className="absolute top-2.5 right-2.5"
                    >
                      Next
                    </GlitchButton>
                  );
                }
                if (position !== 'overlay-right' && showNext) {
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="flex justify-center mt-6">
                      <GlitchButton onClick={(e) => { e.stopPropagation(); if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; } if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; } nextStep(); }}>
                        Next
                      </GlitchButton>
                    </motion.div>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>
        )}

        {step >= epilogueMessages.length && (
          <motion.div
            key="epilogue-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-lg md:text-2xl text-gray-400 font-light italic">
              — Selamat Ulang Tahun ke-18. 
            </p>
            <GlitchButton onClick={handleFinish}>
              Klik buat masuk ke halaman web lu
            </GlitchButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Epilogue;
