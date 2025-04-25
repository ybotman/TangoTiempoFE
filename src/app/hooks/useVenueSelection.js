'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVenues } from './useVenues';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

/**
 * Custom hook for venue selection functionality
 * This hook integrates with GeoLocationContext and useVenues to provide
 * venue selection capabilities based on geographic context
 */
export function useVenueSelection() {
  const { venues, loading: venuesLoading, error: venuesError, fetchVenues } = useVenues();
  const { selectedLocation } = useGeoLocation();
  
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [venueCategory, setVenueCategory] = useState('all');
  const [useDivisionScope, setUseDivisionScope] = useState(false);
  
  // Filter venues based on location, category, and scope
  useEffect(() => {
    if (!venues || !Array.isArray(venues)) {
      setFilteredVenues([]);
      return;
    }
    
    // Filter based on coordinates first
    let validVenues = venues.filter(venue => 
      venue.latitude !== undefined && 
      venue.longitude !== undefined && 
      venue.latitude !== null && 
      venue.longitude !== null &&
      !isNaN(parseFloat(venue.latitude)) && 
      !isNaN(parseFloat(venue.longitude))
    );
    
    // Apply location filter based on mastered location IDs
    if (useDivisionScope && selectedLocation?.division?.id) {
      // Filter by division
      validVenues = validVenues.filter(venue => 
        venue.masteredDivisionId === selectedLocation.division.id
      );
    } else if (selectedLocation?.city?.id) {
      // Filter by city
      validVenues = validVenues.filter(venue => 
        venue.masteredCityId === selectedLocation.city.id
      );
    }
    
    // Apply venue category filter if not "all"
    if (venueCategory !== 'all') {
      validVenues = validVenues.filter(venue => 
        venue.venueCategory === venueCategory || 
        venue.eventCategory === venueCategory || 
        venue.primaryEventType === venueCategory
      );
    }
    
    setFilteredVenues(validVenues);
  }, [venues, selectedLocation, venueCategory, useDivisionScope]);
  
  // Function to select a venue
  const selectVenue = useCallback((venue) => {
    setSelectedVenue(venue);
    // Could also update global context here if needed
  }, []);
  
  // Function to clear venue selection
  const clearVenueSelection = useCallback(() => {
    setSelectedVenue(null);
  }, []);
  
  // Refresh venues (can be called when modal opens or filters change)
  const refreshVenues = useCallback(() => {
    if (selectedLocation?.city?.id) {
      fetchVenues();
    }
  }, [fetchVenues, selectedLocation]);
  
  // Handle venue category change
  const handleVenueCategoryChange = useCallback((category) => {
    setVenueCategory(category);
  }, []);
  
  // Handle scope switch change
  const handleScopeChange = useCallback((useDivision) => {
    setUseDivisionScope(useDivision);
  }, []);
  
  return {
    // Data
    venues,
    filteredVenues,
    selectedVenue,
    venueCategory,
    useDivisionScope,
    
    // Status
    loading: venuesLoading,
    error: venuesError,
    
    // Methods
    selectVenue,
    clearVenueSelection,
    refreshVenues,
    handleVenueCategoryChange,
    handleScopeChange,
    
    // Context dependency
    hasSelectedCity: !!selectedLocation?.city?.id
  };
}

export default useVenueSelection;