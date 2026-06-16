import Confetti from "react-confetti";
import { motion } from "framer-motion";
import GlitchButton from "./GlitchButton";

function FinalGift({ next }) {
  return (
    <div className="text-center px-6 flex flex-col items-center justify-center h-full max-w-2xl">
      <Confetti recycle={false} numberOfPieces={300} gravity={0.2} colors={['#ffffff', '#fcd34d', '#f87171', '#60a5fa']} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-14 rounded-2xl shadow-2xl"
      >
        <h1 className="font-cormorant text-3xl md:text-5xl font-bold text-white mb-6 tracking-wide">
          Surprise!
        </h1>

        <div className="flex justify-center mb-6">
          <img
            src="/qr-dana.webp"
            alt="QR DANA Kaget"
            className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border-2 border-gray-700 p-2 bg-white"
          />
        </div>

        <div className="font-cormorant text-xl md:text-2xl font-medium text-gray-200 mb-6">
          SCAN DAGET BUAT NGOPI
        </div>

        <p className="font-cormorant mt-6 text-base md:text-lg text-gray-400 font-light leading-relaxed">
          Sorry, isinya bukan benda ato apapun itu yang berharga, tapi ya... cuma bisa traktir lu sekali ngopi doang, WKWKWK. Tapi, mending AER PUTIH SIH...
        </p>

        <div className="mt-8 flex justify-center">
          <GlitchButton onClick={next}>Next...</GlitchButton>
        </div>
      </motion.div>
    </div>
  );
}

export default FinalGift;