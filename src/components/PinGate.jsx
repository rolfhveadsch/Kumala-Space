// CHANGED: xs breakpoint PIN inputs (w-9), tighter gaps for Z Fold 344px, responsive card padding
/* PinGate — glass PIN screen; slang copy (excluded from birthday-page). */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

function PinGate({ onSuccess }) {
  const [pin, setPin] = useState(Array(6).fill(""));
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef([]);

  const CORRECT_PIN = "180608"; // 18 December 2007 - Kumala's 18th Birthdate

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    setError(false);
    
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      setError(false);
      if (!pin[index] && index > 0) {
        // Focus previous input on backspace if current is empty
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
        inputsRef.current[index - 1].focus();
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      setError(false);
      setPin(pastedData.split(""));
      inputsRef.current[5].focus();
    }
  };

  useEffect(() => {
    // Check PIN completeness
    if (pin.every((char) => char !== "")) {
      const enteredPin = pin.join("");
      if (enteredPin === CORRECT_PIN) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setError(true);
        setPin(Array(6).fill(""));
        inputsRef.current[0].focus();
      }
    }
  }, [pin, onSuccess]);

  return (
    <div className="glass-app glass-page-bg relative min-h-screen overflow-hidden text-[#ededed] font-sans">
      <ParticleBackground />

      <div className="absolute inset-0 flex items-center justify-center p-3 xs:p-4 safe-top z-10">
        <div className="w-full max-w-[320px] xs:max-w-xs sm:max-w-sm md:max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-5 sm:p-8 shadow-2xl"
          >
            <div className="flex justify-center mb-5 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F9D0CD]/5 border border-[#4B3D3F] rounded-full flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
              </div>
            </div>

            <h2 
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight"
              style={{ fontFamily: '"Trajan Pro", "Times New Roman", serif' }}
            >
              Kumala Space
            </h2>
            <p className="text-[#7a6570] text-xs sm:text-sm mb-6 sm:mb-8 px-1">
              Mastiin dulu kalo ini beneran lu yang ultah — masukin 6 digit kodenya bre.
            </p>

            <motion.div 
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 mb-6 sm:mb-8"
            >
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className={`w-9 h-11 xs:w-10 xs:h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-lg sm:text-2xl font-bold bg-[#2D2328] border rounded-xl outline-none transition-all flex-shrink-0 ${
                    success
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : error
                      ? "border-red-500 text-red-400 bg-red-500/10"
                      : "border-[#4B3D3F] focus:border-[#F9D0CD]/50 text-white"
                  }`}
                  disabled={success}
                />
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {success && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-xs sm:text-sm font-medium"
                >
                  Akses granted bestie! Welcome to the party ✨
                </motion.p>
              )}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs sm:text-sm font-medium"
                >
                  Kode salah bre — coba cek lagi ya.
                </motion.p>
              )}
              {!success && !error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-[#4B3D3F] text-[10px] sm:text-xs italic"
                >
                  Hint: tanggal ultah Kumala (DDMMYY)
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PinGate;
