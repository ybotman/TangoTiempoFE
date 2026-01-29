import { useCallback } from 'react';

/**
 * Custom hook for logging user activities
 * DISABLED: BE /api/frontend-logs endpoint returns 400 and spams console.
 * Future: calops should use Azure Functions Application Insights instead.
 */
export const useActivityLogger = () => {

  // DISABLED: Frontend activity logging to BE /api/frontend-logs
  // The BE endpoint returns 400 and spams console on every onChange event.
  // Future: calops should use Azure Functions Application Insights instead
  // of custom app-level logging. Re-architect when moving to AF analytics.
  const logActivity = useCallback(async () => {
    // No-op - disabled
  }, []);

  const logBatchActivities = useCallback(async () => {
    // No-op - disabled (see comment above)
  }, []);

  const logAuthEvent = useCallback(async () => {
    // No-op - disabled
  }, []);

  const logRoleChange = useCallback(async () => {
    // No-op - disabled
  }, []);

  return {
    logActivity,
    logBatchActivities,
    logAuthEvent,
    logRoleChange
  };
};