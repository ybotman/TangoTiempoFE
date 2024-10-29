// src/app/hooks/useGoogleAnalytics.js
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useGoogleAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);
};

export const trackEvent = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
