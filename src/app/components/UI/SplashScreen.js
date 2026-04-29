'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Fade-in on every cold start. Total ~2.5s: 0.4s in, ~1.7s hold, 0.4s out.
// Must outlast initializeApiFailover health check timeout (2s max).
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Lock scrollbar during splash to prevent gutter shift
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => setVisible(true));
    const fadeOut = setTimeout(() => setVisible(false), 2100);
    const unmount = setTimeout(() => {
      document.body.style.overflow = '';
      setMounted(false);
    }, 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fadeOut);
      clearTimeout(unmount);
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes tt-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      >
        <Image
          src="/brand/Brand-Phrase-A-Dark-TALL-1.png"
          alt="TangoTiempo"
          width={256}
          height={564}
          priority
          style={{ maxHeight: '65vh', width: 'auto' }}
        />
        <div
          style={{
            marginTop: 28,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.15)',
            borderTopColor: 'rgba(255,255,255,0.8)',
            animation: 'tt-spin 0.8s linear infinite',
          }}
        />
      </div>
    </>
  );
}
