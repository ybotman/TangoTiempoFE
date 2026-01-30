'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';
import { userSettingsEvent } from '@/utils/UserSettingsEvent';

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
  useRef(false);

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

  // State for saved location (from backend, persisted)
  const [savedLocation, setSavedLocation] = useState({
    lat: null,
    lng: null,
    zoomRange: 50
  });

  // State for current active location (single source of truth)
  const [currentLocation, setCurrentLocationState] = useState(() => {
    // Load from sessionStorage if available
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('currentLocation');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // TIEMPO-276: Security cleanup - removed error logging
          return { lat: null, lng: null, zoomRange: 50 };
        }
      }
    }
    return { lat: null, lng: null, zoomRange: 50 };
  });

  // State for MapCenterModal
  const [mapCenterModalOpen, setMapCenterModalOpen] = useState(false);

  // Subscribe to location events on mount
  useEffect(() => {
    // TIEMPO-276: Security cleanup - removed setup logging

    // Subscribe to nearest city fetched event
    const unsubscribeNearestCity = locationEventBus.on(
      LOCATION_EVENTS.NEAREST_CITY_FETCHED,
      ({ cityData }) => {
        // TIEMPO-276: Security cleanup - removed event logging
        
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
        // TIEMPO-276: Security cleanup - removed event logging
        setLocationData(prev => ({ ...prev, cities }));
      }
    );

    // Subscribe to regions fetched event
    const unsubscribeRegions = locationEventBus.on(
      LOCATION_EVENTS.REGIONS_FETCHED,
      ({ regions }) => {
        // TIEMPO-276: Security cleanup - removed event logging
        setLocationData(prev => ({ ...prev, regions }));
      }
    );

    // Subscribe to divisions fetched event
    const unsubscribeDivisions = locationEventBus.on(
      LOCATION_EVENTS.DIVISIONS_FETCHED,
      ({ divisions }) => {
        // TIEMPO-276: Security cleanup - removed event logging
        setLocationData(prev => ({ ...prev, divisions }));
      }
    );

    // Subscribe to location error events
    const unsubscribeLocationError = locationEventBus.on(
      LOCATION_EVENTS.LOCATION_ERROR,
      ({ error, operation }) => {
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
        // TIEMPO-276: Security cleanup - removed loading logging
        
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
        // TIEMPO-276: Security cleanup - removed loading logging
        
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
      // TIEMPO-276: Security cleanup - removed cleanup logging
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
    // TIEMPO-276: Security cleanup - removed selection logging
    
    setSelectedLocation(prev => ({
      ...prev,
      ...location
    }));

    // Emit location selected event
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_SELECTED, location);
  }, []);

  // Function to clear selected location
  const clearLocation = useCallback(() => {
    // TIEMPO-276: Security cleanup - removed clearing logging
    
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
    // TIEMPO-276: Security cleanup - removed refresh logging
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

            // In map mode, we don't need to automatically fetch nearest city
            // Only fetch if explicitly requested from hamburger menu
            // TIEMPO-276: Security cleanup - removed skip logging

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

  // Load user's saved map preferences from userData
  const loadUserMapPreferences = useCallback((userData) => {
    if (!userData?.localUserInfo?.userDefaults) return;
    
    const defaults = userData.localUserInfo.userDefaults;
    // TIEMPO-276: Security cleanup - removed preferences logging
    
    const location = {
      lat: defaults.defaultCenterLocation?.latitude || null,   // Backend stores as 'latitude'
      lng: defaults.defaultCenterLocation?.longitude || null,  // Backend stores as 'longitude'
      zoomRange: defaults.defaultZoomRange || 50
    };
    
    // Update both saved and current location
    setSavedLocation(location);
    
    // Only update current location if it hasn't been set by user this session
    // Use a ref or state setter function to avoid dependency on currentLocation
    setCurrentLocationState(prev => {
      if (!prev.lat && !prev.lng) {
        return location;
      }
      return prev;
    });
  }, []);

  // Open location settings modal
  const openLocationSettings = useCallback((tab = 'locationPrefs') => {
    // TIEMPO-276: Security cleanup - removed modal logging
    // Use userSettingsEvent to trigger the modal in SidebarDrawer
    userSettingsEvent.openModal(tab);
  }, []);

  // Close location settings modal
  const closeLocationSettings = useCallback(() => {
    // TIEMPO-276: Security cleanup - removed modal logging
    // Note: Modal closing is handled by SidebarDrawer directly
  }, []);

  // Open MapCenterModal
  const openMapCenterModal = useCallback(() => {
    // TIEMPO-276: Security cleanup - removed modal logging
    setMapCenterModalOpen(true);
  }, []);

  // Close MapCenterModal
  const closeMapCenterModal = useCallback(() => {
    // TIEMPO-276: Security cleanup - removed modal logging
    setMapCenterModalOpen(false);
  }, []);

  // Set location for current session (used by MapCenterModal)
  const setSessionLocation = useCallback((locationData) => {
    // TIEMPO-276: Security cleanup - removed session logging
    
    const location = {
      lat: locationData.centerLocation?.lat || locationData.lat,
      lng: locationData.centerLocation?.lng || locationData.lng,
      zoomRange: locationData.zoomRange || 50
    };
    
    // Only add source and locked if they exist (for Boston route)
    if (locationData.source) location.source = locationData.source;
    if (locationData.locked !== undefined) location.locked = locationData.locked;
    
    setCurrentLocationState(location);
    
    // Save to sessionStorage
    sessionStorage.setItem('currentLocation', JSON.stringify(location));
    
    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);
  }, []);

  // Save location to backend and set as current (used by UserSettings)
  const saveAndSetLocation = useCallback(async (locationData, updateUserData) => {
    // TIEMPO-276: Security cleanup - removed save logging

    const location = {
      lat: locationData.centerLocation?.lat || locationData.lat,
      lng: locationData.centerLocation?.lng || locationData.lng,
      zoomRange: locationData.zoomRange || 50
    };

    // Update both saved and current
    setSavedLocation(location);
    setCurrentLocationState(location);

    // Save to sessionStorage
    sessionStorage.setItem('currentLocation', JSON.stringify(location));

    // Save to backend if updateUserData provided
    if (updateUserData) {
      // Use nested structure that backend expects
      await updateUserData({
        localUserInfo: {
          userDefaults: {
            defaultCenterLocation: {
              latitude: location.lat,    // Backend expects 'latitude', not 'lat'
              longitude: location.lng    // Backend expects 'longitude', not 'lng'
            },
            defaultZoomRange: location.zoomRange,
            useCenterLocation: true
          }
        }
      });
    }

    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);
  }, []);

  // Save to Cloud Default via Azure Functions (TIEMPO-312 Phase 2)
  const saveToCloudDefault = useCallback(async (locationData, firebaseToken) => {
    // Skip on localhost to prevent 401 errors when Azure Functions not configured for PROD Firebase
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('[GeoLocationContext] Skipping Cloud Default save on localhost - Azure Functions not running');

      // Still update local state and sessionStorage for localhost testing
      const location = {
        lat: locationData.lat,
        lng: locationData.lng,
        radiusMiles: locationData.zoomRange || 50
      };

      setSavedLocation({
        lat: location.lat,
        lng: location.lng,
        zoomRange: location.radiusMiles
      });

      setCurrentLocationState({
        lat: location.lat,
        lng: location.lng,
        zoomRange: location.radiusMiles
      });

      sessionStorage.setItem('currentLocation', JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        zoomRange: location.radiusMiles
      }));

      locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

      return { success: true, message: 'Saved locally (localhost mode)' };
    }

    // Backend accepts radiusMiles (5-200) for search distance
    // and optional zoom (1-20) for visual map zoom level
    const location = {
      lat: locationData.lat,
      lng: locationData.lng,
      radiusMiles: locationData.zoomRange || 50  // Send distance in miles
    };

    // Call Azure Functions PUT /api/mapcenter
    const azureFunctionsURL = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

    const response = await fetch(`${azureFunctionsURL}/api/mapcenter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({ ...location, appId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save to Cloud Default');
    }

    const result = await response.json();

    // Update saved location state
    setSavedLocation({
      lat: location.lat,
      lng: location.lng,
      zoomRange: location.radiusMiles
    });

    // Also set as current location
    setCurrentLocationState({
      lat: location.lat,
      lng: location.lng,
      zoomRange: location.radiusMiles
    });

    // Save to sessionStorage
    sessionStorage.setItem('currentLocation', JSON.stringify({
      lat: location.lat,
      lng: location.lng,
      zoomRange: location.radiusMiles
    }));

    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

    return result;
  }, []);

  // Fetch user's saved map center from Azure Functions Cloud Default (TIEMPO-312 Phase 2)
  const fetchMapCenter = useCallback(async (firebaseToken) => {
    // Skip on localhost to prevent 401 errors when Azure Functions not configured for PROD Firebase
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('[GeoLocationContext] Skipping Cloud Default fetch on localhost - Azure Functions not running');

      // Check sessionStorage for locally saved location
      const savedLocal = sessionStorage.getItem('currentLocation');
      if (savedLocal) {
        try {
          const location = JSON.parse(savedLocal);
          setSavedLocation(location);
          setCurrentLocationState(location);
          return location;
        } catch (err) {
          console.warn('[GeoLocationContext] Failed to parse saved location from sessionStorage:', err);
        }
      }

      return null; // No saved location on localhost
    }

    const azureFunctionsURL = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

    try {
      const response = await fetch(`${azureFunctionsURL}/api/mapcenter?appId=${appId}`, {
        headers: {
          'Authorization': `Bearer ${firebaseToken}`
        }
      });

      const result = await response.json();

      // Check for successful response with data
      if (result.success && result.data) {
        const location = {
          lat: result.data.lat,
          lng: result.data.lng,
          zoomRange: result.data.radiusMiles  // Map backend radiusMiles to FE zoomRange
          // result.data.zoom also available if needed for map display
        };

        // Update both saved and current location
        setSavedLocation(location);
        setCurrentLocationState(location);

        // Save to sessionStorage
        sessionStorage.setItem('currentLocation', JSON.stringify(location));

        // Emit event to trigger refresh
        locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

        return location;
      } else if (result.success && !result.data) {
        // User has no saved location - use defaults
        console.log('[GeoLocationContext] No saved map center found, using defaults');
        return null;
      } else {
        // Error response
        console.error('[GeoLocationContext] Failed to fetch map center:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[GeoLocationContext] Error fetching map center:', error);
      return null;
    }
  }, []);

  // Compute location display text
  const locationDisplayText = selectedLocation.city.name || 
                             selectedLocation.division.name || 
                             selectedLocation.region.name || 
                             'Select Location';

  // Combined loading state
  const isLoading = loadingState.userLocation || 
                   loadingState.locationData || 
                   loadingState.nearestCity;

  // Check if we're in Boston Tango Calendar iframe
  useEffect(() => {
    const isBostonCalendar = typeof window !== 'undefined' && 
      (window.location.hostname.toLowerCase().includes('bostontangocalendar') ||
       window.parent !== window && document.referrer.toLowerCase().includes('bostontangocalendar'));
    
    if (isBostonCalendar && locationAPI?.fetchCities) {
      // TIEMPO-276: Security cleanup - removed iframe logging
      
      // City lookup removed - system migrated to geo-based coordinates
      // Boston calendar now uses direct coordinates in BOSTON_CONFIG
      // No longer need to search for Boston by cityName/divisionName
    }
  }, [locationAPI, selectLocation]);

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
    savedLocation,
    currentLocation,
    mapCenterModalOpen,

    // Functions
    selectLocation,
    clearLocation,
    fetchNearestCity,
    refreshUserLocation,
    loadUserMapPreferences,
    openLocationSettings,
    closeLocationSettings,
    openMapCenterModal,
    closeMapCenterModal,
    setSessionLocation,
    saveAndSetLocation,
    saveToCloudDefault,
    fetchMapCenter,

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
