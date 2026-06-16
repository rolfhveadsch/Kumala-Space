import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

function GiftBox({ next }) {
  const [clicks, setClicks] = useState(0);
  const [stage, setStage] = useState(0); 
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [randomTarget1, setRandomTarget1] = useState(10);
  const [randomTarget2, setRandomTarget2] = useState(20);
  const controls = useAnimation();

  useEffect(() => {
    setRandomTarget1(Math.floor(Math.random() * 8) + 8); // 8 to 15
    setRandomTarget2(Math.floor(Math.random() * 15) + 15); // 15 to 29
  }, []);

  const handleClick = () => {
    if (isError) return;

    let targetClicks = 4;
    if (stage === 2) targetClicks = randomTarget1;
    if (stage === 3) targetClicks = randomTarget2;

    if (clicks < targetClicks - 1) {
      setClicks(clicks + 1);
      
      // Subtle shake
      controls.start({
        rotate: [-2, 2, -2, 2, 0],
        transition: { duration: stage >= 2 ? 0.1 : 0.2 } // Faster shake in later stages
      }).catch(() => {});
    } else if (clicks === targetClicks - 1) {
      if (stage === 0) {
        // First fake error
        setIsError(true);
        setErrorMessage("[SYSTEM_ERROR] ⚠️ Gagal membuka. Mengulang sistem...");
        
        controls.start({
          x: [-15, 15, -15, 15, -5, 5, 0],
          y: [-5, 5, -5, 5, 0],
          rotate: [-5, 5, -5, 5, 0],
          filter: ["contrast(1) hue-rotate(0deg)", "contrast(1.5) hue-rotate(90deg)", "contrast(2) hue-rotate(-90deg)", "contrast(1) hue-rotate(0deg)"],
          transition: { duration: 0.6 }
        }).catch(() => {});

        setTimeout(() => {
          setIsError(false);
          setClicks(0);
          setStage(1);
        }, 2500);
      } else if (stage === 1) {
        // Second fake error
        setIsError(true);
        setErrorMessage("Gagal buka kado, ulangin lagi yaa!! 😜");
        
        controls.start({
          scale: [1, 0.9, 1.1, 1],
          rotate: [-10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        }).catch(() => {});

        setTimeout(() => {
          setIsError(false);
          setClicks(0);
          setStage(2);
        }, 2500);
      } else if (stage === 2) {
        // Third fake error
        setIsError(true);
        setErrorMessage("Gagal lagi! KLIK LEBIH CEPAT LAGI!! 🔥🔥");
        
        controls.start({
          scale: [1, 1.2, 0.8, 1.1, 1],
          rotate: [-15, 15, -15, 15, 0],
          transition: { duration: 0.5 }
        }).catch(() => {});

        setTimeout(() => {
          setIsError(false);
          setClicks(0);
          setStage(3);
        }, 2500);
      } else {
        // Elegant pop open
        setIsError(true); // lock clicks during transition
        setClicks(clicks + 1);
        
        controls.start({
          scale: [1, 1.05, 0],
          opacity: [1, 1, 0],
          transition: { duration: 0.5, ease: "easeInOut" }
        }).catch(() => {});
        
        setTimeout(() => {
          next();
        }, 600);
      }
    }
  };

  const getHelperText = () => {
    if (stage === 0 || stage === 1) {
      return clicks < 4 ? `click to open (${clicks}/4)` : "opening...";
    } else if (stage === 2) {
      return `click as fast as you can! (${clicks})`;
    } else {
      return `FASTER!!! (${clicks})`;
    }
  };

  return (
    <div className="text-center flex flex-col items-center justify-center">
      <motion.div
        animate={controls}
        initial={{ scale: 1, opacity: 1 }}
        onClick={handleClick}
        className={`cursor-pointer relative mt-16 ${isError ? 'pointer-events-none' : ''}`}
        whileHover={!isError ? { scale: 1.03 } : {}}
        whileTap={!isError ? { scale: 0.97 } : {}}
      >
        <div className="relative w-56 h-64 flex flex-col items-center">
          
          <img 
            src="/giftbox.webp" 
            alt="Gift Box" 
            className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.7)]" 
          />

        </div>
      </motion.div>

      <div className="mt-12 h-10 flex items-center justify-center">
        {isError ? (
          <motion.p 
            key={errorMessage} // Forces animation to replay on new message
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-red-500 text-sm font-medium tracking-wide"
          >
            {errorMessage}
          </motion.p>
        ) : (
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
            {getHelperText()}
          </p>
        )}
      </div>
    </div>
  );
}

export default GiftBox;