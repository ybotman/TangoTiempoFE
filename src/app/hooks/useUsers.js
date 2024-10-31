// @/hooks/useUsers.js
import { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';

export const useUsers = () => {
  const auth = useContext(AuthContext); // Get the AuthContext safely
  const { user } = auth || {}; // Destructure user only if auth is defined
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data by Firebase ID
  const fetchUserData = useCallback(async () => {
    if (!user?.uid) {
      console.log("AuthContext or user not yet initialized.");
      return;
    }

    const endpoint = `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Function to update user data
  const updateUserData = async (updatedData) => {
    if (!user?.uid) {
      console.log("User UID not available for updating.");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/updateUserInfo`,
        {
          firebaseUserId: user.uid,
          ...updatedData,
        }
      );
      setUserData((prevData) => ({ ...prevData, ...updatedData }));
      console.log('User data updated successfully:', response.data);
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