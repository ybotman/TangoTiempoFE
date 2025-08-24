import { useCallback, useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '@/contexts/AuthContext';
import { dedupeFetch } from '@/utils/dedupeFetch';

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
// TIEMPO-276: Security cleanup - removed logging
      }
      setLoading(false); // Ensure loading is set to false
      return;
    }

    // TIEMPO-272: Check timestamp instead of boolean for retry logic
    const lastAttempt = sessionStorage.getItem(`user_404_${user.uid}`);
    if (lastAttempt) {
      const timeSinceAttempt = Date.now() - parseInt(lastAttempt);
      if (timeSinceAttempt < 30000) { // Only skip for 30 seconds
        console.log('Skipping fetch - waiting before retry');
        setLoading(false);
        return;
      }
      // Clear the flag after cooldown period
      sessionStorage.removeItem(`user_404_${user.uid}`);
    }

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment
    const endpoint = `${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/firebase/${user.uid}`;

    try {
      setLoading(true);
      // Only log initial fetch
      if (!hasLoggedFetch.current) {
// TIEMPO-276: Security cleanup - removed logging
        hasLoggedFetch.current = true;
      }

      // TIEMPO-257: Use dedupeFetch to prevent duplicate calls
      const response = await dedupeFetch(endpoint, {
        params: { appId },
      });

      // Only log if defaults changed
      const currentDefaults = JSON.stringify(response.data?.localUserInfo?.userDefaults);
      if (lastLoggedDefaults.current !== currentDefaults) {
        // TIEMPO-276: Security cleanup - removed logging
        lastLoggedDefaults.current = currentDefaults;
      }
      setUserData(response.data);
    } catch (error) {
      console.error('UU: Error fetching user data:', error);
      // TIEMPO-272: If user doesn't exist (404), store timestamp for retry logic
      if (error.response?.status === 404) {
        sessionStorage.setItem(`user_404_${user.uid}`, Date.now().toString());
      }
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
// TIEMPO-276: Security cleanup - removed logging

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
          // TIEMPO-276: Security cleanup - removed logging
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
