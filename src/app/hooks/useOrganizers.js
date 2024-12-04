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
  const [fetchLoading, setFetchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch organizers based on selected region
  const fetchOrganizers = useCallback(async () => {
    const endpoint = selectedRegionID
      ? `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers?regionID=${selectedRegionID}`
      : `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`;

    try {
      setFetchLoading(true);
      const response = await axios.get(endpoint);
      setOrganizers(response.data);
      // console.log('Organizers fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setError(error);
    } finally {
      setFetchLoading(false);
    }
  }, [selectedRegionID]);

  // Fetch a single organizer by ID
  const fetchOrganizerById = useCallback(async (organizerId) => {
    // console.log('fetchOrganizerById called with organizerId:', organizerId);
    try {
      setFetchLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`
      );
      setOrganizer(response.data);
      // console.log('Organizer fetched successfully:', response.data);
    } catch (fetchError) {
      console.error('Error fetching organizer:', fetchError);
      setError(fetchError);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  // Fetch an organizer by firebaseUserId
  const fetchOrganizerByFirebaseUserId = useCallback(async (firebaseUserId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/firebase/${firebaseUserId}`
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Organizer not found
      } else {
        console.error('Error fetching organizer by firebaseUserId:', error);
        throw error;
      }
    }
  }, []);

  // Update an existing organizer
  const updateOrganizer = async (organizerId, updateData) => {
    try {
      // console.log('updateOrganizer:', organizerId, updateData);
      setUpdateLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`,
        updateData
      );
      // console.log('Organizer updated successfully:', response.data);
      setOrganizer(response.data); // Update organizer state with response data
      return response.data;
    } catch (updateError) {
      console.error('Error updating organizer:', updateError);
      throw updateError;
    } finally {
      setUpdateLoading(false);
    }
  };

  // Create a new organizer
  const createOrganizer = useCallback(async (organizerData) => {
    try {
      setCreateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`,
        organizerData
      );
      // console.log('Organizer created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating organizer:', error);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  }, []);

  // Effect to fetch organizers when the selected region changes
  useEffect(() => {
    // console.log('useOrganizers useEffect triggered');
    // console.log('selectedRegionID:', selectedRegionID);
    if (!selectedRegionID) {
      console.log('No region selected. Skipping fetchOrganizers.');
      setFetchLoading(false); // Ensure loading is set to false
      return;
    }

    fetchOrganizers();
  }, [fetchOrganizers]);

  return {
    organizers,
    organizer,
    setOrganizer,
    fetchLoading,
    createLoading,
    updateLoading,
    error,
    fetchOrganizerById,
    fetchOrganizerByFirebaseUserId,
    updateOrganizer,
    createOrganizer,
  };
};
