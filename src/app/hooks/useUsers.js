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

  const updateUserData = useCallback(
    async (updatedData) => {
      if (!user?.uid) {
        console.error('User is not authenticated.');
        return;
      }
      try {
        const dataToUpdate = {
          firebaseUserId: user.uid,
          ...updatedData,
        };

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/updateUserInfo`,
          dataToUpdate
        );
        setUserData(response.data.updatedUser);
        console.log('User data updated successfully');
      } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
      }
    },
    [setUserData, user?.uid]
  );

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    } else {
      console.log('User not available yet.');
      setLoading(false);
    }
  }, [fetchUserData, user?.uid]);

  return { userData, loading, updateUserData };
};
