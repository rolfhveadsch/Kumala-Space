import { motion } from "framer-motion";

function Envelope({ next }) {
  return (
    <motion.div
      whileHover={{ scale:1.05 }}
      whileTap={{ scale:.95 }}
      onClick={next}
      className="cursor-pointer"
    >
      ✉️
      <p>Klik amplopnya</p>
    </motion.div>
  );
}

export default Envelope;