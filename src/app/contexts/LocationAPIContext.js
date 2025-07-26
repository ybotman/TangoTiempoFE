// src/app/contexts/LocationAPIContext.js
'use client';

/**
 * LocationAPIContext - Pure API data provider for location services
 * 
 * This context is a renamed and refactored version of MasteredLocationContext.
 * It serves as a pure data provider that:
 * - Makes API calls to fetch location data
 * - Emits events via LocationEventBus
 * - Has NO state management beyond loading/error states
 * - Has NO dependencies on other contexts (breaks circular dependencies)
 * 
 * The term "Mastered" refers to the curated/verified location list from the API
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';

const LocationAPIContext = createContext();

export const LocationAPIProvider = ({ children }) => {
  // Only keep minimal state for API status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch nearest city from coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} maxDistance - Maximum distance in meters (default 500km)
   * @returns {Promise<Object>} City data
   */
  const fetchNearestCity = useCallback(async (latitude, longitude, maxDistance = 500000) => {
    // Validate coordinates
    if (latitude === undefined || latitude === null || 
        longitude === undefined || longitude === null || 
        isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      const errorMessage = 'Invalid or missing coordinates for nearest city lookup';
      console.error('[LocationAPIContext] fetchNearestCity - Invalid coordinates', { latitude, longitude });
      
      // Emit error event
      locationEventBus.emit(LOCATION_EVENTS.LOCATION_ERROR, {
        error: errorMessage,
        operation: 'fetchNearestCity',
        details: { latitude, longitude }
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    setLoading(true);
    setError(null);
    
    // Emit loading started event
    locationEventBus.emit(LOCATION_EVENTS.LOADING_STARTED, { operation: 'fetchNearestCity' });
    
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';
      const url = `${baseURL}/api/masteredLocations/nearestMastered?latitude=${parsedLatitude}&longitude=${parsedLongitude}&maxDistance=${maxDistance}&isActive=true&appId=${appId}`;

      console.log('[LocationAPIContext] Fetching nearest city:', { latitude: parsedLatitude, longitude: parsedLongitude });

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          const errorMessage = 'No nearby city found within search radius';
          console.log('[LocationAPIContext] No nearby city found');
          
          // Emit specific error for no city found
          locationEventBus.emit(LOCATION_EVENTS.LOCATION_ERROR, {
            error: errorMessage,
            operation: 'fetchNearestCity',
            details: { status: 404, coordinates: { latitude: parsedLatitude, longitude: parsedLongitude } }
          });
          
          throw new Error(errorMessage);
        }

        const errorMessage = `Error fetching nearest city: ${response.statusText || 'Unknown error'}`;
        setError(errorMessage);
        
        // Emit API error event
        locationEventBus.emit(LOCATION_EVENTS.API_ERROR, {
          error: errorMessage,
          operation: 'fetchNearestCity',
          status: response.status
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Extract coordinates with fallbacks
      let cityLatitude = null;
      let cityLongitude = null;
      
      if (data.latitude !== undefined && data.latitude !== null && !isNaN(parseFloat(data.latitude))) {
        cityLatitude = parseFloat(data.latitude);
      } else if (data.location?.coordinates?.length >= 2 && !isNaN(parseFloat(data.location.coordinates[1]))) {
        cityLatitude = parseFloat(data.location.coordinates[1]);
      }
      
      if (data.longitude !== undefined && data.longitude !== null && !isNaN(parseFloat(data.longitude))) {
        cityLongitude = parseFloat(data.longitude);
      } else if (data.location?.coordinates?.length >= 2 && !isNaN(parseFloat(data.location.coordinates[0]))) {
        cityLongitude = parseFloat(data.location.coordinates[0]);
      }

      const cityData = {
        cityID: data.cityID || data._id,
        cityName: data.cityName || data.name || 'Unknown',
        regionID: data.regionID || data.masteredRegionId,
        regionName: data.regionName || 'Unknown Region',
        divisionID: data.divisionID || data.masteredDivisionId,
        divisionName: data.divisionName || 'Unknown Division',
        countryID: data.countryID || data.masteredCountryId,
        countryName: data.countryName || 'Unknown Country',
        latitude: cityLatitude,
        longitude: cityLongitude,
        isFallback: !cityLatitude || !cityLongitude || !data.cityID || !data.regionID || !data.divisionID || !data.countryID
      };

      console.log('[LocationAPIContext] Nearest city fetched:', cityData.cityName);

      // Emit success event with city data
      locationEventBus.emit(LOCATION_EVENTS.NEAREST_CITY_FETCHED, {
        cityData,
        coordinates: { latitude: parsedLatitude, longitude: parsedLongitude }
      });

      return cityData;
    } catch (err) {
      const errorMessage = err?.message || 'Unknown error fetching nearest city';
      console.error('[LocationAPIContext] Error fetching nearest city:', errorMessage);
      setError(errorMessage);
      
      // Error event already emitted above
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      // Emit loading completed event
      locationEventBus.emit(LOCATION_EVENTS.LOADING_COMPLETED, { operation: 'fetchNearestCity' });
    }
  }, []);

  /**
   * Fetch cities for a division or all cities
   * @param {string} divisionId - Optional division ID to filter by
   * @param {boolean} isActive - Whether to fetch only active cities
   * @param {boolean} requireCoordinates - Whether to filter out cities without coordinates
   * @returns {Promise<Array>} Array of cities
   */
  const fetchCities = useCallback(async (divisionId, isActive = true, requireCoordinates = true) => {
    setLoading(true);
    setError(null);
    
    // Emit loading started event
    locationEventBus.emit(LOCATION_EVENTS.LOADING_STARTED, { operation: 'fetchCities' });
    
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      let url = `${baseURL}/api/masteredLocations/cities?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (divisionId) {
        url += `&divisionId=${divisionId}`;
      }

      console.log('[LocationAPIContext] Fetching cities:', { divisionId, isActive });

      const response = await fetch(url);

      if (!response.ok) {
        const errorMessage = `Error fetching cities: ${response.statusText}`;
        
        // Emit API error event
        locationEventBus.emit(LOCATION_EVENTS.API_ERROR, {
          error: errorMessage,
          operation: 'fetchCities',
          status: response.status
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle different API response formats
      let citiesArray = Array.isArray(data) ? data : (data.cities || []);

      // Process cities to ensure consistent format
      const processedCities = citiesArray.map(city => {
        let latitude = city.latitude;
        let longitude = city.longitude;

        // Extract from GeoJSON if needed
        if ((latitude === undefined || longitude === undefined) &&
            city.location?.type === 'Point' &&
            Array.isArray(city.location.coordinates) &&
            city.location.coordinates.length === 2) {
          longitude = city.location.coordinates[0];
          latitude = city.location.coordinates[1];
        }

        return {
          ...city,
          _id: city._id || city.cityID,
          cityName: city.cityName || city.name || 'Unknown City',
          latitude,
          longitude
        };
      });

      // Filter cities with coordinates if required
      const finalCities = requireCoordinates
        ? processedCities.filter(city => 
            city.latitude != null && 
            city.longitude != null && 
            !isNaN(parseFloat(city.latitude)) && 
            !isNaN(parseFloat(city.longitude))
          )
        : processedCities;

      console.log(`[LocationAPIContext] Fetched ${finalCities.length} cities`);

      // Emit success event with cities data
      locationEventBus.emit(LOCATION_EVENTS.CITIES_FETCHED, {
        cities: finalCities,
        divisionId,
        divisionName: divisionId ? finalCities[0]?.divisionName : null
      });

      return finalCities;
    } catch (err) {
      const errorMessage = err?.message || 'Unknown error fetching cities';
      console.error('[LocationAPIContext] Error fetching cities:', errorMessage);
      setError(errorMessage);
      
      // Error event already emitted above
      return [];
    } finally {
      setLoading(false);
      // Emit loading completed event
      locationEventBus.emit(LOCATION_EVENTS.LOADING_COMPLETED, { operation: 'fetchCities' });
    }
  }, []);

  /**
   * Fetch regions for a country or all regions
   * @param {string} countryId - Optional country ID to filter by
   * @param {boolean} isActive - Whether to fetch only active regions
   * @returns {Promise<Array>} Array of regions
   */
  const fetchRegions = useCallback(async (countryId, isActive = true) => {
    setLoading(true);
    setError(null);
    
    // Emit loading started event
    locationEventBus.emit(LOCATION_EVENTS.LOADING_STARTED, { operation: 'fetchRegions' });
    
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      let url = `${baseURL}/api/masteredLocations/regions?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (countryId) {
        url += `&countryId=${countryId}`;
      }

      console.log('[LocationAPIContext] Fetching regions:', { countryId, isActive });

      const response = await fetch(url);

      if (!response.ok) {
        const errorMessage = `Error fetching regions: ${response.statusText}`;
        
        // Emit API error event
        locationEventBus.emit(LOCATION_EVENTS.API_ERROR, {
          error: errorMessage,
          operation: 'fetchRegions',
          status: response.status
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle different API response formats
      const regionsArray = Array.isArray(data) ? data : (data.regions || []);
      
      // Process regions to ensure consistent format
      const processedRegions = regionsArray.map(region => ({
        ...region,
        _id: region._id || region.regionID,
        regionName: region.regionName || region.name || 'Unknown Region'
      }));

      console.log(`[LocationAPIContext] Fetched ${processedRegions.length} regions`);

      // Emit success event with regions data
      locationEventBus.emit(LOCATION_EVENTS.REGIONS_FETCHED, {
        regions: processedRegions,
        countryId
      });

      return processedRegions;
    } catch (err) {
      const errorMessage = err?.message || 'Unknown error fetching regions';
      console.error('[LocationAPIContext] Error fetching regions:', errorMessage);
      setError(errorMessage);
      
      // Error event already emitted above
      return [];
    } finally {
      setLoading(false);
      // Emit loading completed event
      locationEventBus.emit(LOCATION_EVENTS.LOADING_COMPLETED, { operation: 'fetchRegions' });
    }
  }, []);

  /**
   * Fetch divisions for a region or all divisions
   * @param {string} regionId - Optional region ID to filter by
   * @param {boolean} isActive - Whether to fetch only active divisions
   * @returns {Promise<Array>} Array of divisions
   */
  const fetchDivisions = useCallback(async (regionId, isActive = true) => {
    setLoading(true);
    setError(null);
    
    // Emit loading started event
    locationEventBus.emit(LOCATION_EVENTS.LOADING_STARTED, { operation: 'fetchDivisions' });
    
    try {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL || '';

      let url = `${baseURL}/api/masteredLocations/divisions?appId=${appId}&isActive=${isActive ? 'true' : 'false'}`;
      if (regionId) {
        url += `&regionId=${regionId}`;
      }

      console.log('[LocationAPIContext] Fetching divisions:', { regionId, isActive });

      const response = await fetch(url);

      if (!response.ok) {
        const errorMessage = `Error fetching divisions: ${response.statusText}`;
        
        // Emit API error event
        locationEventBus.emit(LOCATION_EVENTS.API_ERROR, {
          error: errorMessage,
          operation: 'fetchDivisions',
          status: response.status
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle different API response formats
      const divisionsArray = Array.isArray(data) ? data : (data.divisions || []);
      
      // Process divisions to ensure consistent format
      const processedDivisions = divisionsArray.map(division => ({
        ...division,
        _id: division._id || division.divisionID,
        divisionName: division.divisionName || division.name || 'Unknown Division'
      }));

      console.log(`[LocationAPIContext] Fetched ${processedDivisions.length} divisions`);

      // Emit success event with divisions data
      locationEventBus.emit(LOCATION_EVENTS.DIVISIONS_FETCHED, {
        divisions: processedDivisions,
        regionId
      });

      return processedDivisions;
    } catch (err) {
      const errorMessage = err?.message || 'Unknown error fetching divisions';
      console.error('[LocationAPIContext] Error fetching divisions:', errorMessage);
      setError(errorMessage);
      
      // Error event already emitted above
      return [];
    } finally {
      setLoading(false);
      // Emit loading completed event
      locationEventBus.emit(LOCATION_EVENTS.LOADING_COMPLETED, { operation: 'fetchDivisions' });
    }
  }, []);

  // Context value only includes API functions and minimal state
  const contextValue = {
    // API state
    loading,
    error,
    // API functions
    fetchNearestCity,
    fetchCities,
    fetchRegions,
    fetchDivisions
  };

  return (
    <LocationAPIContext.Provider value={contextValue}>
      {children}
    </LocationAPIContext.Provider>
  );
};

LocationAPIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export both the old name (for compatibility) and new name
export const useMasteredLocation = () => useContext(LocationAPIContext);
export const useLocationAPI = () => useContext(LocationAPIContext);