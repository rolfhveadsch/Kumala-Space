import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlitchButton from "./GlitchButton";

const Typewriter = ({ text, speed = 50, delayAfter = 2500, onComplete, onDoneTyping, suppressAutoAdvance = false, className }) => {
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
    // Intentionally exclude onDoneTyping from deps to avoid restarting when callbacks are re-created inline.
  }, [text, speed, delayAfter, suppressAutoAdvance]);

  return <span className={className}>{displayed}</span>;
};

const storyMessages = [
  { text: "Sososk anomali yang pethank-thank pethenk-thenk,.", delay: 3500 },
  { text: "kadang terlalu ga enakan,", delay: 2500 },
  { text: "suka galakin gua,", delay: 2500 },
  { text: "suka jahatin gua,", delay: 2500 },
  { text: "suka ngebully gua,", delay: 2500 },

  { text: "dan kadang, kalo lagi tantrum suka bilang...", delay: 3000 },
  { text: '"mau pny pcr."', delay: 2500, italic: true, nextButton: { required: true, position: 'below' } },

  { text: "...", delay: 2500 },

  { text: "Jujur, janggal...", delay: 2500 },
  { text: "Sesusah itu kah buat lu punya pcr?", delay: 2500 },
  { text: "Padahal banyak tuh di MiChat, Olx, Bukalapak, Blibli, Tokped, ama Shopee. Tinggal checkout", delay: 3500 },

  { text: "Tapi yaudah lah,", delay: 2500 },
  { text: "mungkin emang belom ketemu aja. Wkwkwk.", delay: 3500 },

  { text: "Dan di balik semua itu...", delay: 4000 },
  { text: "Ada satu hal yang selalu bikin gua respect ama lu.", delay: 3500 },

  { text: "Lu tumbuh dengan keadaan yang mungkin ga semua orang sanggup jalanin di dunia yang gonjrang ganjreng ini,", delay: 4000, nextButton: { required: true, position: 'below' } },

  { text: "Dari mulai lu kehilangan sosok ibu dari kecil,", delay: 3500 },
  { text: "berhadapan sama trauma yang ga semua orang tau,", delay: 3500 },
  { text: "ngurusin ini itu sendiri,", delay: 3000 },

  { text: "Sampe hari ini, lu memilih buat ada buat Aci.", delay: 3500 },
  { text: "Nemenin.", delay: 1500 },
  { text: "ngerawat.", delay: 1500 },
  { text: "ngebantu.", delay: 1500 },
  { text: "dan ngejaga beliau kapan pun dan di mana pun.", delay: 3000 },

  { text: "Sampe bikin gua mikir:", delay: 2500 },

  { text: '"HAH??? ANJIRD??? Serius?!?"', delay: 2500, italic: true },
  { text: '"Gua aja blom tentu bisa dah."', delay: 3000, italic: true },

  { text: "Jujur.", delay: 1500 },
  { text: "Gua respect.", delay: 3500 },

  { text: "Mungkin banyak orang yang ngeliat lu itu sebagai ceuwekhg anomali biasa.", delay: 3500 },

  { text: "But to me,", delay: 2500 },
  { text: "there's a kind of strength in you that not everyone has.", delay: 4000, nextButton: { required: true, position: 'below' } },

  { text: "Dan mungkin...", delay: 2500 },
  { text: "Itu salah satu alasan kenapa hari ini layak dirayakan.", delay: 4000 },
];

function Prolog({ next, nextButtonPosition = 'below', nextButtonsEnabled = false }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(false);
  const autoTimerRef = useRef(null);
  const showTimerRef = useRef(null);

  const nextStep = () => setStep((s) => s + 1);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(nextStep, 4000); 
      return () => clearTimeout(timer);
    }
    if (step === 4) {
      const timer = setTimeout(nextStep, 6500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    // clear any pending auto-advance timer whenever step changes
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
    setTyped(false);
  }, [step]);

  return (
    <div
      className="text-center px-6 w-full max-w-4xl flex flex-col items-center justify-center min-h-[60vh] font-cormorant"
    >
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            key="video-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="fixed inset-0 w-full h-full z-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <video
              src="/background.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-4xl text-gray-200 font-light"
          >
            <Typewriter text="Sebelum lanjut..." onComplete={nextStep} speed={70} delayAfter={3000} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-4xl text-gray-200 font-light"
          >
            <Typewriter text="Gua mau ngomong sesuatu dulu." onComplete={nextStep} speed={70} delayAfter={3000} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="text-2xl md:text-4xl text-gray-200 font-light"
          >
            <Typewriter text="Tentang seseorang bernama..." onComplete={nextStep} speed={70} delayAfter={8000} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="title-kumala"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h1 className="font-cormorant text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-widest">
              KUMALA
            </h1>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="title-kandi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl text-gray-400 font-medium tracking-widest uppercase text-center">
              Kandi Jiwaku Asmarantaka Wiseso
            </h2>
          </motion.div>
        )}

        {step >= 5 && (
          <motion.div
            key="text-sequence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center w-full relative z-10"
          >
            <div className="min-h-[150px] md:min-h-[200px] flex items-center justify-center w-full mt-2 relative z-20">
              <AnimatePresence mode="wait">
                {(() => {
                  const seqStart = 5;
                  const seqLen = storyMessages.length;
                  const idx = Math.min(Math.max(step - seqStart, 0), seqLen - 1);
                  const msg = storyMessages[idx];
                  const position = msg.nextButton?.position ?? nextButtonPosition;
                  const requiresNext = Boolean(msg.nextButton?.required ?? nextButtonsEnabled);
                  const showNext = typed && requiresNext;

                  return (
                    <motion.div
                      key={`desc-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className={`text-lg md:text-2xl text-gray-300 font-light leading-relaxed max-w-3xl ${msg.italic ? 'italic' : ''}`}
                    >
                      <div className="relative">
                        <Typewriter
                          text={msg.text}
                          speed={45}
                          delayAfter={msg.delay}
                          onDoneTyping={() => {
                            // show Next button after 2.5s (don't speed up typing)
                            if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
                            showTimerRef.current = setTimeout(() => { showTimerRef.current = null; setTyped(true); }, 2500);
                            if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
                            // start auto-advance only when message does NOT require manual Next
                            if (!requiresNext) {
                              autoTimerRef.current = setTimeout(() => { autoTimerRef.current = null; nextStep(); }, msg.delay);
                            }
                          }}
                          suppressAutoAdvance={true}
                        />
                        {position === 'overlay-right' && showNext && (
                          <GlitchButton
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            onClick={(e) => { e.stopPropagation(); if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; } if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; } nextStep(); }}
                            className="absolute top-2.5 right-2.5"
                          >
                            Next
                          </GlitchButton>
                        )}
                      </div>
                      {position === 'below' && showNext && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="flex justify-center mt-6">
                          <GlitchButton onClick={(e) => { e.stopPropagation(); if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; } if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; } nextStep(); }}>
                            Next
                          </GlitchButton>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {step >= 5 + storyMessages.length&& (
              <GlitchButton
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                onClick={next}
                className="mt-8"
              >
                Napa tuh???
              </GlitchButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Prolog;
