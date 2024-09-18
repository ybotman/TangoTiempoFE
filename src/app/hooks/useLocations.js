import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useLocations = () => {
  const { selectedRegionID } = useContext(RegionsContext); // Get region _id from RegionsContext
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedRegionID) return; // If no region is selected, skip fetching

      try {
        setLoading(true);
        const response = await axios.get(`/api/locations?regionID=${selectedRegionID}`);
        setLocations(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [selectedRegionID]); // Whenever regionID changes, fetch new locations

  return { locations, loading, error };
};