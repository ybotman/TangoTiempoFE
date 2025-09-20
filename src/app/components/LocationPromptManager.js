'use client';

import React from 'react';
import useLocationPrompt from '@/hooks/useLocationPrompt';
import LocationSelector from '@/components/LocationSelector';

/**
 * LocationPromptManager - Manages the location selection prompt
 * Shows LocationSelector dialog when user has no location selected
 */
const LocationPromptManager = () => {
  const { showLocationSelector, closeLocationSelector } = useLocationPrompt();
  
  return (
    <LocationSelector 
      open={showLocationSelector} 
      onClose={closeLocationSelector} 
    />
  );
};

export default LocationPromptManager;