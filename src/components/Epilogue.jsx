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
  }, [text, speed, delayAfter, suppressAutoAdvance]);

  return <span className={className}>{displayed}</span>;
};

const epilogueMessages = [
  { text: "Ohh, iya...", delay: 500 },
  { text: "Ngomong-ngomong soal birthday ke 18.", delay: 2000 },
  { text: "Menurut gua.", delay: 2000 },
  { 
    text: "Umur dan birthday ke 18 itu special", 
    delay: 2500, 
    nextButton: { required: true, position: 'below', text: "Kenapa?" } 
  },
  { text: "Karena", delay: 1500 },
  { text: "Itu tuh fase terpenting dalam hidup", delay: 2000 },
  { text: "Masa dimana secara resmi, masa kanak-kanak lu berakhir", delay: 2000 },
  { text: "Ato kasarnya...", delay: 1500 },
  { text: "Lu uda bukan bocah kemaren sore lagi.", delay: 1500 },
  { text: "Wkwkwkwk", delay: 1500, nextButton: { required: true, position: 'below' } },
  { text: "Dan di umur 1 Abad...", delay: 1500 },
  { text: "Dikurang 8 dekade lebih 2 taun ini", delay: 1500 },
  { text: "Lu mulai punya hak sekaligus tanggung jawab penuh atas kehidupan lu sendiri", delay: 2500, nextButton: { required: true, position: 'below' } },
  { text: "Makanya gua bikin web ini...", delay: 1500 },
  { text: "Special buat birthday ke 18 lu.", delay: 1500 },
  { text: "Tempat buat lu nyimpen foto-foto berharga atau foto dengan momen-momen penting didalemnya, ketika storage hp lu uda penuh...", delay: 4000 },
  { text: "At0 sekedar buat bikin diary notes.", delay: 1500, nextButton: { required: true, position: 'below' } },
  { text: "Kedepannya, mungkin gua bakal nambahin game kuis didalemnya, AI ChatBot, atau beberapa fitur lain yang mungkin bisa berguna buat lu", delay: 3500 },
  { text: "(kalo ga sibuk, wkwk).", delay: 2500, nextButton: { required: true, position: 'below' } },
  { text: "Dan... klo semisalnya kita uda asing pun...", delay: 2500, italic: true },
  { text: "lu bakal tetep dapet birthday greeting secara otomatis lewat notif ato di greeting text yang ada di home page.", delay: 3500, italic: true, nextButton: { required: true, position: 'below' } },
  { text: "Karna mau gimana pun, kita pasti bakal disibukan dengan urusan masing-masing nantinya.", delay: 4000, nextButton: { required: true, position: 'below' } },
  { text: "Masalah privasi...", delay: 1500 },
  { text: "Tenang aja, cuma lu doang kok yang bisa akses web ini, dan gua juga gak bakal ngambil data apapun dari web ini.", delay: 4000, nextButton: { required: true, position: 'below' } },
  { text: "Dah, gitu aja sih dari gua.", delay: 2500 },
  { text: "Sekali lagi...", delay: 2500 },
];

function Epilogue({ next, nextButtonPosition = 'below', nextButtonsEnabled = false }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(false);
  const autoTimerRef = useRef(null);
  const showTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTyped(false);
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [step]);

  const nextStep = () => {
    setTyped(false);
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    if (next) next();
    else navigate('/');
  };

  return (
    <div className="text-center px-6 w-full max-w-3xl flex flex-col items-center justify-center min-h-[60vh] font-cormorant">
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
                suppressAutoAdvance={true}
                onDoneTyping={() => {
                  if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
                  showTimerRef.current = setTimeout(() => {
                    showTimerRef.current = null;
                    setTyped(true);
                  }, 2500);

                  if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
                  const requiresNext = Boolean(epilogueMessages[step].nextButton?.required ?? nextButtonsEnabled);
                  if (!requiresNext) {
                    autoTimerRef.current = setTimeout(() => {
                      autoTimerRef.current = null;
                      nextStep();
                    }, epilogueMessages[step].delay);
                  }
                }}
              />

              {(() => {
                const config = epilogueMessages[step].nextButton;
                const position = config?.position ?? nextButtonPosition;
                const requiresNext = Boolean(config?.required ?? nextButtonsEnabled);
                const buttonLabel = config?.text ?? "Next"; // Ambil teks kustom atau default
                const showNext = typed && requiresNext;

                if (!showNext) return null;

                const buttonContent = (
                  <GlitchButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
                      if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
                      nextStep();
                    }}
                  >
                    {buttonLabel}
                  </GlitchButton>
                );

                if (position === 'overlay-right') {
                  return (
                    <div className="absolute top-2.5 right-2.5">
                      {buttonContent}
                    </div>
                  );
                }
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="flex justify-center mt-6"
                  >
                    {buttonContent}
                  </motion.div>
                );
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