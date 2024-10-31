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
  }, [selectedRegionID]);

  // Function to upload image
  const uploadOrganizerImage = async (organizerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organizerId', organizerId);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Image upload successful:', response.data);
      return response.data; // Return the response data if you want to use it
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      throw uploadError;
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  return { organizers, loading, error, uploadOrganizerImage };
};
