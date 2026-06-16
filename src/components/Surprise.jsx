import { motion } from "framer-motion";
import GlitchButton from "./GlitchButton";

function Surprise({ next }) {
  return (
    <div className="text-center flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-cormorant text-4xl md:text-5xl font-semibold text-white mb-10 tracking-wide"
      >
        Gua punya sesuatu buat lu...
      </motion.h1>

      <GlitchButton
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={next}
        className="mt-4"
      >
        Apaan tuh?
      </GlitchButton>
    </div>
  );
}

export default Surprise;