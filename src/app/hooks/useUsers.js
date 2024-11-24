// src/hooks/useUsers.js
import { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';

export const useUsers = () => {
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) {
      console.log('AuthContext or user not yet initialized.');
      setLoading(false); // Ensure loading is set to false
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`;

    try {
      setLoading(true);
      console.log('Fetching user data from:', endpoint);
      const response = await axios.get(endpoint);
      console.log('User data fetched:', response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
      console.log('Finished fetching user data. Loading is now false.');
    }
  }, [user?.uid]);

  const updateUserData = async (updatedData) => {
    if (!user?.uid) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/updateUserInfo`,
        {
          firebaseUserId: user.uid,
          ...updatedData,
        }
      );
      // Update local state with the updated data from the server
      setUserData(response.data);
      console.log('User data updated successfully');
    } catch (updateError) {
      console.error('Error updating user data:', updateError);
      throw updateError;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { userData, loading, updateUserData };
};
