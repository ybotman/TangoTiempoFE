'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVenues } from './useVenues';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useUsers } from './useUsers';

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude from degrees to radians
  const toRad = value => value * Math.PI / 180;
  const radLat1 = toRad(lat1);
  const radLon1 = toRad(lon1);
  const radLat2 = toRad(lat2);
  const radLon2 = toRad(lon2);
  
  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Earth's radius in miles
  const radius = 3958.8; // miles (6371 km for kilometers)
  
  // Calculate the distance
  return radius * c;
}

/**
 * Custom hook for venue selection functionality
 * This hook integrates with GeoLocationContext and useVenues to provide
 * venue selection capabilities based on geographic context.
 *
 * In city view mode, venues are filtered based on radius proximity from the
 * selected city's coordinates. In division view mode, venues are filtered
 * based on matching masteredDivisionId.
 */
export function useVenueSelection() {
  const { venues, loading: venuesLoading, error: venuesError, fetchVenues } = useVenues();
  const { selectedLocation } = useGeoLocation();
  const { userData } = useUsers();
  
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [venueCategory, setVenueCategory] = useState('all');
  // Always use city view with radius filtering (keep for API compatibility)
  const [useDivisionScope, setUseDivisionScope] = useState(false);
  
  // Get radius from user preferences or default to 50
  const userDefaults = userData?.localUserInfo?.userDefaults;
  const [radiusMiles, setRadiusMiles] = useState(userDefaults?.defaultZoomRange || 50);
  
  // Filter venues based on location, category, scope, and radius
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

    if (useDivisionScope && selectedLocation?.division?.id) {
      // Filter by division ID when in division scope mode
      validVenues = validVenues.filter(venue =>
        venue.masteredDivisionId === selectedLocation.division.id
      );
    } else if (radiusMiles > 0) {
      // Use user's map center location preferences if available
      const defaultCenter = userDefaults?.defaultCenterLocation;
      let centerLat, centerLng;
      
      if (defaultCenter?.latitude && defaultCenter?.longitude) {
        // Use saved map center location
        centerLat = parseFloat(defaultCenter.latitude);
        centerLng = parseFloat(defaultCenter.longitude);
      } else if (selectedLocation?.city?.latitude && selectedLocation?.city?.longitude) {
        // Fallback to selected city if no saved preferences
        centerLat = parseFloat(selectedLocation.city.latitude);
        centerLng = parseFloat(selectedLocation.city.longitude);
      }
      
      if (centerLat && centerLng) {
        validVenues = validVenues.filter(venue => {
          const venueLat = parseFloat(venue.latitude);
          const venueLng = parseFloat(venue.longitude);

          const distance = calculateDistance(centerLat, centerLng, venueLat, venueLng);
          return distance <= radiusMiles;
        });
      }
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
  }, [venues, selectedLocation, venueCategory, useDivisionScope, radiusMiles, userDefaults]);
  
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
  
  // Handle radius change
  const handleRadiusChange = useCallback((radius) => {
    setRadiusMiles(radius);
  }, []);
  
  return {
    // Data
    venues,
    filteredVenues,
    selectedVenue,
    venueCategory,
    useDivisionScope,
    radiusMiles,
    
    // Status
    loading: venuesLoading,
    error: venuesError,
    
    // Methods
    selectVenue,
    clearVenueSelection,
    refreshVenues,
    handleVenueCategoryChange,
    handleScopeChange,
    handleRadiusChange,
    
    // Context dependency
    hasSelectedCity: !!selectedLocation?.city?.id
  };
}

export default useVenueSelection;