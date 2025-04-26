'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVenues } from './useVenues';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

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
 * venue selection capabilities based on geographic context
 */
export function useVenueSelection() {
  const { venues, loading: venuesLoading, error: venuesError, fetchVenues } = useVenues();
  const { selectedLocation } = useGeoLocation();
  
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [venueCategory, setVenueCategory] = useState('all');
  const [useDivisionScope, setUseDivisionScope] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(200); // Default radius of 200 miles
  
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
    
    // Apply radius filter if city has coordinates and not using division scope
    if (!useDivisionScope && 
        selectedLocation?.city?.latitude && 
        selectedLocation?.city?.longitude && 
        radiusMiles > 0) {
      
      const cityLat = parseFloat(selectedLocation.city.latitude);
      const cityLng = parseFloat(selectedLocation.city.longitude);
      
      validVenues = validVenues.filter(venue => {
        const venueLat = parseFloat(venue.latitude);
        const venueLng = parseFloat(venue.longitude);
        
        const distance = calculateDistance(cityLat, cityLng, venueLat, venueLng);
        return distance <= radiusMiles;
      });
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
  }, [venues, selectedLocation, venueCategory, useDivisionScope, radiusMiles]);
  
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