import { useEffect } from 'react';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';

const MasteredLocationLogger = () => {
  const { nearestCity } = useMasteredLocation();

  useEffect(() => {
    console.log('Current MasteredLocationContext City:', nearestCity?.cityName || 'Unknown');
  }, [nearestCity]);

  return null;
};

export default MasteredLocationLogger;
