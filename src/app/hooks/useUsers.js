import { useCallback, useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';

export const useUsers = () => {
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Refs for smarter logging
  const hasLoggedFetch = useRef(false);
  const lastLoggedDefaults = useRef(null);

  const fetchUserData = useCallback(async () => {
    if (!user?.uid) {
      // Only log this once
      if (!hasLoggedFetch.current) {
        console.log('useUsers: Waiting for user authentication');
      }
      setLoading(false); // Ensure loading is set to false
      return;
    }

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment
    const endpoint = `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`;

    try {
      setLoading(true);
      // Only log initial fetch
      if (!hasLoggedFetch.current) {
        console.log('useUsers: Fetching user data for:', user.uid);
        hasLoggedFetch.current = true;
      }

      // Include appId as a query parameter
      const response = await axios.get(endpoint, {
        params: { appId },
      });

      // Only log if defaults changed
      const currentDefaults = JSON.stringify(response.data?.localUserInfo?.userDefaults);
      if (lastLoggedDefaults.current !== currentDefaults) {
        console.log('useUsers: User preferences loaded:', {
          hasCityPreferences: !!(response.data?.localUserInfo?.userDefaults?.masteredCityIds?.length),
          hasMapPreferences: !!response.data?.localUserInfo?.userDefaults?.useCenterLocation
        });
        lastLoggedDefaults.current = currentDefaults;
      }
      setUserData(response.data);
    } catch (error) {
      console.error('UU: Error fetching user data:', error);
    } finally {
      setLoading(false);
      // Remove verbose logging
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
        // Data should now always be properly structured (no dot notation)
        const dataToUpdate = {
          firebaseUserId: user.uid,
          appId,
          ...updatedData
        };

        // Log updates with payload details
        console.log('useUsers: Updating user preferences with data:', JSON.stringify(dataToUpdate, null, 2));

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
        // Log update success with key info only
        const prefs = updatedUserData?.localUserInfo?.userDefaults;
        if (prefs) {
          console.log('useUsers: Preferences updated:', {
            mode: prefs.useCenterLocation ? 'map' : 'cities',
            cityCount: prefs.masteredCityIds?.length || 0,
            hasDefaultCenterLocation: !!prefs.defaultCenterLocation,
            defaultCenterLocation: prefs.defaultCenterLocation
          });
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
      // Remove redundant logging
      setLoading(false);
    }
  }, [fetchUserData, user?.uid]);

  return { userData, loading, updateUserData, refreshUserData: fetchUserData };
};
