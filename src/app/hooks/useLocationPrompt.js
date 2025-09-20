'use client';

import { useState, useEffect } from 'react';

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
  // Dependencies removed; selector currently managed via defaults
  
  useEffect(() => {
    // Never show the location selector - use defaults
    setShowLocationSelector(false);
  }, []);
  
  const closeLocationSelector = () => {
    setShowLocationSelector(false);
  };
  
  return {
    showLocationSelector,
    closeLocationSelector
  };
};

export default useLocationPrompt;
