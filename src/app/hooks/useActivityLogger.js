// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
import { useCallback, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

/**
 * Custom hook for logging user activities to the backend
 * Uses the /api/frontend-logs endpoint to track user interactions
 */
export const useActivityLogger = () => {
  const { user } = useContext(AuthContext);

  const logActivity = useCallback(async (action, resource, resourceId = null, details = {}) => {
    // Don't log if no user is authenticated
    if (!user?.token) {
      console.debug('Activity logging skipped - no authenticated user');
      return;
    }

    try {
      const logData = {
        action,
        resource,
        resourceId,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          // Include user's current role
          userRole: user.selectedRole || user.role || 'NamedUser',
          userId: user.uid
        }
      };

      // Log to console for debugging
      // TIEMPO-276: Security cleanup - removed logging

      const response = await fetch(`${getApiBaseUrl()}/api/frontend-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error('Activity logging failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Log errors but don't throw - logging failures shouldn't break UX
      console.error('Failed to log activity:', error);
    }
  }, [user]);

  /**
   * Batch log multiple activities at once
   * @param {Array} activities - Array of activity objects
   */
  const logBatchActivities = useCallback(async (activities) => {
    if (!user?.token || !activities?.length) {
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/frontend-logs/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: activities.map(activity => ({
            ...activity,
            details: {
              ...activity.details,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              userRole: user.selectedRole || user.role || 'NamedUser',
              userId: user.uid
            }
          }))
        })
      });

      if (!response.ok) {
        console.error('Batch activity logging failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to log batch activities:', error);
    }
  }, [user]);

  /**
   * Helper function to log authentication events
   */
  const logAuthEvent = useCallback((type, success = true, details = {}) => {
    return logActivity(
      type,
      'authentication',
      user?.uid || details.userId || null,
      {
        success,
        method: details.method || 'unknown',
        ...details
      }
    );
  }, [user, logActivity]);

  /**
   * Helper function to log role changes
   */
  const logRoleChange = useCallback((previousRole, newRole, details = {}) => {
    return logActivity(
      'ROLE_CHANGE',
      'user',
      user?.uid,
      {
        previousRole,
        newRole,
        ...details
      }
    );
  }, [user, logActivity]);

  return {
    logActivity,
    logBatchActivities,
    logAuthEvent,
    logRoleChange
  };
};