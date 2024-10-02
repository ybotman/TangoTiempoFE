import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useLocations = () => {
  const { selectedRegionID } = useContext(RegionsContext); // Get region _id from RegionsContext
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocations = useCallback(async () => {
    if (!selectedRegionID) return; // If no region is selected, skip fetching

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/locations?regionID=${selectedRegionID}` //http://localhost:3000/api/locations?regionID=66c4d99042ec462ea22484bd
      );
      setLocations(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegionID]);

  useEffect(() => {
    fetchLocations();
  }); // Whenever regionID changes, fetch new locations

  return { locations, loading, error };
};
