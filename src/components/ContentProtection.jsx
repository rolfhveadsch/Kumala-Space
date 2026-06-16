import { useState } from 'react';
import { useContentProtection } from '../hooks/useContentProtection';
import '../styles/content-protection.css'; // Sesuaikan path ini jika Anda menyimpannya di tempat lain

/**
 * Komponen Wrapper ContentProtection
 * Membungkus children dengan proteksi penuh terhadap seleksi, copy, drag, context menu, dan screenshot.
 * 
 * @param {ReactNode} children Konten yang akan dilindungi
 * @param {boolean} showWarning Menentukan apakah alert/toast muncul saat terjadi pelanggaran
 * @param {boolean} enabled Toggle on/off proteksi
 */
export default function ContentProtection({ children, showWarning = true, enabled = true }) {
  const [warningMsg, setWarningMsg] = useState('');
  
  // Handler untuk mengelola respons jika terdeteksi aktivitas mencurigakan
  const handleViolation = (type) => {
    if (!showWarning) return;
    
    let msg = 'Tindakan ini tidak diizinkan pada halaman ini.';
    if (type === 'contextmenu') msg = 'Klik kanan dinonaktifkan demi privasi.';
    if (type === 'shortcut') msg = 'Shortcut keyboard dinonaktifkan untuk keamanan.';
    if (type === 'devtools' || type === 'devtools_open') msg = 'Developer tools tidak diizinkan.';
    if (type === 'copy' || type === 'cut') msg = 'Menyalin teks dinonaktifkan.';
    if (type === 'drag') msg = 'Menyeret gambar atau teks dinonaktifkan.';
    if (type === 'print') msg = 'Pencetakan dokumen tidak diizinkan.';
    
    setWarningMsg(msg);
    
    // Hilangkan toast setelah 3 detik
    setTimeout(() => setWarningMsg(''), 3000);
  };

  // Aktivasi custom hook
  useContentProtection({ 
    enabled, 
    onViolation: handleViolation 
  });

  // Jika proteksi dimatikan via props, render normal tanpa proteksi
  if (!enabled) return <>{children}</>;

  return (
    <div className="content-protection-wrapper relative min-h-full w-full">
      {/* 
        Container utama. 
        Note: Gambar (img) di dalam container ini otomatis akan tercover oleh overlay .image-protect-wrap 
        jika Anda menggunakan class tersebut pada tag img.
      */}
      {children}
      
      {/* 
        Toast Warning 
        Muncul di bawah layar jika user mencoba menyalin, klik kanan, dll.
      */}
      {showWarning && warningMsg && (
        <div className="protection-toast">
          {warningMsg}
        </div>
      )}

    </div>
  );
}
