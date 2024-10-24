// @/hooks/useOrganizers.js
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useOrganizers = () => {
  const { selectedRegionID } = useContext(RegionsContext);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizers = useCallback(async () => {
    const endpoint = selectedRegionID
      ? `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers?regionID=${selectedRegionID}`
      : `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint);

      setOrganizers(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegionID]); // Re-fetch when selectedRegionID changes

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]); // Trigger the fetch operation when fetchOrganizers changes

  return { organizers, loading, error };
};
