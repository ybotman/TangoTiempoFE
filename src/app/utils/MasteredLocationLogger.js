import { useEffect } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const MasteredLocationLogger = () => {
  const { selectedLocation } = useGeoLocation();

  useEffect(() => {
    console.log('Current GeoLocationContext City:', selectedLocation?.city?.name || 'Unknown');
  }, [selectedLocation]);

  return null;
};

export default MasteredLocationLogger;
