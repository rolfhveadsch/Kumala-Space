import { motion } from "framer-motion";
import GlitchButton from "./GlitchButton";

function Intro({ next }) {
  return (
    <div className="text-center flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1
          className="font-cormorant text-4xl md:text-5xl font-semibold text-white mb-10 tracking-wide"
        >
          EHHH, APAAN NIHHH ???
        </h1>
      </motion.div>

      <GlitchButton
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        onClick={next}
        className="mt-4"
      >
        Klik buat cari tau
      </GlitchButton>
    </div>
  );
}

export default Intro;