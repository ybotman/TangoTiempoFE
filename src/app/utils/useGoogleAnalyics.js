// src/utils/hooks/useGoogleAnalytics.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useGoogleAnalytics = () => {
  const GA_ID = 'G-6KGB3S21KH'; // Hard-coded GA ID
  const router = useRouter();

  useEffect(() => {
    if (!GA_ID) return;

    // Track route changes as pageviews
    const handleRouteChange = (url) => {
      window.gtag('config', GA_ID, {
        page_path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [GA_ID, router.events]);
};

export const trackEvent = ({ action, category, label, value }) => {
  const GA_ID = 'G-6KGB3S21KH'; // Hard-coded GA ID
  if (!GA_ID) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
