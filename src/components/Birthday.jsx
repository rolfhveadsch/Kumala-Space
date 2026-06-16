import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlitchButton from "./GlitchButton";

const Typewriter = ({ text, speed = 55, delayAfter = 2500, onComplete, className }) => {
  const [displayed, setDisplayed] = useState("");
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    let timeoutId;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) {
          timeoutId = setTimeout(onCompleteRef.current, delayAfter);
        }
      }
    }, speed);
    return () => { clearInterval(interval); if (timeoutId) clearTimeout(timeoutId); };
  }, [text, speed, delayAfter]);

  return <span className={className}>{displayed}</span>;
};

// step 0 → typewriter "Karna..."
// step 1 → typewriter "Hari ini adalah hari yang special buat lu."
// step 2 → h1 "Happy 18th Birthday!!" muncul
// step 3 → pesan + tombol muncul
function Birthday({ next }) {
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((s) => s + 1);

  return (
    <div
      className="text-center px-6 w-full max-w-2xl flex flex-col items-center justify-center min-h-[60vh] font-cormorant"
    >
      <AnimatePresence mode="wait">

        {/* Step 1 */}
        {step === 0 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 font-light"
          >
            <Typewriter
              text="Hari ini adalah hari yang special buat lu."
              onComplete={nextStep}
              speed={65}
              delayAfter={2500}
            />
          </motion.div>
        )}

        {/* Step 2 — Big title */}
        {step >= 1 && (
          <motion.div
            key="step2-onward"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="font-cormorant text-4xl md:text-6xl font-bold text-white mb-8 tracking-wide">
              Happy 18th Birthday!!
            </h1>

            {/* Message card — shows after 1.5s delay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
              className="mt-4 bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col items-center"
            >
              <p className="text-base md:text-lg text-gray-300 font-light leading-relaxed mb-10 text-justify">
                Sehat-sehat, panjang umur, dan semoga apa yang lu semogakan dan semua impian lu tercapai. Teruslah jadi anak yang paling disayang dan dibanggakan Aci. Kurangin OVT dan semacamnya itu, karna ya.... gaada bagusnya juga. Kalo lu butuh tempat buat cerita, curhat, ato mau ngelampiasin sesuatu, ada gua kok, yang siap dengerin semua itu, walopun... yaaaa, emang feedback dari guanya kureng sih, WKWKWK.
                <br /><br />
                Belajar juga buat nolak ato ilangin rasa ga enakan lu itu yang cuma bikin lu cape sendiri, sesekali coba lah tolak kalo emang itu tuh bikin lu terpaksa bat dan gaada salahnya juga kok buat nolak. Serius dah, pasti lu bakal ngerasa enak kalo sifat ga enakan lu itu gak over. Bukan berarti sifat ga enakan itu selamanya jelek, tapi ya JANGAN JADI GA ENAKAN DAH. Rayakan apa yang memang harus dirayakan, jan lupa BANYAKIN MINUM AER PUTIH!!!
              </p>

              <GlitchButton onClick={next} className="mt-4">
                Lanjut
              </GlitchButton>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default Birthday;