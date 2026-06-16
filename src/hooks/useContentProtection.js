import { useEffect, useState } from 'react';

/**
 * Custom Hook: useContentProtection
 * Menangani semua event listener untuk mencegah pencurian konten (teks, gambar, shortcut).
 * Dilengkapi dengan auto-cleanup untuk mencegah memory leak.
 */
export function useContentProtection({ enabled = true, onViolation } = {}) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Blokir Context Menu (Klik Kanan)
    const handleContextMenu = (e) => {
      // Izinkan klik kanan pada elemen input/textarea agar fitur paste default OS tetap jalan jika dibutuhkan
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
      if (!isInput) {
        e.preventDefault();
        onViolation?.('contextmenu');
      }
    };

    // 2. Blokir Copy, Cut, Paste (Kecuali di dalam Form Input)
    const handleCopyCutPaste = (e) => {
      const activeEl = document.activeElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(activeEl?.tagName) || activeEl?.isContentEditable;
      if (!isInput) {
        e.preventDefault();
        onViolation?.(e.type); // e.type = 'copy' | 'cut' | 'paste'
      }
    };

    // 3. Blokir Select Start & Drag Start
    const handleSelectStart = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
      if (!isInput) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e) => {
      // Memblokir drag untuk semua elemen, termasuk gambar
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (!isInput) {
        e.preventDefault();
        onViolation?.('drag');
      }
    };

    // 4. Blokir Keyboard Shortcuts (Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+U, F12, PrintScreen)
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(activeEl?.tagName) || activeEl?.isContentEditable;
      
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // F12 atau Ctrl+U (View Source) - Dilarang keras dimana saja
      if (key === 'f12' || (isCtrlOrCmd && key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        onViolation?.('devtools');
        return;
      }

      // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+P (Kecuali sedang mengetik di dalam input)
      if (!isInput && isCtrlOrCmd && ['c', 'x', 'a', 'p', 's'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        onViolation?.('shortcut');
        return;
      }

    };



    // 5. Override window.print() untuk menggagalkan print to PDF / print page
    const originalPrint = window.print;
    window.print = function () {
      onViolation?.('print');
      return false; // Prevent print execution
    };

    // 6. Deteksi DevTools terbuka (Heuristik membandingkan outerWidth dan innerWidth)
    const detectDevTools = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      
      // Jika selisih > 160px, asumsi DevTools/Panel terbuka di samping atau bawah
      // (Bisa juga dipicu oleh zoom yang ekstrem, jadi gunakan dengan hati-hati)
      if (widthDiff > 160 || heightDiff > 160) {
         onViolation?.('devtools_open');
      }
    }, 1500);

    // Registrasi Event Listeners dengan passive: false agar preventDefault bekerja
    const options = { passive: false, capture: true };
    document.addEventListener('contextmenu', handleContextMenu, options);
    document.addEventListener('copy', handleCopyCutPaste, options);
    document.addEventListener('cut', handleCopyCutPaste, options);
    document.addEventListener('paste', handleCopyCutPaste, options);
    document.addEventListener('selectstart', handleSelectStart, options);
    document.addEventListener('dragstart', handleDragStart, options);
    document.addEventListener('keydown', handleKeyDown, options);

    // Proteksi Ekstra: Set draggable="false" ke semua gambar yang sudah ada di DOM
    const images = document.querySelectorAll('img');
    images.forEach(img => img.setAttribute('draggable', 'false'));

    // Cleanup function untuk mencegah memory leak saat komponen unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, options);
      document.removeEventListener('copy', handleCopyCutPaste, options);
      document.removeEventListener('cut', handleCopyCutPaste, options);
      document.removeEventListener('paste', handleCopyCutPaste, options);
      document.removeEventListener('selectstart', handleSelectStart, options);
      document.removeEventListener('dragstart', handleDragStart, options);
      document.removeEventListener('keydown', handleKeyDown, options);
      
      window.print = originalPrint; // Kembalikan fungsi original
      clearInterval(detectDevTools);
    };
  }, [enabled, onViolation]);

  return {};
}
