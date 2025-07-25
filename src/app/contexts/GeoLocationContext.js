'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
// Removed IP-based geolocation hook - TIEMPO-145
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
// Removed axios - no longer needed after IP geolocation removal (TIEMPO-145)

// Create the GeoLocationContext
const GeoLocationContext = createContext();

/**
 * GeoLocationProvider - Provides a unified context for geo-location functionality
 * 
 * This provider is the primary source of truth for location state in the application.
 * It initializes before MasteredLocationContext and handles all location-related functionality.
 */
export const GeoLocationProvider = ({ children }) => {
  // Connect to MasteredLocationContext for data services
  const masteredLocationContext = useMasteredLocation();
  const nearestCity = masteredLocationContext?.nearestCity || null;

  // For tracking initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);


  // State for the new unified geo location context
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    lastUpdated: null
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

  // TIEMPO-145: Removed IP-based location initialization

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
  }, [nearestCity, selectedLocation.region.id, setSelectedLocation]);



  // Function to select a location manually
  const selectLocation = useCallback((location) => {
    setSelectedLocation(prev => ({
      ...prev,
      ...location
    }));
  }, []);

  // Function to reset to the nearest detected location
  // Removed registerMasteredLocationFunctions - no longer needed with hierarchical model

  // Primary implementation of fetchNearestCity - the central function for location selection
  const fetchNearestCityImpl = useCallback(async (latitude, longitude, maxDistance = 500000) => {
    // Validate coordinates - ensure they're valid numbers
    if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      console.error('GeoLocationContext: fetchNearestCity - Invalid coordinates', { latitude, longitude });
      // Use fallback coordinates instead of returning
      latitude = 42.3601; // Boston fallback
      longitude = -71.0589;
    }

    // Ensure coordinates are numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    console.log('GeoLocationContext: fetchNearestCity - Fetching nearest city', { latitude, longitude });

    setLoadingState(prev => ({ ...prev, nearestCity: true }));
    try {
      // Try to fetch from MasteredLocationContext first if available
      if (masteredLocationContext?.fetchNearestCity) {
        console.log('GeoLocationContext: Using MasteredLocationContext.fetchNearestCity');
        try {
          const cityData = await masteredLocationContext.fetchNearestCity(latitude, longitude, maxDistance);

          if (cityData) {
            console.log('GeoLocationContext: Got city data from MasteredLocationContext', {
              cityName: cityData.cityName,
              coords: [cityData.latitude, cityData.longitude]
            });

            // Update the location with the fetched data
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

            setLoadingState(prev => ({ ...prev, nearestCity: false }));
            setErrorState(prev => ({ ...prev, nearestCity: null }));
            return cityData;
          }
        } catch (masteredErr) {
          console.warn('GeoLocationContext: MasteredLocationContext fetch failed, falling back to direct API call', masteredErr);
          // Continue with direct API call fallback
        }
      }

      // Direct API call if MasteredLocationContext is not available or fails
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const url = `${baseURL}/api/masteredLocations/nearestMastered?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}&isActive=true&appId=${appId}`;

      console.log('GeoLocationContext: Calling API directly', { url });
      const response = await fetch(url);

      if (!response.ok) {
        // Default to Northeast region if no city is found
        if (response.status === 404) {
          console.log('GeoLocationContext: No nearby city found, defaulting to Northeast region');

          // Create default location with proper names but dynamic ID generation
          // This follows the SuccessCriteria to avoid hardcoded MongoDB IDs
          // We'll use null IDs instead, letting the system generate proper IDs later
          const defaultLocation = {
            country: { id: null, name: 'United States' },
            region: { id: null, name: 'Northeast' },
            division: { id: null, name: 'New England' },
            city: {
              id: null, // Will be acquired later via API lookup
              name: 'Boston',
              latitude: 42.3601,
              longitude: -71.0589
            }
          };

          // Set selected location
          setSelectedLocation(defaultLocation);
          setLoadingState(prev => ({ ...prev, nearestCity: false }));

          // Return in format compatible with MasteredLocationContext
          // Using temporary IDs for the return values when needed
          const tempId = () => `temp_${Date.now().toString().slice(-4)}_${Math.floor(Math.random() * 1000)}`;

          return {
            cityID: defaultLocation.city.id || tempId(),
            cityName: defaultLocation.city.name,
            regionID: defaultLocation.region.id || tempId(),
            regionName: defaultLocation.region.name,
            divisionID: defaultLocation.division.id || tempId(),
            divisionName: defaultLocation.division.name,
            countryID: defaultLocation.country.id || tempId(),
            countryName: defaultLocation.country.name,
            latitude: defaultLocation.city.latitude,
            longitude: defaultLocation.city.longitude,
            isFallback: true
          };
        }

        throw new Error(`Error fetching nearest city: ${response.statusText}`);
      }

      const data = await response.json();

      // Ensure we have valid coordinates
      const cityLatitude = data.latitude ||
                          (data.location?.coordinates ? data.location.coordinates[1] : null) ||
                          latitude;
      const cityLongitude = data.longitude ||
                          (data.location?.coordinates ? data.location.coordinates[0] : null) ||
                          longitude;

      // Create properly formatted location object
      const locationData = {
        country: {
          id: data.countryID,
          name: data.countryName
        },
        region: {
          id: data.regionID,
          name: data.regionName
        },
        division: {
          id: data.divisionID,
          name: data.divisionName
        },
        city: {
          id: data.cityID,
          name: data.cityName,
          latitude: cityLatitude,
          longitude: cityLongitude
        }
      };

      // Update the location with the fetched data
      setSelectedLocation(locationData);
      setLoadingState(prev => ({ ...prev, nearestCity: false }));
      setErrorState(prev => ({ ...prev, nearestCity: null }));

      // Return in format compatible with MasteredLocationContext
      return {
        cityID: data.cityID,
        cityName: data.cityName,
        regionID: data.regionID,
        regionName: data.regionName,
        divisionID: data.divisionID,
        divisionName: data.divisionName,
        countryID: data.countryID,
        countryName: data.countryName,
        latitude: cityLatitude,
        longitude: cityLongitude
      };
    } catch (err) {
      console.error('GeoLocationContext: Error in fetchNearestCity:', err.message);
      setErrorState(prev => ({ ...prev, nearestCity: err.message }));

      // Create fallback location with proper names but without hardcoded IDs
      const fallbackLocation = {
        country: { id: null, name: 'United States' },
        region: { id: null, name: 'Northeast' },
        division: { id: null, name: 'New England' },
        city: {
          id: null,
          name: 'Boston',
          latitude: 42.3601,
          longitude: -71.0589
        }
      };

      // Set fallback location on error
      setSelectedLocation(fallbackLocation);
      setLoadingState(prev => ({ ...prev, nearestCity: false }));

      // Return fallback in format compatible with MasteredLocationContext
      // Using temporary IDs for the return values when needed
      const tempId = () => `temp_${Date.now().toString().slice(-4)}_${Math.floor(Math.random() * 1000)}`;

      return {
        cityID: fallbackLocation.city.id || tempId(),
        cityName: fallbackLocation.city.name,
        regionID: fallbackLocation.region.id || tempId(),
        regionName: fallbackLocation.region.name,
        divisionID: fallbackLocation.division.id || tempId(),
        divisionName: fallbackLocation.division.name,
        countryID: fallbackLocation.country.id || tempId(),
        countryName: fallbackLocation.country.name,
        latitude: fallbackLocation.city.latitude,
        longitude: fallbackLocation.city.longitude,
        isFallback: true
      };
    }
  }, [masteredLocationContext]);

  // Reset to nearest location using either masteredLocationContext data or default
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
    } else if (userLocation.latitude && userLocation.longitude) {
      // If we don't have a nearest city but have user location, fetch one directly
      fetchNearestCityImpl(userLocation.latitude, userLocation.longitude);
    }
  }, [nearestCity, userLocation, fetchNearestCityImpl]);

  // Function to refresh the user's geolocation (IP-based only, no browser permissions)
  // TIEMPO-145: Simplified function to set default Boston location
  const refreshUserLocation = useCallback(() => {
    console.log('GeoLocationContext: Setting default Boston location');
    setLoadingState(prev => ({ ...prev, userLocation: true }));
    
    try {
      // Set Boston coordinates as default
      const bostonLat = 42.3601;
      const bostonLng = -71.0589;
      
      // Update user location state
      setUserLocation({
        latitude: bostonLat,
        longitude: bostonLng,
        accuracy: null,
        lastUpdated: new Date().toISOString()
      });
      
      // Set selected location to Boston
      setSelectedLocation({
        country: {
          id: null,
          name: 'United States'
        },
        region: {
          id: null,
          name: 'Northeast'
        },
        division: {
          id: null,
          name: 'New England'
        },
        city: {
          id: null,
          name: 'Boston',
          latitude: bostonLat,
          longitude: bostonLng
        }
      });
      
      // Clear any errors
      setErrorState(prev => ({ ...prev, userLocation: null }));
      
      console.log('GeoLocationContext: Default Boston location set successfully');
      
    } catch (error) {
      console.error('GeoLocationContext: Error setting default location:', error);
      setErrorState(prev => ({ 
        ...prev, 
        userLocation: 'Failed to set default location' 
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, userLocation: false }));
    }
  }, [setSelectedLocation]);

  // Mark context as initialized after setup completes
  useEffect(() => {
    if (!isInitialized && selectedLocation?.city?.id) {
      console.log('GeoLocationContext: Marking as initialized', { selectedCity: selectedLocation.city.name });
      setIsInitialized(true);
    }
  }, [isInitialized, selectedLocation.city?.id, selectedLocation.city?.name]);

  // Add an explicit initialization effect to force location refresh on mount
  // This will help ensure we always have a city selected
  // This effect should only run once on mount
  useEffect(() => {
    // Only run initialization once
    if (initializationAttempted.current) {
      return;
    }

    // Mark that we've attempted initialization
    initializationAttempted.current = true;
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
        refreshUserLocation();

        // After refresh, check if we have a city ID yet
        if (!selectedLocation.city.id) {
          // Set a default city by fetching from the API instead of using hardcoded IDs
          console.log('GeoLocationContext: Fetching default location data');

          try {
            // Use the API to retrieve the proper location data
            console.log('GeoLocationContext: Fetching location data from API');

            const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
            const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

            // We'll use the /api/mastered-locations/all endpoint to get all location data at once
            const locationResponse = await fetch(`${baseURL}/api/masteredLocations/all?appId=${appId}&isActive=true`);

            if (!locationResponse.ok) {
              throw new Error(`Error fetching location data: ${locationResponse.status}`);
            }

            const locationData = await locationResponse.json();
            console.log('GeoLocationContext: Retrieved location data from API', locationData);

            let defaultCountry, defaultRegion, defaultDivision, defaultCity;

            // Find United States from countries
            defaultCountry = locationData.countries?.find(c => c.countryName === 'United States') || null;

            // Find Northeast from regions
            defaultRegion = locationData.regions?.find(r => r.regionName === 'Northeast') || null;

            // Find New England from divisions
            defaultDivision = locationData.divisions?.find(d => d.divisionName === 'New England') || null;

            // Find Boston from cities
            defaultCity = locationData.cities?.find(c => c.cityName === 'Boston') || null;

            if (defaultCountry && defaultRegion && defaultDivision && defaultCity) {
              console.log('GeoLocationContext: Found all default location data', {
                country: defaultCountry.countryName,
                region: defaultRegion.regionName,
                division: defaultDivision.divisionName,
                city: defaultCity.cityName
              });

              setSelectedLocation({
                country: {
                  id: defaultCountry._id || defaultCountry.countryID,
                  name: defaultCountry.countryName
                },
                region: {
                  id: defaultRegion._id || defaultRegion.regionID,
                  name: defaultRegion.regionName
                },
                division: {
                  id: defaultDivision._id || defaultDivision.divisionID,
                  name: defaultDivision.divisionName
                },
                city: {
                  id: defaultCity._id || defaultCity.cityID,
                  name: defaultCity.cityName,
                  latitude: defaultCity.latitude,
                  longitude: defaultCity.longitude
                }
              });
            } else {
              throw new Error('Could not find all required location data');
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
    // This effect should only run once on mount
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
    isInitialized,

    // Methods
    selectLocation,
    resetToNearestLocation,
    refreshUserLocation,
    fetchNearestCity: fetchNearestCityImpl, // Renamed to be clearer - this is THE source of truth

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