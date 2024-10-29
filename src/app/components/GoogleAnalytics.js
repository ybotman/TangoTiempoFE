// src/components/ClientWrapper.js
'use client';

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

export default function GoogleClientWrapper({ children }) {
  useGoogleAnalytics();

  return <>{children}</>;
}
