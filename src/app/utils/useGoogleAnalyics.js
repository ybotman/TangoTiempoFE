// src/utils/useGoogleAnalytics.js

/*  // Example event handler inside your FullCalendar setup

calendar.on('eventClick', function(info) {
  trackEvent({
    action: 'click_event',
    category: 'Calendar',
    label: info.event.title,
    value: info.event.id
  });

  // Other code for event click...
});
*/

import { useEffect } from 'react';
import { useRouter } from 'next/router';
export const useGoogleAnalytics = () => {
  const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const router = useRouter();

  useEffect(() => {
    if (!GA_ID) return;

    // Insert the Google Analytics script
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

    // Track page views on route changes
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
  const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!GA_ID) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
