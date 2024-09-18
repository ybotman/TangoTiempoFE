import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useOrganizers = () => {
  const { selectedRegionID } = useContext(RegionsContext); // Get region _id from RegionsContext
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      if (!selectedRegionID) return; // Skip fetching if no region is selected

      try {
        setLoading(true);
        const response = await axios.get(`/api/organizers?regionID=${selectedRegionID}`);
        setOrganizers(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, [selectedRegionID]); // Fetch organizers when regionID changes

  return { organizers, loading, error };
};