'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocationAPI } from '@/contexts/LocationAPIContext';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';
import { userSettingsEvent } from '@/utils/UserSettingsEvent';
import { saveLastMapCenter } from '@/utils/visitorTracking';

// Normalize longitude to -180 to +180 range (fixes dateline wrap issue)
const normalizeLongitude = (lng) => {
  if (lng === null || lng === undefined || isNaN(lng)) return lng;
  return ((lng + 180) % 360 + 360) % 360 - 180;
};

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
  // TIEMPO-388: Added cityName, cityNameLoading, cityNameFetched to prevent recurring pill bug
  const [currentLocation, setCurrentLocationState] = useState(() => {
    // Load from sessionStorage if available
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('currentLocation');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Normalize longitude on load (fixes cached invalid coords from dateline wrap)
          const normalizedLng = normalizeLongitude(parsed.lng);
          // Ensure new fields exist (backwards compatible)
          return {
            lat: parsed.lat ?? null,
            lng: normalizedLng ?? null,
            zoomRange: parsed.zoomRange ?? 50,
            cityName: parsed.cityName ?? null,
            cityNameLoading: false,
            cityNameFetched: parsed.cityNameFetched ?? false,
            source: parsed.source,
            locked: parsed.locked
          };
        } catch {
          // TIEMPO-276: Security cleanup - removed error logging
          return { lat: null, lng: null, zoomRange: 50, cityName: null, cityNameLoading: false, cityNameFetched: false };
        }
      }
    }
    return { lat: null, lng: null, zoomRange: 50, cityName: null, cityNameLoading: false, cityNameFetched: false };
  });

  // State for MapCenterModal
  const [mapCenterModalOpen, setMapCenterModalOpen] = useState(false);

  // TIEMPO-381: State for onboarding modal (new users without mapCenter)
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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

  // TIEMPO-388: ROBUST city name fetcher - called directly, not via reactive useEffect
  // This eliminates all race conditions from the previous reactive approach
  const fetchCityNameForCoords = useCallback(async (lat, lng) => {
    if (!lat || !lng) return null;

    const fetchFn = locationAPI?.fetchNearestCity;
    if (!fetchFn) {
      console.warn('[GeoLocationContext] fetchNearestCity not available yet');
      return null;
    }

    try {
      const cityData = await fetchFn(lat, lng, 500000);
      return cityData?.cityName || null;
    } catch (error) {
      console.error('[GeoLocationContext] Error fetching city name:', error);
      return null;
    }
  }, [locationAPI?.fetchNearestCity]);

  // Helper to update location WITH city name fetch (call this instead of setCurrentLocationState directly)
  const updateLocationWithCityName = useCallback(async (newLocation, skipCityFetch = false) => {
    // Immediately set location with loading state
    const locationWithLoading = {
      ...newLocation,
      cityName: skipCityFetch ? newLocation.cityName : null,
      cityNameLoading: !skipCityFetch,
      cityNameFetched: skipCityFetch
    };

    setCurrentLocationState(locationWithLoading);
    sessionStorage.setItem('currentLocation', JSON.stringify(locationWithLoading));

    // Skip city fetch if requested (e.g., loading from cache with existing cityName)
    if (skipCityFetch) return;

    // Fetch city name
    const cityName = await fetchCityNameForCoords(newLocation.lat, newLocation.lng);

    // Update with fetched city name
    const finalLocation = {
      ...newLocation,
      cityName: cityName,
      cityNameLoading: false,
      cityNameFetched: true
    };

    setCurrentLocationState(finalLocation);
    sessionStorage.setItem('currentLocation', JSON.stringify(finalLocation));

    return finalLocation;
  }, [fetchCityNameForCoords]);

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
  }, []);

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
  // TIEMPO-388: Now fetches city name synchronously instead of relying on reactive useEffect
  const setSessionLocation = useCallback(async (locationData) => {
    const location = {
      lat: locationData.centerLocation?.lat || locationData.lat,
      lng: locationData.centerLocation?.lng || locationData.lng,
      zoomRange: locationData.zoomRange || 50
    };

    // Only add source and locked if they exist (for Boston route)
    if (locationData.source) location.source = locationData.source;
    if (locationData.locked !== undefined) location.locked = locationData.locked;

    // TIEMPO-388: Also save to localStorage for WelcomeModal check on next visit
    saveLastMapCenter({
      lat: location.lat,
      lng: location.lng,
      zoomRange: location.zoomRange
    });

    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

    // Update location AND fetch city name (robust, no race conditions)
    await updateLocationWithCityName(location);
  }, [updateLocationWithCityName]);

  // Save location to backend and set as current (used by UserSettings)
  // TIEMPO-388: Now fetches city name synchronously
  const saveAndSetLocation = useCallback(async (locationData, updateUserData) => {
    const location = {
      lat: locationData.centerLocation?.lat || locationData.lat,
      lng: locationData.centerLocation?.lng || locationData.lng,
      zoomRange: locationData.zoomRange || 50
    };

    // Update saved location
    setSavedLocation(location);

    // Save to backend if updateUserData provided
    if (updateUserData) {
      await updateUserData({
        localUserInfo: {
          userDefaults: {
            defaultCenterLocation: {
              latitude: location.lat,
              longitude: location.lng
            },
            defaultZoomRange: location.zoomRange,
            useCenterLocation: true
          }
        }
      });
    }

    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

    // Update location AND fetch city name
    await updateLocationWithCityName(location);
  }, [updateLocationWithCityName]);

  // Save to Cloud Default via Azure Functions (TIEMPO-312 Phase 2)
  // TIEMPO-388: Now fetches city name synchronously
  const saveToCloudDefault = useCallback(async (locationData, firebaseToken) => {
    const locData = {
      lat: locationData.lat,
      lng: locationData.lng,
      zoomRange: locationData.zoomRange || 50
    };

    // Skip API call on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setSavedLocation(locData);
      saveLastMapCenter(locData);
      locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, locData);
      await updateLocationWithCityName(locData);
      return { success: true, message: 'Saved locally (localhost mode)' };
    }

    // Call Azure Functions PUT /api/mapcenter
    const azureFunctionsURL = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

    const response = await fetch(`${azureFunctionsURL}/api/mapcenter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify({ lat: locData.lat, lng: locData.lng, radiusMiles: locData.zoomRange, appId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save to Cloud Default');
    }

    const result = await response.json();

    // Update saved location state
    setSavedLocation(locData);
    saveLastMapCenter(locData);

    // Emit event to trigger refresh
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, locData);

    // Update location AND fetch city name
    await updateLocationWithCityName(locData);

    return result;
  }, [updateLocationWithCityName]);

  // Fetch user's saved map center from Azure Functions Cloud Default (TIEMPO-312 Phase 2)
  // TIEMPO-388: Now fetches city name synchronously instead of relying on reactive useEffect
  const fetchMapCenter = useCallback(async (firebaseToken) => {
    console.log('[fetchMapCenter] Starting fetch...');

    // Skip on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const savedLocal = sessionStorage.getItem('currentLocation');
      if (savedLocal) {
        try {
          const location = JSON.parse(savedLocal);
          setSavedLocation(location);
          // If already has cityName, skip refetch
          if (location.cityName) {
            setCurrentLocationState(location);
          } else {
            await updateLocationWithCityName(location);
          }
          return location;
        } catch (err) {
          console.warn('[GeoLocationContext] Failed to parse saved location:', err);
        }
      }
      return null;
    }

    const azureFunctionsURL = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

    try {
      const response = await fetch(`${azureFunctionsURL}/api/mapcenter?appId=${appId}`, {
        headers: { 'Authorization': `Bearer ${firebaseToken}` }
      });

      console.log('[fetchMapCenter] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[fetchMapCenter] API error, throwing:', response.status, errorText);
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('[fetchMapCenter] API result:', JSON.stringify(result));

      if (result.success && result.data) {
        const location = {
          lat: result.data.lat,
          lng: result.data.lng,
          zoomRange: result.data.radiusMiles
        };

        setSavedLocation(location);

        // TIEMPO-381: Check if location is locked (Boston route)
        const currentSaved = sessionStorage.getItem('currentLocation');
        const currentParsed = currentSaved ? JSON.parse(currentSaved) : null;
        if (currentParsed?.locked) {
          console.log('[fetchMapCenter] Skipping update - location is locked');
          return location;
        }

        saveLastMapCenter(location);
        locationEventBus.emit(LOCATION_EVENTS.LOCATION_CHANGED, location);

        // Update location AND fetch city name (robust, no race conditions)
        await updateLocationWithCityName(location);

        return location;
      } else if (result.success && !result.data) {
        return null;
      } else {
        console.error('[GeoLocationContext] Failed to fetch map center:', result.error);
        return null;
      }
    } catch (error) {
      console.error('[GeoLocationContext] Error fetching map center:', error);
      return null;
    }
  }, [updateLocationWithCityName]);

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
    needsOnboarding,

    // Functions
    setNeedsOnboarding,
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
