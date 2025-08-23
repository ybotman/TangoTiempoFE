import { useEffect } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const MasteredLocationLogger = () => {
  const { selectedLocation } = useGeoLocation();

  useEffect(() => {
    // TIEMPO-276: Security cleanup - removed location logging
  }, [selectedLocation]);

  return null;
};

export default MasteredLocationLogger;
