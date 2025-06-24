// @/hooks/useMigratedOrganizers.js

import { useState, useEffect, useCallback } from 'react';

export const useMigratedOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMigrationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch organizers data - only enabled organizers
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const organizersResponse = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers?appId=${appId}&isApproved=true&isEnabled=true`);
      if (!organizersResponse.ok) {
        throw new Error('Failed to fetch organizers');
      }
      const organizersResult = await organizersResponse.json();
      const organizersData = organizersResult.organizers || [];

      // Fetch user logins data to match with organizers
      const userLoginsResponse = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/userlogins/all?appId=${appId}`);
      if (!userLoginsResponse.ok) {
        throw new Error('Failed to fetch user logins');
      }
      const userLoginsResult = await userLoginsResponse.json();
      const userLoginsData = userLoginsResult.users || [];

      // Create a map of organizer IDs to user login data
      const userLoginMap = {};
      userLoginsData.forEach(user => {
        // Check both direct organizerId and regionalOrganizerInfo.organizerId
        const organizerId = user.organizerId || user.regionalOrganizerInfo?.organizerId;
        if (organizerId) {
          userLoginMap[organizerId] = user;
        }
      });

      // Process organizers with migration data
      const processedOrganizers = await Promise.all(
        organizersData.map(async (organizer) => {
          // Find associated user login
          const userLogin = userLoginMap[organizer._id];
          
          // Check if organizer has events
          let hasEvents = false;
          let eventCount = 0;
          
          try {
            const eventsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BE_URL}/api/events?appId=${appId}&ownerId=${organizer._id}&limit=1`
            );
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              hasEvents = eventsData.length > 0;
              
              // If has events, get the actual count
              if (hasEvents) {
                const countResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_BE_URL}/api/events/count?appId=${appId}&ownerId=${organizer._id}`
                );
                if (countResponse.ok) {
                  const countData = await countResponse.json();
                  eventCount = countData.count || eventsData.length;
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching events for organizer ${organizer._id}:`, err);
          }

          return {
            _id: organizer._id,
            fullName: organizer.fullName || organizer.organizerName || 'N/A',
            shortName: organizer.shortName || 'N/A',
            hasPhoto: !!organizer.organizerPhoto,
            isEnabled: organizer.isEnabled,
            organizerFirebaseUserId: organizer.firebaseUserId || null,
            // User login data
            userLoginId: userLogin?._id || null,
            userLoginFirebaseUserId: userLogin?.firebaseUserId || null,
            // Regional organizer info from userLogin
            roIsApproved: userLogin?.regionalOrganizerInfo?.isApproved || false,
            roIsEnabled: userLogin?.regionalOrganizerInfo?.isEnabled || false,
            roApprovalDate: userLogin?.regionalOrganizerInfo?.ApprovalDate || null,
            allowedMasteredRegion: userLogin?.regionalOrganizerInfo?.allowedMasteredRegion || null,
            // Other info
            hasEvents,
            eventCount,
            createdAt: organizer.createdAt
          };
        })
      );

      // Sort by migration status (incomplete first) and then by name
      processedOrganizers.sort((a, b) => {
        const aMigrated = a.roIsApproved && a.roIsEnabled && a.hasEvents;
        const bMigrated = b.roIsApproved && b.roIsEnabled && b.hasEvents;
        
        if (aMigrated !== bMigrated) {
          return aMigrated ? 1 : -1; // Unmigrated first
        }
        
        // Handle undefined fullName
        const aName = a.fullName || '';
        const bName = b.fullName || '';
        return aName.localeCompare(bName);
      });

      setOrganizers(processedOrganizers);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching migration data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMigrationData();
  }, [fetchMigrationData]);

  const refreshData = useCallback(() => {
    fetchMigrationData();
  }, [fetchMigrationData]);

  return {
    organizers,
    loading,
    error,
    refreshData
  };
};