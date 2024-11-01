// src/hooks/useOrganizers.js
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useOrganizers = () => {
  const regionContext = useContext(RegionsContext);
  const selectedRegionID = regionContext ? regionContext.selectedRegionID : null;

  const [organizers, setOrganizers] = useState([]);
  const [organizer, setOrganizer] = useState(null); // Single organizer data
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
  }, [selectedRegionID]);

  // New function to fetch organizer by ID
  const fetchOrganizerById = useCallback(async (organizerId) => {
    try {
      console.error('Calling fetchOrganizerById with organizerId:', organizerId);
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`);
      setOrganizer(response.data);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrganizer = async (organizerId, updateData) => {
    try {
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

  return { organizers, organizer, setOrganizer, loading, error, fetchOrganizerById, updateOrganizer };
};