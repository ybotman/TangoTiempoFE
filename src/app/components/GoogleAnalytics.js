// src/components/GoogleAnalytics.js
'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    const GA_ID = 'G-6KGB3S21KH'; // Hard-coded GA ID
    if (!GA_ID) return;

    // Insert Google Analytics script
    const script1 = document.createElement('script');
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { page_path: window.location.pathname });
    `;
    document.head.appendChild(script2);
  }, []);

  return null;
}
