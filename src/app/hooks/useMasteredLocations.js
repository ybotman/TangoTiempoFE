// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

export function useMasteredLocations() {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [cities, setCities] = useState([]);
  const [nearestCity, setNearestCity] = useState({
    cityID: null,
    cityName: 'Unknown',
    distance: null,
    regionID: null,
    regionName: 'Unknown',
    divisionID: null,
    divisionName: 'Unknown',
    countryID: null,
    countryName: 'Unknown',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = getApiBaseUrl();

  const fetchCountries = useCallback(
    async (isActive = true) => {
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${baseURL}/api/masteredLocations/countries`, {
          params: { isActive, appId },
        });
        // Handle both array and object with countries property
        const countriesData = Array.isArray(response.data) ? response.data : (response.data.countries || []);
        setCountries(countriesData);
      } catch (err) {
        console.error('Error fetching countries:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  const fetchRegions = useCallback(
    async (countryId, isActive = true) => {
      if (!countryId) return;
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${baseURL}/api/masteredLocations/regions`, {
          params: { countryId, isActive, appId },
        });
        // Handle both array and object with regions property
        const regionsData = Array.isArray(response.data) ? response.data : (response.data.regions || []);
        setRegions(regionsData);
      } catch (err) {
        console.error('Error fetching regions:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  const fetchDivisions = useCallback(
    async (regionId, isActive = true) => {
      if (!regionId) return;
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${baseURL}/api/masteredLocations/divisions`, {
          params: { regionId, isActive, appId },
        });
        // Handle both array and object with divisions property
        const divisionsData = Array.isArray(response.data) ? response.data : (response.data.divisions || []);
        setDivisions(divisionsData);
      } catch (err) {
        console.error('Error fetching divisions:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  const fetchCities = useCallback(
    async (divisionId, isActive = true, requireCoordinates = true) => {
// TIEMPO-276: Security cleanup - removed logging
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
// TIEMPO-276: Security cleanup - removed logging

        const response = await axios.get(`${baseURL}/api/masteredLocations/cities`, {
          params: {
            divisionId,
            isActive: isActive ? 'true' : 'false',
            appId,
          },
        });

// TIEMPO-276: Security cleanup - removed logging
// TIEMPO-276: Security cleanup - removed logging
// TIEMPO-276: Security cleanup - removed logging
        
        // Check the response structure - it might be {cities: [...]} format
        let citiesArray = response.data;
        
        // Handle response.data.cities structure (API returns an object with cities array)
        if (!Array.isArray(response.data) && response.data.cities && Array.isArray(response.data.cities)) {
// TIEMPO-276: Security cleanup - removed logging
          citiesArray = response.data.cities;
        } else if (!Array.isArray(response.data)) {
          console.error('Error: API response data is not an array and has no cities property:', response.data);
          setCities([]);
          setError('City data is in an invalid format. Please contact administrator.');
          return;
        }

        // If coordinates are required, filter cities with valid coordinates
        let citiesWithCoordinates;
        if (requireCoordinates) {
          citiesWithCoordinates = citiesArray.filter(
            (city) => city.latitude !== undefined &&
                     city.longitude !== undefined &&
                     city.latitude !== null &&
                     city.longitude !== null &&
                     !isNaN(parseFloat(city.latitude)) &&
                     !isNaN(parseFloat(city.longitude))
          );
        } else {
          // For user settings, return all cities regardless of coordinates
          citiesWithCoordinates = citiesArray;
        }

// TIEMPO-276: Security cleanup - removed logging

        // If we have cities with coordinates, log a sample
        if (citiesWithCoordinates.length > 0) {
// TIEMPO-276: Security cleanup - removed logging
        }
        // If we have cities but none with coordinates, check if this is a real problem
        else if (citiesArray.length > 0 && requireCoordinates) {
          // Check if any cities have location.coordinates even if not in the expected format
          const citiesWithAnyCoords = citiesArray.filter(
            city => city.location && city.location.coordinates
          );

          if (citiesWithAnyCoords.length > 0) {
// TIEMPO-276: Security cleanup - removed logging

            // Try to recover these coordinates by normalizing them
            const recoveredCities = citiesArray.map(city => {
              // If city has location.coordinates, try to extract them
              if (city.location && city.location.coordinates) {
                return {
                  ...city,
                  latitude: Array.isArray(city.location.coordinates) ?
                    city.location.coordinates[1] :
                    city.location.coordinates.latitude || city.latitude,
                  longitude: Array.isArray(city.location.coordinates) ?
                    city.location.coordinates[0] :
                    city.location.coordinates.longitude || city.longitude
                };
              }
              return city;
            }).filter(city =>
              city.latitude !== undefined &&
              city.longitude !== undefined &&
              city.latitude !== null &&
              city.longitude !== null
            );

            if (recoveredCities.length > 0) {
// TIEMPO-276: Security cleanup - removed logging
              // Use the recovered cities
              citiesWithCoordinates = recoveredCities;
            }
          }

          // Only log this as info if we still have no valid cities and coordinates are required
          if (citiesWithCoordinates.length === 0 && requireCoordinates) {
// TIEMPO-276: Security cleanup - removed logging
          }
        }
        // No cities at all - this is probably during initialization
        else {
// TIEMPO-276: Security cleanup - removed logging
        }
        setCities(citiesWithCoordinates);
      } catch (err) {
        console.error('Error fetching cities:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  const fetchNearestMastered = useCallback(
    async ({ latitude, longitude, maxDistance = 50000, isActive = true }) => {
      if (!latitude || !longitude) {
        const errorMessage = 'Latitude and longitude are required.';
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${baseURL}/api/masteredLocations/nearestMastered`, {
          params: {
            latitude,
            longitude,
            maxDistance,
            isActive,
            appId,
          },
        });
// TIEMPO-276: Security cleanup - removed logging
        setNearestCity(response.data);
      } catch (err) {
        console.error('Error fetching nearest mastered location:', err.message);
        setError(err.message);
        setNearestCity({
          cityID: null,
          cityName: 'Unknown. Use the map',
          distance: null,
          regionID: null,
          regionName: 'Unknown',
          divisionID: null,
          divisionName: 'Unknown',
          countryID: null,
          countryName: 'Unknown',
        });
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  return {
    countries,
    regions,
    divisions,
    cities,
    nearestCity,
    loading,
    error,
    fetchCountries,
    fetchRegions,
    fetchDivisions,
    fetchCities,
    fetchNearestMastered,
  };
}
