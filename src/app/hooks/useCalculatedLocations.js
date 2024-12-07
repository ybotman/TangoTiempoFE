// src/app/hooks/useCalculatedLocations.js
'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
//import PropTypes from 'prop-types';

export function useCalculatedLocations() {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.NEXT_PUBLIC_BE_URL;

  const fetchCountries = useCallback(
    async (isActive = true) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseURL}/api/calculatedLocations/countries`, {
          params: { isActive },
        });
        setCountries(response.data);
      } catch (err) {
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
        const response = await axios.get(`${baseURL}/api/calculatedLocations/regions`, {
          params: { countryId, isActive },
        });
        setRegions(response.data);
      } catch (err) {
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
        const response = await axios.get(`${baseURL}/api/calculatedLocations/divisions`, {
          params: { regionId, isActive },
        });
        setDivisions(response.data);
      } catch (err) {
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
        const response = await axios.get(`${baseURL}/api/calculatedLocations/cities`, {
          params: { divisionId, isActive },
        });
        setCities(response.data);
      } catch (err) {
        setError(err.message);
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
    loading,
    error,
    fetchCountries,
    fetchRegions,
    fetchDivisions,
    fetchCities,
  };
}

useCalculatedLocations.propTypes = {};
