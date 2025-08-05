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
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/mastered-cities`, {
        params: { appId }
      });

      // Sort cities by state and then by city name
      const sortedCities = (response.data.masteredCities || response.data || []).sort((a, b) => {
        const stateCompare = (a.stateAbbr || '').localeCompare(b.stateAbbr || '');
        if (stateCompare !== 0) return stateCompare;
        return (a.city || '').localeCompare(b.city || '');
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