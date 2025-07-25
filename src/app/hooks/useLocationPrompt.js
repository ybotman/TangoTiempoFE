'use client';

import { useState, useEffect, useContext } from 'react';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

/**
 * Hook to manage location selection prompting
 * Shows location selector when:
 * 1. User is logged in
 * 2. No location is selected
 * 3. Context is initialized
 * 4. User has no saved location preferences
 */
export const useLocationPrompt = () => {
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const { selectedLocation, isInitialized } = useGeoLocation();
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();
  
  useEffect(() => {
    // Check if user has saved location preferences
    const hasLocationPreferences = userData?.localUserInfo?.userDefaults && (
      // Has map center preferences
      (userData.localUserInfo.userDefaults.useCenterLocation && 
       userData.localUserInfo.userDefaults.defaultCenterLocation?.latitude) ||
      // Has city preferences
      (!userData.localUserInfo.userDefaults.useCenterLocation && 
       userData.localUserInfo.userDefaults.masteredCityIds?.length > 0)
    );
    
    // Only prompt logged-in users after context initialization who don't have preferences
    if (isInitialized && user && !selectedLocation.region?.id && !hasLocationPreferences) {
      console.log('useLocationPrompt: No location selected and no preferences, showing selector');
      setShowLocationSelector(true);
    } else if (selectedLocation.region?.id || hasLocationPreferences) {
      console.log('useLocationPrompt: Location selected or preferences exist:', {
        selectedCity: selectedLocation.city?.name,
        hasPreferences: hasLocationPreferences
      });
      setShowLocationSelector(false);
    }
  }, [isInitialized, user, selectedLocation.region?.id, selectedLocation.city?.name, userData]);
  
  const closeLocationSelector = () => {
    setShowLocationSelector(false);
  };
  
  return {
    showLocationSelector,
    closeLocationSelector
  };
};

export default useLocationPrompt;