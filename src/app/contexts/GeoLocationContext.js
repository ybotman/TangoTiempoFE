'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useGeoLocations } from '@/hooks/useGeoLocations';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
// Import RegionsContext with a deprecation warning - will be removed in future versions
let RegionsContext;
try {
  RegionsContext = require('@/contexts/RegionsContext').RegionsContext;
} catch (error) {
  console.info('RegionsContext not found or imported. GeoLocationContext will operate independently.');
}
import axios from 'axios';

// Create the GeoLocationContext
const GeoLocationContext = createContext();

/**
 * GeoLocationProvider - Provides a unified context for geo-location functionality
 * 
 * This provider combines functionality from RegionsContext and MasteredLocationContext
 * while maintaining backward compatibility. It will initially defer to the existing
 * contexts, but gradually take over functionality as it is implemented.
 * 
 * IMPORTANT: After the provider order change in Providers.js, this context now initializes
 * BEFORE MasteredLocationContext, so we need to handle the case where nearestCity is null
 * more gracefully and rely more on our direct geolocation methods.
 */
export const GeoLocationProvider = ({ children }) => {
  // Connect to existing contexts for backward compatibility
  // Note: useMasteredLocation might return null values since we now initialize before it
  const masteredLocationContext = useMasteredLocation();
  const nearestCity = masteredLocationContext?.nearestCity || null;
  const fetchNearestCity = masteredLocationContext?.fetchNearestCity || null;
  
  // Try to use RegionsContext if available, but make it optional
  const regionsContext = RegionsContext ? useContext(RegionsContext) : null;
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeoLocations();

  console.log('GeoLocationProvider: Initializing with location data', {
    masteredLocationAvailable: !!masteredLocationContext,
    hasNearestCity: !!nearestCity,
    nearestCityName: nearestCity?.cityName,
    latitude,
    longitude
  });

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
    console.log('GeoLocationContext: Checking for nearestCity update', { 
      hasNearestCity: !!nearestCity, 
      nearestCityName: nearestCity?.cityName,
      hasRegionId: !!selectedLocation.region.id
    });
    
    if (nearestCity) {
      // Update from nearest city if we don't have a selection yet
      if (!selectedLocation.region.id) {
        console.log('GeoLocationContext: Setting location from nearestCity', {
          city: nearestCity.cityName,
          division: nearestCity.divisionName,
          region: nearestCity.regionName
        });
        
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
      } else {
        console.log('GeoLocationContext: Already have a region selected, not updating from nearestCity');
      }
    } else {
      console.log('GeoLocationContext: No nearestCity available yet');
    }
  }, [nearestCity, selectedLocation.region.id]);

  // Initialize from RegionsContext when someone changes the selection there
  // This useEffect will be removed in a future version when RegionsContext is fully deprecated
  useEffect(() => {
    // Skip sync if RegionsContext isn't present or if data isn't available
    if (!regionsContext || !regionsContext.selectedRegion) {
      console.log('GeoLocationContext: RegionsContext not available or missing selectedRegion');
      return;
    }
    
    console.warn(
      "RegionsContext is deprecated and will be removed in a future version. " +
      "Please migrate to GeoLocationContext for all location operations."
    );
    
    console.log('GeoLocationContext: Syncing from RegionsContext', {
      region: regionsContext.selectedRegion,
      regionId: regionsContext.selectedRegionID,
      division: regionsContext.selectedDivision,
      city: regionsContext.selectedCity
    });
    
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
    regionsContext?.selectedRegion, 
    regionsContext?.selectedRegionID, 
    regionsContext?.selectedDivision, 
    regionsContext?.selectedCity
  ]);

  // Function to update the RegionsContext when our selection changes for backward compatibility
  // This useEffect will be removed in a future version when RegionsContext is fully deprecated
  useEffect(() => {
    // Skip sync if RegionsContext isn't present or if we don't have location data
    if (!regionsContext || !selectedLocation.region.name) {
      return;
    }
    
    try {
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
    } catch (error) {
      console.error("Error syncing with RegionsContext:", error);
      // If RegionsContext is missing methods, we can safely continue without it
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
    console.log('GeoLocationContext: Refreshing user location');
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
        console.log('GeoLocationContext: Checking cached location', { hasCachedLocation: !!cachedLocation });
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
            
            console.log('GeoLocationContext: Using cached geo location data', parsedLocation);
            
            setUserLocation({
              latitude: parsedLocation.latitude,
              longitude: parsedLocation.longitude,
              accuracy: null,
              lastUpdated: new Date(timestamp).toISOString(),
              ipBased: true
            });
            
            // Update the nearest city based on cached coordinates
            if (fetchNearestCity) {
              console.log('GeoLocationContext: Fetching nearest city from cache', {
                lat: parsedLocation.latitude,
                lng: parsedLocation.longitude
              });
              fetchNearestCity(parsedLocation.latitude, parsedLocation.longitude);
            } else {
              console.warn('GeoLocationContext: fetchNearestCity function not available');
            }
            
            setErrorState(prev => ({ ...prev, userLocation: null }));
            setLoadingState(prev => ({ ...prev, userLocation: false }));
            return;
          } else {
            console.log('GeoLocationContext: Cached location expired or invalid');
          }
        } catch (parseError) {
          console.error('Error parsing cached location:', parseError);
          // Continue if cache parsing fails
        }
      }
      
      // If no valid cache, make API request with error handling for rate limits
      try {
        console.log('GeoLocationContext: Fetching location from API');
        // Use the backend proxy to avoid CORS issues
        const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
        const { data } = await axios.get(`${baseURL}/api/firebase/geo/ip`, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('GeoLocationContext: API response received', { 
          hasData: !!data,
          hasLatitude: data?.latitude !== undefined,
          hasLongitude: data?.longitude !== undefined
        });
        
        if (data && data.latitude && data.longitude) {
          // Cache the location data - only in browser environment
          if (typeof window !== 'undefined') {
            try {
              const locationData = {
                latitude: data.latitude,
                longitude: data.longitude
              };
              
              sessionStorage.setItem('userGeoLocation', JSON.stringify(locationData));
              sessionStorage.setItem('userGeoLocationTimestamp', Date.now().toString());
              console.log('GeoLocationContext: Location cached successfully');
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
            console.log('GeoLocationContext: Fetching nearest city from API response', {
              lat: data.latitude,
              lng: data.longitude
            });
            fetchNearestCity(data.latitude, data.longitude);
            
            // We'll rely on the useEffect watching nearestCity to reset the location
            // This avoids the circular dependency with resetToNearestLocation
          } else {
            console.warn('GeoLocationContext: fetchNearestCity function not available');
          }
        } else {
          console.error('GeoLocationContext: Invalid API response format', data);
          throw new Error('Unable to retrieve latitude/longitude from IP service');
        }
      } catch (error) {
        console.error('GeoLocationContext: API error fetching location:', error);
        
        if (error.response && error.response.status === 429) {
          console.warn('GeoLocationContext: Rate limit exceeded, using fallback location');
          setErrorState(prev => ({ 
            ...prev, 
            userLocation: 'Rate limit exceeded for location service. Please try again later.' 
          }));
          
          // Fall back to a default location or previously stored location if available
          if (userLocation.latitude && userLocation.longitude) {
            // We already have a location, so let's use it
            console.log('GeoLocationContext: Using existing location as fallback', {
              lat: userLocation.latitude,
              lng: userLocation.longitude
            });
            
            if (fetchNearestCity) {
              fetchNearestCity(userLocation.latitude, userLocation.longitude);
            }
          } else {
            // Use default locations by region
            // Northeast region (New York City)
            const defaultLat = 40.7128;
            const defaultLng = -74.0060;
            
            console.log('GeoLocationContext: Using default NYC location', {
              lat: defaultLat,
              lng: defaultLng
            });
            
            setUserLocation({
              latitude: defaultLat,
              longitude: defaultLng,
              accuracy: null,
              lastUpdated: new Date().toISOString(),
              ipBased: false
            });
            
            if (fetchNearestCity) {
              fetchNearestCity(defaultLat, defaultLng);
            } else {
              console.warn('GeoLocationContext: fetchNearestCity function not available');
              
              // Manual fallback for when everything else fails - set Northeast region as default
              console.log('GeoLocationContext: Using hardcoded Northeast region fallback');
              setSelectedLocation({
                country: { 
                  id: '6751f57e2e74d97609e7dca0', // US country ID
                  name: 'United States'
                },
                region: { 
                  id: '6751f58a5db435dd8005e45b', // Northeast region ID
                  name: 'Northeast'
                },
                division: { 
                  id: '6751f58a5db435dd8005e461', // New England division ID
                  name: 'New England'
                },
                city: { 
                  id: '6751f58a5db435dd8005e479', // Boston city ID
                  name: 'Boston',
                  latitude: 42.3601,
                  longitude: -71.0589
                }
              });
            }
          }
        } else {
          console.error('GeoLocationContext: Other API error', error.message);
          setErrorState(prev => ({ 
            ...prev, 
            userLocation: error.message || 'Failed to get user location' 
          }));
          
          // Emergency fallback - Northeast region
          console.log('GeoLocationContext: Using emergency fallback for Northeast region');
          setSelectedLocation({
            country: { 
              id: '6751f57e2e74d97609e7dca0', // US country ID
              name: 'United States'
            },
            region: { 
              id: '6751f58a5db435dd8005e45b', // Northeast region ID
              name: 'Northeast'
            },
            division: { 
              id: '6751f58a5db435dd8005e461', // New England division ID
              name: 'New England'
            },
            city: { 
              id: '6751f58a5db435dd8005e479', // Boston city ID
              name: 'Boston',
              latitude: 42.3601,
              longitude: -71.0589
            }
          });
        }
      }
      
    } catch (error) {
      console.error('GeoLocationContext: General error in refreshUserLocation:', error);
      setErrorState(prev => ({ 
        ...prev, 
        userLocation: error.message || 'Failed to get user location' 
      }));
      
      // Last resort fallback - Northeast region
      console.log('GeoLocationContext: Using last resort fallback for Northeast region');
      setSelectedLocation({
        country: { 
          id: '6751f57e2e74d97609e7dca0', // US country ID
          name: 'United States'
        },
        region: { 
          id: '6751f58a5db435dd8005e45b', // Northeast region ID
          name: 'Northeast'
        },
        division: { 
          id: '6751f58a5db435dd8005e461', // New England division ID
          name: 'New England'
        },
        city: { 
          id: '6751f58a5db435dd8005e479', // Boston city ID
          name: 'Boston',
          latitude: 42.3601,
          longitude: -71.0589
        }
      });
    } finally {
      setLoadingState(prev => ({ ...prev, userLocation: false }));
    }
  }, [fetchNearestCity, userLocation, setSelectedLocation]);

  // Add an explicit initialization effect to force location refresh on mount
  // This will help ensure we always have a city selected
  useEffect(() => {
    console.log('GeoLocationContext: Component mounted, initializing location');
    
    const initializeLocation = async () => {
      // Check if we already have a selected location
      if (selectedLocation.city.id) {
        console.log('GeoLocationContext: Already have a city selected, skipping initialization', {
          city: selectedLocation.city.name
        });
        return;
      }
      
      // Check if we already have a nearest city from context
      if (nearestCity) {
        console.log('GeoLocationContext: Using nearestCity from context for initialization', {
          city: nearestCity.cityName
        });
        
        // Explicitly set the selected location from nearestCity data
        // This ensures we have a city even if the useEffect watching nearestCity hasn't run yet
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
        
        return;
      }
      
      try {
        // Force a refresh of the user location
        console.log('GeoLocationContext: No location available, forcing refresh');
        await refreshUserLocation();
        
        // After refresh, check if we have a city ID yet
        if (!selectedLocation.city.id) {
          // Set a default city by fetching from the API instead of using hardcoded IDs
          console.log('GeoLocationContext: Fetching default location data');
          
          try {
            const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
            const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
            
            // Look up by city name instead of ID
            const cityResponse = await fetch(`${baseURL}/api/masteredLocations/cities?cityName=Boston&appId=${appId}`);
            const cityData = await cityResponse.json();
            
            if (cityData && cityData.length > 0) {
              const defaultCity = cityData[0];
              console.log('GeoLocationContext: Setting default from fetched data', defaultCity);
              
              setSelectedLocation({
                country: { 
                  id: defaultCity.countryID, 
                  name: defaultCity.countryName || "United States"
                },
                region: { 
                  id: defaultCity.regionID, 
                  name: defaultCity.regionName || "Northeast"
                },
                division: { 
                  id: defaultCity.divisionID, 
                  name: defaultCity.divisionName || "New England"
                },
                city: { 
                  id: defaultCity.cityID, 
                  name: defaultCity.cityName || "Boston",
                  latitude: defaultCity.latitude || 42.3601,
                  longitude: defaultCity.longitude || -71.0589
                }
              });
            } else {
              throw new Error('Failed to fetch default city data');
            }
          } catch (apiError) {
            console.error('GeoLocationContext: Error fetching default location', apiError);
            
            // As last resort, set default values with null IDs but valid names
            // This ensures UI can show something even without IDs
            console.log('GeoLocationContext: Using default names without IDs as last resort');
            setSelectedLocation({
              country: { id: null, name: "United States" },
              region: { id: null, name: "Northeast" },
              division: { id: null, name: "New England" },
              city: { 
                id: Date.now().toString(), // Generate a temporary ID for the UI to work
                name: "Boston",
                latitude: 42.3601,
                longitude: -71.0589
              }
            });
          }
        }
      } catch (error) {
        console.error('GeoLocationContext: Error in initialization process', error);
        
        // Set default with temporary ID as last resort
        setSelectedLocation({
          country: { id: null, name: "United States" },
          region: { id: null, name: "Northeast" },
          division: { id: null, name: "New England" },
          city: { 
            id: Date.now().toString(), // Generate a temporary ID for the UI to work
            name: "Boston",
            latitude: 42.3601,
            longitude: -71.0589
          }
        });
      }
    };
    
    // Run initialization
    initializeLocation();
    
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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