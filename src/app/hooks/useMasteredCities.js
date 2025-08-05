import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useMasteredCities = () => {
  const [masteredCities, setMasteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMasteredCities = useCallback(async () => {
    try {
      setLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/masteredLocations/cities`, {
        params: { appId, isActive: 'true' }
      });

      // Handle different API response formats (similar to LocationAPIContext)
      const citiesArray = Array.isArray(response.data) ? response.data : (response.data.cities || []);
      
      // Sort cities by state and then by city name
      const sortedCities = citiesArray.sort((a, b) => {
        const stateCompare = (a.stateAbbr || '').localeCompare(b.stateAbbr || '');
        if (stateCompare !== 0) return stateCompare;
        return (a.cityName || a.city || '').localeCompare(b.cityName || b.city || '');
      });

      setMasteredCities(sortedCities);
      setError(null);
    } catch (error) {
      console.error('Error fetching mastered cities:', error);
      setError(error);
      setMasteredCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

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