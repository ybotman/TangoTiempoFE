// src/hooks/useOrganizers.js
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useOrganizers = () => {
  const regionContext = useContext(RegionsContext);
  const selectedRegionID = regionContext
    ? regionContext.selectedRegionID
    : null;

  const [organizers, setOrganizers] = useState([]);
  const [organizer, setOrganizer] = useState(null); // Single organizer data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizers = useCallback(async () => {
    console.log(
      'fetchOrganizers called with selectedRegionID:',
      selectedRegionID
    );
    const endpoint = selectedRegionID
      ? `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers?regionID=${selectedRegionID}`
      : `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint);
      setOrganizers(response.data);
      console.log('Organizers fetched successfully:', response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegionID]);

  const fetchOrganizerById = useCallback(async (organizerId) => {
    console.log('fetchOrganizerById called with organizerId:', organizerId);
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`
      );
      setOrganizer(response.data);
      console.log('Organizer fetched successfully:', response.data);
    } catch (fetchError) {
      console.error('Error fetching organizer:', fetchError); // Use fetchError here
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrganizer = async (organizerId, updateData) => {
    try {
      console.log('updateOrganizer:', organizerId, updateData);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`,
        updateData
      );
      console.log('Organizer updated successfully:', response.data);
      setOrganizer(response.data); // Update organizer state with response data
      return response.data;
    } catch (updateError) {
      console.error('Error updating organizer:', updateError);
      throw updateError;
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  return {
    organizers,
    organizer,
    setOrganizer,
    loading,
    error,
    fetchOrganizerById,
    updateOrganizer,
  };
};
