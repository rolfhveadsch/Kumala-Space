import { motion } from 'framer-motion';

function GlitchButton({ children, onClick, className = "", ...props }) {
  return (
    <motion.button
      onClick={onClick}
      className={`group relative px-4 md:px-8 py-2 md:py-3 text-sm md:text-base bg-transparent text-white/80 font-medium uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 hover:text-white ${className}`}
      {...props}
    >
      {/* Corner Brackets */}
      <span className="absolute top-0 left-0 w-2 h-2 md:w-3 md:h-3 border-t-[2px] border-l-[2px] border-white/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 md:group-hover:w-4 md:group-hover:h-4 group-hover:border-white pointer-events-none"></span>
      <span className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 border-t-[2px] border-r-[2px] border-white/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 md:group-hover:w-4 md:group-hover:h-4 group-hover:border-white pointer-events-none"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 md:w-3 md:h-3 border-b-[2px] border-l-[2px] border-white/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 md:group-hover:w-4 md:group-hover:h-4 group-hover:border-white pointer-events-none"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 border-b-[2px] border-r-[2px] border-white/50 transition-all duration-300 group-hover:w-3 group-hover:h-3 md:group-hover:w-4 md:group-hover:h-4 group-hover:border-white pointer-events-none"></span>
      
      {/* Text with glitch effect */}
      <span className="relative z-10 transition-all duration-300 [text-shadow:1px_0px_0px_rgba(0,255,255,0.3),-1px_0px_0px_rgba(255,0,36,0.3)] group-hover:[text-shadow:0px_0px_8px_rgba(255,255,255,0.6)]">
        {children}
      </span>
    </motion.button>
  );
}

export default GlitchButton;
