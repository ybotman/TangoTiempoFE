// UserLocationLoader.js
'use client';

import { useEffect } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useUsers } from '@/hooks/useUsers';

/**
 * Component that bridges user data with GeoLocationContext
 * Loads user's saved location preferences into the geo location context
 */
const UserLocationLoader = () => {
  const { loadUserMapPreferences } = useGeoLocation();
  const { userData } = useUsers();

  useEffect(() => {
    if (userData && loadUserMapPreferences) {
      // TIEMPO-276: Security cleanup - removed preferences logging
      loadUserMapPreferences(userData);
    }
  }, [userData, loadUserMapPreferences]);

  return null; // This is a logic-only component
};

export default UserLocationLoader;