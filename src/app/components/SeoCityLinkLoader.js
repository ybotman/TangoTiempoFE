'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const SeoCityLinkLoader = () => {
  const searchParams = useSearchParams();
  const { setSessionLocation } = useGeoLocation();
  const applied = useRef(false);

  useEffect(() => {
    if (!searchParams || applied.current || !setSessionLocation) return;

    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const radiusRaw = parseFloat(searchParams.get('radius'));
    const cityName = searchParams.get('cityName') || undefined;

    applied.current = true;
    setSessionLocation({
      lat,
      lng,
      zoomRange: Number.isFinite(radiusRaw) ? radiusRaw : 125,
      cityName,
      source: 'seo-city-link',
    }).catch(() => {});
  }, [searchParams, setSessionLocation]);

  return null;
};

export default SeoCityLinkLoader;
