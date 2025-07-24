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
      console.log('UU: AuthContext or user not yet initialized.');
      setLoading(false); // Ensure loading is set to false
      return;
    }

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment
    const endpoint = `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`;

    try {
      setLoading(true);
      console.log('UU: Fetching user data from:', endpoint, 'with appId:', appId);

      // Include appId as a query parameter
      const response = await axios.get(endpoint, {
        params: { appId },
      });

      console.log('UU:fetch user data fetched:', response.data);
      console.log('UU:fetch userDefaults:', response.data?.localUserInfo?.userDefaults);
      setUserData(response.data);
    } catch (error) {
      console.error('UU: Error fetching user data:', error);
    } finally {
      setLoading(false);
      console.log('UU: Finished fetching user data. Loading is now false.');
    }
  }, [user?.uid]);

  const updateUserData = useCallback(
    async (updatedData) => {
      if (!user?.uid) {
        console.error('UU:Updt User is not authenticated.');
        return;
      }

      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment

      try {
        // Check if the data is already properly nested or if it's using dot notation
        const isNested = updatedData.localUserInfo && typeof updatedData.localUserInfo === 'object';
        
        const dataToUpdate = {
          firebaseUserId: user.uid,
          appId, // Include appId in the update payload
          ...(isNested ? updatedData : { ...updatedData }), // Use the data as-is if nested, otherwise spread it
        };

        console.log('UU:Updt Attempting to update user data with:', dataToUpdate);
        console.log('UU:Updt Data structure type:', isNested ? 'nested' : 'dot notation');

        // Use the optimized endpoint PUT /api/userlogins/updateUserInfo
        // This endpoint expects firebaseUserId and appId in the request body
        // It properly handles localUserInfo nesting
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/updateUserInfo`,
          dataToUpdate,
          { timeout: 15000 } // Add a longer client-side timeout for potentially slow operations
        );

        const updatedUserData = response.data.updatedUser || response.data;
        setUserData(updatedUserData);
        console.log('UU:Updt User data updated successfully');
        console.log('UU:Updt Updated user data:', updatedUserData?.localUserInfo?.userDefaults);
        
        // Log the specific fields we care about for debugging
        if (updatedUserData?.localUserInfo?.userDefaults) {
          console.log('UU:Updt masteredCityIds:', updatedUserData.localUserInfo.userDefaults.masteredCityIds);
          console.log('UU:Updt useCenterLocation:', updatedUserData.localUserInfo.userDefaults.useCenterLocation);
          console.log('UU:Updt defaultCenterLocation:', updatedUserData.localUserInfo.userDefaults.defaultCenterLocation);
        }
      } catch (error) {
        console.error('UU:Updt Error updating user data:', error);
        throw error;
      }
    },
    [setUserData, user?.uid]
  );

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    } else {
      console.log('UU:uE User not available yet.');
      setLoading(false);
    }
  }, [fetchUserData, user?.uid]);

  return { userData, loading, updateUserData };
};
