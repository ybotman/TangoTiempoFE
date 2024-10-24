import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useLocations = () => {
  const { selectedRegionID } = useContext(RegionsContext); // Get region _id from RegionsContext
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch locations by region ID

  const fetchLocations = useCallback(async () => {
    const endpoint = selectedRegionID
      ? `${process.env.NEXT_PUBLIC_BE_URL}/api/locations?regionID=${selectedRegionID}`
      : `${process.env.NEXT_PUBLIC_BE_URL}/api/locations`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint);

      setLocations(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegionID]);

  // Function to fetch a single location by its ID
  const getLocationById = useCallback(async (locationID) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/locations/${locationID}`
      );
      return response.data;
    } catch (error) {
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]); // Fetch locations when selectedRegionID changes

  return { locations, getLocationById, loading, error };
};
