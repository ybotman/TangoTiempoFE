// src/hooks/useOrganizers.js
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

export const useOrganizers = () => {
  const { selectedLocation } = useGeoLocation();
  
  // Get location IDs for filtering
  const masteredRegionId = selectedLocation?.region?.id || null;
  const masteredDivisionId = selectedLocation?.division?.id || null;
  const masteredCityId = selectedLocation?.city?.id || null;

  const [organizers, setOrganizers] = useState([]);
  const [organizer, setOrganizer] = useState(null); // Single organizer data
  const [fetchLoading, setFetchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch organizers based on selected location hierarchy from GeoLocationContext
  const fetchOrganizers = useCallback(async () => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
    const params = { 
      appId,
      isActive: true // Only fetch active organizers by default
    };

    // Add location filters from the GeoLocationContext
    if (masteredRegionId) {
      params.masteredRegionId = masteredRegionId;
    }
    
    if (masteredDivisionId) {
      params.masteredDivisionId = masteredDivisionId;
    }
    
    if (masteredCityId) {
      params.masteredCityId = masteredCityId;
    }

    try {
      setFetchLoading(true);
      console.log('Fetching organizers with params:', params);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`, { params });
      console.log('Organizers fetched successfully:', response.data);
      setOrganizers(response.data);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setError(error);
    } finally {
      setFetchLoading(false);
    }
  }, [masteredRegionId, masteredDivisionId, masteredCityId]);

  // Fetch a single organizer by ID
  const fetchOrganizerById = useCallback(async (organizerId) => {
    console.log('fetchOrganizerById called with organizerId:', organizerId);
    try {
      setFetchLoading(true);
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`, {
        params: { appId },
      });
      console.log('Organizer fetched successfully:', response.data);
      setOrganizer(response.data);
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
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/firebase/${firebaseUserId}`, {
        params: { appId },
      });
      console.log('Organizer by Firebase ID fetched:', response.data);
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
      console.log('updateOrganizer:', organizerId, updateData);
      setUpdateLoading(true);

      // Add appId to the update data
      const dataWithAppId = {
        ...updateData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`,
        dataWithAppId
      );
      console.log('Organizer updated successfully:', response.data);
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
      const dataWithAppId = {
        ...organizerData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`, dataWithAppId);
      console.log('Organizer created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating organizer:', error);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  }, []);

  // Effect to fetch organizers when the selected location hierarchy changes
  useEffect(() => {
    // Always fetch organizers regardless of whether a region is selected
    // The API will return appropriate defaults
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
