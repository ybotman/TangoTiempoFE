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

      // Fetch organizers data
      const organizersResponse = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/organizers?isApproved=true`);
      if (!organizersResponse.ok) {
        throw new Error('Failed to fetch organizers');
      }
      const organizersData = await organizersResponse.json();

      // Fetch user logins data to match with organizers
      const userLoginsResponse = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/userlogins`);
      if (!userLoginsResponse.ok) {
        throw new Error('Failed to fetch user logins');
      }
      const userLoginsData = await userLoginsResponse.json();

      // Create a map of organizer IDs to user login data
      const userLoginMap = {};
      userLoginsData.forEach(user => {
        if (user.organizerId) {
          userLoginMap[user.organizerId] = user;
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
              `${process.env.NEXT_PUBLIC_BE_URL}/events?ownerId=${organizer._id}&limit=1`
            );
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              hasEvents = eventsData.length > 0;
              
              // If has events, get the actual count
              if (hasEvents) {
                const countResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_BE_URL}/events/count?ownerId=${organizer._id}`
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
            organizerName: organizer.organizerName,
            shortName: organizer.shortName,
            organizerPhoto: organizer.organizerPhoto,
            isApproved: organizer.isApproved,
            authId: userLogin?.authId || null,
            firebaseUserId: userLogin?.firebaseUserId || null,
            userLoginId: userLogin?._id || null,
            hasRoleRO: userLogin?.selectedRole === 'RegionalOrganizer',
            hasEvents,
            eventCount,
            createdAt: organizer.createdAt,
            updatedAt: organizer.updatedAt
          };
        })
      );

      // Sort by migration status (incomplete first) and then by name
      processedOrganizers.sort((a, b) => {
        const aMigrated = a.authId && a.firebaseUserId && a.hasEvents;
        const bMigrated = b.authId && b.firebaseUserId && b.hasEvents;
        
        if (aMigrated !== bMigrated) {
          return aMigrated ? 1 : -1; // Unmigrated first
        }
        
        return a.organizerName.localeCompare(b.organizerName);
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