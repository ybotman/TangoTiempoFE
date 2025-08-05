import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useMasteredCities = (includeInactive = false) => {
  const [masteredCities, setMasteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMasteredCities = useCallback(async () => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const baseURL = process.env.NEXT_PUBLIC_BE_URL;
      
      // Fetch all data in parallel
      const [citiesRes, divisionsRes, regionsRes, countriesRes] = await Promise.all([
        axios.get(`${baseURL}/api/masteredLocations/cities`, { params: { appId } }),
        axios.get(`${baseURL}/api/masteredLocations/divisions`, { params: { appId } }),
        axios.get(`${baseURL}/api/masteredLocations/regions`, { params: { appId } }),
        axios.get(`${baseURL}/api/masteredLocations/countries`, { params: { appId } })
      ]);

      // Extract data arrays
      const cities = citiesRes.data.cities || [];
      const divisions = divisionsRes.data.divisions || [];
      const regions = regionsRes.data.regions || [];
      const countries = countriesRes.data.countries || [];

      // Build lookup maps
      const divisionMap = {};
      divisions.forEach(div => {
        divisionMap[div._id] = div;
      });

      const regionMap = {};
      regions.forEach(reg => {
        regionMap[reg._id] = reg;
      });

      const countryMap = {};
      countries.forEach(country => {
        countryMap[country._id] = country;
      });

      // Transform cities with hierarchy
      const transformedCities = cities
        .filter(city => {
          // Filter by active status
          if (!includeInactive && !city.active) {
            return false;
          }
          return true;
        })
        .map(city => {
          // Get division
          const division = divisionMap[city.masteredDivisionId];
          if (!division) {
            return {
              ...city,
              displayName: city.cityName || 'Unknown City',
              hierarchyMissing: true
            };
          }

          // Get region
          const region = regionMap[division.masteredRegionId];
          if (!region) {
            return {
              ...city,
              displayName: `${division.divisionName} - ${city.cityName}`,
              hierarchyMissing: true
            };
          }

          // Get country
          const country = countryMap[region.masteredCountryId];
          const countryName = country ? country.countryName : 'Unknown Country';

          // Build display name
          const displayName = `${countryName} - ${region.regionName} - ${division.divisionName} - ${city.cityName}`;

          return {
            ...city,
            displayName,
            divisionName: division.divisionName,
            regionName: region.regionName,
            countryName,
            hierarchyComplete: true
          };
        })
        .filter(city => {
          // Only show US cities for now as requested
          return city.countryName === 'United States';
        })
        .sort((a, b) => {
          // Sort by display name
          return a.displayName.localeCompare(b.displayName);
        });

      setMasteredCities(transformedCities);
      setError(null);
    } catch (error) {
      console.error('Error fetching mastered cities:', error);
      setError(error);
      setMasteredCities([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchMasteredCities();
  }, [fetchMasteredCities]);

  return {
    masteredCities,
    loading,
    error,
    refetch: fetchMasteredCities
  };
};