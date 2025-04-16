'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useGeoLocations } from '@/hooks/useGeoLocations';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import axios from 'axios';

// Create the GeoLocationContext
const GeoLocationContext = createContext();

/**
 * GeoLocationProvider - Provides a unified context for geo-location functionality
 * 
 * This provider combines functionality from RegionsContext and MasteredLocationContext
 * while maintaining backward compatibility. It will initially defer to the existing
 * contexts, but gradually take over functionality as it is implemented.
 */
export const GeoLocationProvider = ({ children }) => {
  // Connect to existing contexts for backward compatibility
  const { nearestCity, fetchNearestCity } = useMasteredLocation();
  const regionsContext = useContext(RegionsContext);
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeoLocations();

  // State for the new unified geo location context
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    lastUpdated: null,
    ipBased: true
  });

  const [selectedLocation, setSelectedLocation] = useState({
    country: { id: null, name: null },
    region: { id: null, name: null },
    division: { id: null, name: null },
    city: { id: null, name: null, latitude: null, longitude: null }
  });

  const [loadingState, setLoadingState] = useState({
    userLocation: false,
    locationData: false,
    nearestCity: false
  });

  const [errorState, setErrorState] = useState({
    userLocation: null,
    locationData: null,
    nearestCity: null
  });

  // Initialize user location from the useGeoLocations hook
  useEffect(() => {
    if (latitude && longitude && !geoLoading && !geoError) {
      setUserLocation({
        latitude,
        longitude,
        accuracy: null, // IP geolocation doesn't provide accuracy
        lastUpdated: new Date().toISOString(),
        ipBased: true
      });
      setLoadingState(prev => ({ ...prev, userLocation: false }));
      setErrorState(prev => ({ ...prev, userLocation: null }));
    } else if (geoError) {
      setErrorState(prev => ({ ...prev, userLocation: geoError }));
      setLoadingState(prev => ({ ...prev, userLocation: false }));
    } else if (geoLoading) {
      setLoadingState(prev => ({ ...prev, userLocation: true }));
    }
  }, [latitude, longitude, geoLoading, geoError]);

  // Initialize selected location from the MasteredLocationContext
  useEffect(() => {
    if (nearestCity) {
      // Update from nearest city if we don't have a selection yet
      if (!selectedLocation.region.id) {
        setSelectedLocation({
          country: { 
            id: nearestCity.countryID, 
            name: nearestCity.countryName 
          },
          region: { 
            id: nearestCity.regionID, 
            name: nearestCity.regionName 
          },
          division: { 
            id: nearestCity.divisionID, 
            name: nearestCity.divisionName 
          },
          city: { 
            id: nearestCity.cityID, 
            name: nearestCity.cityName,
            latitude: nearestCity.latitude,
            longitude: nearestCity.longitude
          }
        });
      }
    }
  }, [nearestCity, selectedLocation.region.id]);

  // Initialize from RegionsContext when someone changes the selection there
  useEffect(() => {
    if (regionsContext.selectedRegion && regionsContext.selectedRegionID) {
      setSelectedLocation(prev => ({
        ...prev,
        region: {
          id: regionsContext.selectedRegionID,
          name: regionsContext.selectedRegion
        },
        division: {
          id: null,
          name: regionsContext.selectedDivision || null
        },
        city: {
          id: null,
          name: regionsContext.selectedCity || null,
          latitude: null,
          longitude: null
        }
      }));
    }
  }, [
    regionsContext.selectedRegion, 
    regionsContext.selectedRegionID, 
    regionsContext.selectedDivision, 
    regionsContext.selectedCity
  ]);

  // Function to update the RegionsContext when our selection changes
  // This ensures backward compatibility
  useEffect(() => {
    // Only update if we have actually selected something
    if (selectedLocation.region.name) {
      // Update the RegionsContext to maintain compatibility
      if (regionsContext.selectedRegion !== selectedLocation.region.name) {
        regionsContext.setSelectedRegion(selectedLocation.region.name);
      }
      
      if (regionsContext.selectedRegionID !== selectedLocation.region.id) {
        regionsContext.setSelectedRegionID(selectedLocation.region.id);
      }
      
      if (regionsContext.selectedDivision !== selectedLocation.division.name) {
        regionsContext.setSelectedDivision(selectedLocation.division.name || '');
      }
      
      if (regionsContext.selectedCity !== selectedLocation.city.name) {
        regionsContext.setSelectedCity(selectedLocation.city.name || '');
      }
    }
  }, [
    selectedLocation, 
    regionsContext
  ]);

  // Function to select a location manually
  const selectLocation = useCallback((location) => {
    setSelectedLocation(prev => ({
      ...prev,
      ...location
    }));
  }, []);

  // Function to reset to the nearest detected location
  const resetToNearestLocation = useCallback(() => {
    if (nearestCity) {
      setSelectedLocation({
        country: { 
          id: nearestCity.countryID, 
          name: nearestCity.countryName 
        },
        region: { 
          id: nearestCity.regionID, 
          name: nearestCity.regionName 
        },
        division: { 
          id: nearestCity.divisionID, 
          name: nearestCity.divisionName 
        },
        city: { 
          id: nearestCity.cityID, 
          name: nearestCity.cityName,
          latitude: nearestCity.latitude,
          longitude: nearestCity.longitude
        }
      });
    }
  }, [nearestCity]);

  // Function to refresh the user's geolocation (IP-based only, no browser permissions)
  const refreshUserLocation = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, userLocation: true }));
    
    // Add cache/session storage to reduce API calls to ipapi.co (which has strict rate limits)
    let cachedLocation = null;
    let cacheTimestamp = null;
    const cacheExpiry = 3600000; // 1 hour in milliseconds
    
    // Only access sessionStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        cachedLocation = sessionStorage.getItem('userGeoLocation');
        cacheTimestamp = sessionStorage.getItem('userGeoLocationTimestamp');
      } catch (err) {
        console.error('Error accessing sessionStorage:', err);
        // Silently fail if sessionStorage is not available
      }
    }
    
    try {
      // Check if we have a valid cached location
      if (cachedLocation && cacheTimestamp) {
        try {
          const parsedLocation = JSON.parse(cachedLocation);
          const timestamp = parseInt(cacheTimestamp, 10);
          const now = Date.now();
          
          // If cache is still valid, use it instead of making a new API call
          if (now - timestamp < cacheExpiry && 
              parsedLocation && 
              parsedLocation.latitude && 
              parsedLocation.longitude) {
            
            console.log('Using cached geo location data');
            
            setUserLocation({
              latitude: parsedLocation.latitude,
              longitude: parsedLocation.longitude,
              accuracy: null,
              lastUpdated: new Date(timestamp).toISOString(),
              ipBased: true
            });
            
            // Update the nearest city based on cached coordinates
            if (fetchNearestCity) {
              fetchNearestCity(parsedLocation.latitude, parsedLocation.longitude);
            }
            
            setErrorState(prev => ({ ...prev, userLocation: null }));
            setLoadingState(prev => ({ ...prev, userLocation: false }));
            return;
          }
        } catch (parseError) {
          console.error('Error parsing cached location:', parseError);
          // Continue if cache parsing fails
        }
      }
      
      // If no valid cache, make API request with error handling for rate limits
      try {
        // Use only IP-based geolocation (no user permission needed)
        const { data } = await axios.get('https://ipapi.co/json/', {
          // Add longer timeout and better error handling
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TangoTiempo/1.0' // Identify our app to the API provider
          }
        });
        
        if (data && data.latitude && data.longitude) {
          // Cache the location data - only in browser environment
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('userGeoLocation', JSON.stringify({
                latitude: data.latitude,
                longitude: data.longitude
              }));
              sessionStorage.setItem('userGeoLocationTimestamp', Date.now().toString());
            } catch (storageError) {
              console.error('Error saving to sessionStorage:', storageError);
              // Continue even if storage fails
            }
          }
          
          setUserLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: null,
            lastUpdated: new Date().toISOString(),
            ipBased: true
          });
          
          // Update the nearest city based on these coordinates
          if (fetchNearestCity) {
            fetchNearestCity(data.latitude, data.longitude);
            
            // We'll rely on the useEffect watching nearestCity to reset the location
            // This avoids the circular dependency with resetToNearestLocation
          }
        } else {
          throw new Error('Unable to retrieve latitude/longitude from IP service');
        }
      } catch (error) {
        console.error('ipapi.co API error:', error);
        
        if (error.response && error.response.status === 429) {
          setErrorState(prev => ({ 
            ...prev, 
            userLocation: 'Rate limit exceeded for location service. Please try again later.' 
          }));
          
          // Fall back to a default location or previously stored location if available
          if (userLocation.latitude && userLocation.longitude) {
            // We already have a location, so let's use it
            if (fetchNearestCity) {
              fetchNearestCity(userLocation.latitude, userLocation.longitude);
            }
          } else {
            // Use a default location (US center)
            const defaultLat = 39.8283;
            const defaultLng = -98.5795;
            
            setUserLocation({
              latitude: defaultLat,
              longitude: defaultLng,
              accuracy: null,
              lastUpdated: new Date().toISOString(),
              ipBased: false
            });
            
            if (fetchNearestCity) {
              fetchNearestCity(defaultLat, defaultLng);
            }
          }
        } else {
          setErrorState(prev => ({ 
            ...prev, 
            userLocation: error.message || 'Failed to get user location' 
          }));
        }
      }
      
    } catch (error) {
      console.error('Error in refreshUserLocation:', error);
      setErrorState(prev => ({ 
        ...prev, 
        userLocation: error.message || 'Failed to get user location' 
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, userLocation: false }));
    }
  }, [fetchNearestCity, userLocation]);

  // Determine overall loading and error states
  // Only show errors that are critical and would prevent functionality
  const isLoading = loadingState.userLocation || loadingState.locationData || loadingState.nearestCity;
  
  // Don't treat the IP-based location errors as critical since we have fallbacks
  const hasError = (errorState.userLocation && !userLocation.latitude) || 
                   errorState.locationData || 
                   (errorState.nearestCity && !nearestCity);

  // Get display text for current location
  const locationDisplayText = selectedLocation.city.name 
    ? `${selectedLocation.city.name}, ${selectedLocation.division.name}, ${selectedLocation.region.name}`
    : selectedLocation.division.name
      ? `${selectedLocation.division.name}, ${selectedLocation.region.name}`
      : selectedLocation.region.name
        ? selectedLocation.region.name
        : 'Location not selected';

  // Values to provide through the context
  const contextValue = {
    // Location state
    userLocation,
    selectedLocation,
    isLoading,
    hasError,
    locationDisplayText,
    
    // Methods
    selectLocation,
    resetToNearestLocation,
    refreshUserLocation,
    
    // Debug info
    loadingState,
    errorState
  };

  return (
    <GeoLocationContext.Provider value={contextValue}>
      {children}
    </GeoLocationContext.Provider>
  );
};

GeoLocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the GeoLocationContext
export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext);
  if (!context) {
    throw new Error('useGeoLocation must be used within a GeoLocationProvider');
  }
  return context;
};

export default GeoLocationContext;