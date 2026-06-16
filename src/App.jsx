/* App routing — BirthdayNotification on all routes except /18birthday; birthday flow uses #birthday-18. */
import { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { useDrive } from "./hooks/useDrive";
import AuthGate from "./components/AuthGate";
import PersonalSpace from "./components/PersonalSpace";
import ParticleBackground from "./components/ParticleBackground";
import PinGate from "./components/PinGate";
import AntiCopy from "./components/AntiCopy";
import BirthdayNotification from "./components/BirthdayNotification";

// ── Scene components ──────────────────────────────────────
import Intro from "./components/Intro";
import Prolog from "./components/Prolog";
import Birthday from "./components/Birthday";
import Surprise from "./components/Surprise";
import GiftBox from "./components/GiftBox";
import FinalGift from "./components/FinalGift";
import Epilogue from "./components/Epilogue";

// ── Birthday Flow ─────────────────────────────────────────
function BirthdayFlow() {
  const navigate = useNavigate();
  const [scene, setScene] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    if (scene === 2 && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [scene]);

  const finishBirthday = () => {
    localStorage.setItem("birthdayDone", "true");
    navigate("/");
  };

  return (
    <AntiCopy className="w-full min-h-screen">
      <div id="birthday-18" className="birthday-page w-full min-h-screen flex items-center justify-center bg-[#000000] text-[#ededed] font-sans overflow-hidden">
        <ParticleBackground />
        <audio ref={audioRef} src="/soundtrack.mp3" loop />
        <div className="w-full flex justify-center p-6 relative z-10">
          {scene === 1 && <Intro next={() => setScene(2)} />}
          {scene === 2 && <Prolog next={() => setScene(3)} />}
          {scene === 3 && <Birthday next={() => setScene(4)} />}
          {scene === 4 && <Surprise next={() => setScene(5)} />}
          {scene === 5 && <GiftBox next={() => setScene(6)} />}
          {scene === 6 && <FinalGift next={() => setScene(7)} />}
          {scene === 7 && <Epilogue next={finishBirthday} />}
        </div>
      </div>
    </AntiCopy>
  );
}

// ── Root App with auth gate ───────────────────────────────
function AppContent() {
  const { isReady, isSignedIn, signIn, signOut } = useDrive();
  const navigate = useNavigate();
  const location = useLocation();

  const birthdayDone = localStorage.getItem("birthdayDone") === "true";
  const pinVerified = sessionStorage.getItem("pinVerified") === "true";
  const isBirthdayExperience = location.pathname.startsWith("/18birthday");

  return (
    <>
      {!isBirthdayExperience && <BirthdayNotification />}
    <Routes>
      {/* PIN Gate Route */}
      <Route 
        path="/pin" 
        element={
          birthdayDone ? (
            <Navigate to="/" replace />
          ) : pinVerified ? (
            <Navigate to="/18birthday" replace />
          ) : (
            <PinGate onSuccess={() => {
              sessionStorage.setItem("pinVerified", "true");
              navigate("/18birthday");
            }} />
          )
        } 
      />

      {/* Birthday Experience Route */}
      <Route 
        path="/18birthday" 
        element={
          birthdayDone || pinVerified ? (
            <BirthdayFlow />
          ) : (
            <Navigate to="/pin" replace />
          )
        } 
      />

      {/* Personal space — requires Google auth */}
      <Route 
        path="/*" 
        element={
          !birthdayDone ? (
            <Navigate to="/pin" replace />
          ) : !isSignedIn ? (
            <AuthGate onSignIn={signIn} isReady={isReady} />
          ) : (
            <PersonalSpace onSignOut={signOut} />
          )
        } 
      />
    </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;