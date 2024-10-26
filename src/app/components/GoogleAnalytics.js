// src/components/GoogleAnalytics.js
'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    const GA_ID = process.env.GA_ID; // Fetch GA_ID from environment variable
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    // Log GA_ID and environment to the console for verification
    console.log(`Google Analytics ID: ${GA_ID}`);
    console.log(`Environment: ${environment}`);

    // Only initialize GA if in production and GA_ID is available
    if (environment !== 'PRODUCTION' || !GA_ID || GA_ID === 'n/a') return;

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
