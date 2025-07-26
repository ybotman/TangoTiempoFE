'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';

// Create the GeoLocationContext
const GeoLocationContext = createContext();

/**
 * GeoLocationProvider - Manages all location state for the application
 * 
 * This provider is the single source of truth for location state.
 * It subscribes to LocationEventBus events from LocationAPIContext
 * and manages user location selection, preferences, and updates.
 * 
 * No circular dependencies - uses events instead of direct imports.
 */
export const GeoLocationProvider = ({ children }) => {
  // Get API functions from LocationAPIContext (no circular dependency)
  const locationAPI = useLocationAPI();

  // For tracking initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  // State for user's physical location (from browser or IP)
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    lastUpdated: null
  });

  // State for selected location (for filtering events)
  const [selectedLocation, setSelectedLocation] = useState({
    country: { id: null, name: null },
    region: { id: null, name: null },
    division: { id: null, name: null },
    city: { id: null, name: null, latitude: null, longitude: null }
  });

  // State for cached location data
  const [locationData, setLocationData] = useState({
    cities: [],
    regions: [],
    divisions: []
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

  // Subscribe to location events on mount
  useEffect(() => {
    console.log('[GeoLocationContext] Setting up event subscriptions');

    // Subscribe to nearest city fetched event
    const unsubscribeNearestCity = locationEventBus.on(
      LOCATION_EVENTS.NEAREST_CITY_FETCHED,
      ({ cityData, coordinates }) => {
        console.log('[GeoLocationContext] Received NEAREST_CITY_FETCHED event:', cityData.cityName);
        
        // Update selected location with the fetched city
        setSelectedLocation({
          country: {
            id: cityData.countryID,
            name: cityData.countryName
          },
          region: {
            id: cityData.regionID,
            name: cityData.regionName
          },
          division: {
            id: cityData.divisionID,
            name: cityData.divisionName
          },
          city: {
            id: cityData.cityID,
            name: cityData.cityName,
            latitude: cityData.latitude,
            longitude: cityData.longitude
          }
        });

        // Clear any nearestCity errors
        setErrorState(prev => ({ ...prev, nearestCity: null }));
      }
    );

    // Subscribe to cities fetched event
    const unsubscribeCities = locationEventBus.on(
      LOCATION_EVENTS.CITIES_FETCHED,
      ({ cities }) => {
        console.log(`[GeoLocationContext] Received CITIES_FETCHED event: ${cities.length} cities`);
        setLocationData(prev => ({ ...prev, cities }));
      }
    );

    // Subscribe to regions fetched event
    const unsubscribeRegions = locationEventBus.on(
      LOCATION_EVENTS.REGIONS_FETCHED,
      ({ regions }) => {
        console.log(`[GeoLocationContext] Received REGIONS_FETCHED event: ${regions.length} regions`);
        setLocationData(prev => ({ ...prev, regions }));
      }
    );

    // Subscribe to divisions fetched event
    const unsubscribeDivisions = locationEventBus.on(
      LOCATION_EVENTS.DIVISIONS_FETCHED,
      ({ divisions }) => {
        console.log(`[GeoLocationContext] Received DIVISIONS_FETCHED event: ${divisions.length} divisions`);
        setLocationData(prev => ({ ...prev, divisions }));
      }
    );

    // Subscribe to location error events
    const unsubscribeLocationError = locationEventBus.on(
      LOCATION_EVENTS.LOCATION_ERROR,
      ({ error, operation, details }) => {
        console.error(`[GeoLocationContext] Location error in ${operation}:`, error);
        
        // Update appropriate error state based on operation
        if (operation === 'fetchNearestCity') {
          setErrorState(prev => ({ ...prev, nearestCity: error }));
        } else {
          setErrorState(prev => ({ ...prev, locationData: error }));
        }
      }
    );

    // Subscribe to loading events
    const unsubscribeLoadingStarted = locationEventBus.on(
      LOCATION_EVENTS.LOADING_STARTED,
      ({ operation }) => {
        console.log(`[GeoLocationContext] Loading started: ${operation}`);
        
        if (operation === 'fetchNearestCity') {
          setLoadingState(prev => ({ ...prev, nearestCity: true }));
        } else {
          setLoadingState(prev => ({ ...prev, locationData: true }));
        }
      }
    );

    const unsubscribeLoadingCompleted = locationEventBus.on(
      LOCATION_EVENTS.LOADING_COMPLETED,
      ({ operation }) => {
        console.log(`[GeoLocationContext] Loading completed: ${operation}`);
        
        if (operation === 'fetchNearestCity') {
          setLoadingState(prev => ({ ...prev, nearestCity: false }));
        } else {
          setLoadingState(prev => ({ ...prev, locationData: false }));
        }
      }
    );

    // Mark as initialized
    setIsInitialized(true);

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[GeoLocationContext] Cleaning up event subscriptions');
      unsubscribeNearestCity();
      unsubscribeCities();
      unsubscribeRegions();
      unsubscribeDivisions();
      unsubscribeLocationError();
      unsubscribeLoadingStarted();
      unsubscribeLoadingCompleted();
    };
  }, []); // Empty deps array - only run on mount

  // Function to select a location manually
  const selectLocation = useCallback((location) => {
    console.log('[GeoLocationContext] Manual location selection:', location);
    
    setSelectedLocation(prev => ({
      ...prev,
      ...location
    }));

    // Emit location selected event
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_SELECTED, location);
  }, []);

  // Function to clear selected location
  const clearLocation = useCallback(() => {
    console.log('[GeoLocationContext] Clearing selected location');
    
    setSelectedLocation({
      country: { id: null, name: null },
      region: { id: null, name: null },
      division: { id: null, name: null },
      city: { id: null, name: null, latitude: null, longitude: null }
    });

    // Emit location cleared event
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CLEARED, {});
  }, []);

  // Fetch nearest city using LocationAPIContext
  const fetchNearestCity = useCallback(async (latitude, longitude, maxDistance = 500000) => {
    if (!locationAPI?.fetchNearestCity) {
      console.error('[GeoLocationContext] LocationAPIContext not available');
      throw new Error('Location API not available');
    }

    try {
      // The API will emit events, we just need to call it
      const result = await locationAPI.fetchNearestCity(latitude, longitude, maxDistance);
      return result;
    } catch (error) {
      console.error('[GeoLocationContext] Error fetching nearest city:', error);
      throw error;
    }
  }, [locationAPI]);

  // Function to refresh user's browser location
  const refreshUserLocation = useCallback(async () => {
    console.log('[GeoLocationContext] Refreshing user location');
    setLoadingState(prev => ({ ...prev, userLocation: true }));
    setErrorState(prev => ({ ...prev, userLocation: null }));

    try {
      // Try to get browser location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            setUserLocation({
              latitude,
              longitude,
              accuracy,
              lastUpdated: new Date().toISOString()
            });

            // Emit user location updated event
            locationEventBus.emit(LOCATION_EVENTS.USER_LOCATION_UPDATED, {
              latitude,
              longitude,
              accuracy
            });

            // Automatically fetch nearest city
            try {
              await fetchNearestCity(latitude, longitude);
            } catch (err) {
              console.error('[GeoLocationContext] Error fetching nearest city:', err);
            }

            setLoadingState(prev => ({ ...prev, userLocation: false }));
          },
          (error) => {
            console.error('[GeoLocationContext] Geolocation error:', error);
            setErrorState(prev => ({ ...prev, userLocation: error.message }));
            setLoadingState(prev => ({ ...prev, userLocation: false }));
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (error) {
      console.error('[GeoLocationContext] Error getting user location:', error);
      setErrorState(prev => ({ ...prev, userLocation: error.message }));
      setLoadingState(prev => ({ ...prev, userLocation: false }));
    }
  }, [fetchNearestCity]);

  // Compute location display text
  const locationDisplayText = selectedLocation.city.name || 
                             selectedLocation.division.name || 
                             selectedLocation.region.name || 
                             'Select Location';

  // Combined loading state
  const isLoading = loadingState.userLocation || 
                   loadingState.locationData || 
                   loadingState.nearestCity;

  // Context value
  const contextValue = {
    // State
    userLocation,
    selectedLocation,
    locationData,
    isInitialized,
    isLoading,
    loadingState,
    errorState,
    locationDisplayText,
    
    // Functions
    selectLocation,
    clearLocation,
    fetchNearestCity,
    refreshUserLocation,
    
    // Direct access to API functions (if needed)
    fetchCities: locationAPI?.fetchCities,
    fetchRegions: locationAPI?.fetchRegions,
    fetchDivisions: locationAPI?.fetchDivisions
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

// Hook to use the GeoLocationContext
export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext);
  if (!context) {
    throw new Error('useGeoLocation must be used within a GeoLocationProvider');
  }
  return context;
};