'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';

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

  const baseURL = process.env.NEXT_PUBLIC_BE_URL;

  const fetchCountries = useCallback(
    async (isActive = true) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseURL}/api/masteredLocations/countries`, {
          params: { isActive },
        });
        setCountries(response.data);
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
        const response = await axios.get(`${baseURL}/api/masteredLocations/regions`, {
          params: { countryId, isActive },
        });
        setRegions(response.data);
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
        const response = await axios.get(`${baseURL}/api/masteredLocations/divisions`, {
          params: { regionId, isActive },
        });
        setDivisions(response.data);
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
    async (divisionId, isActive = true) => {
      if (!divisionId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseURL}/api/masteredLocations/cities`, {
          params: { divisionId, isActive },
        });
        setCities(response.data);
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
        const response = await axios.get(`${baseURL}/api/masteredLocations/nearestMastered`, {
          params: {
            latitude,
            longitude,
            maxDistance,
            isActive,
          },
        });
        console.log('Nearest Mastered Location Response:', response.data);
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
