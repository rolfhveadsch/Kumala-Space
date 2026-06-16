import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDrive } from './hooks/useDrive';
import AuthGate from './components/AuthGate';
import Sidebar from './components/Sidebar';
import PhotoGallery from './components/PhotoGallery';
import DiaryNotes from './components/DiaryNotes';

function App() {
  const { isReady, isSignedIn, signIn, signOut } = useDrive();

  if (!isSignedIn) {
    return <AuthGate onSignIn={signIn} isReady={isReady} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#080808] overflow-hidden">
        <Sidebar onSignOut={signOut} />

        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/gallery" replace />} />
            <Route path="/gallery" element={<PhotoGallery />} />
            <Route path="/notes" element={<DiaryNotes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
