'use client';
import { useState, useEffect } from 'react';

// Fully opaque from frame 0 — no fade-in so content shifts behind it are invisible.
// Fades OUT at 2.1s over 400ms then unmounts.
export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const fadeOut = setTimeout(() => setVisible(false), 2100);
    const unmount = setTimeout(() => setMounted(false), 2500);
    return () => { clearTimeout(fadeOut); clearTimeout(unmount); };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`@keyframes tt-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#1a1a2e',
          backgroundImage: 'url(/brand/Brand-Phrase-A-Dark-TALL-1.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center 40%',
          backgroundSize: 'auto 62vh',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', bottom: '16%', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.15)',
            borderTopColor: 'rgba(255,255,255,0.8)',
            animation: 'tt-spin 0.8s linear infinite',
          }} />
        </div>
      </div>
    </>
  );
}
