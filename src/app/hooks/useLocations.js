import { useVenues } from './useVenues';

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use useVenues() instead for all venue-related functionality.
 */
export const useLocations = () => {
  console.warn(
    '[DEPRECATED] useLocations() is deprecated and will be removed in a future release. ' +
    'Please use useVenues() instead, which provides the same functionality with better naming.'
  );
  
  // Redirect to the new hook implementation while maintaining the old API
  const venuesHook = useVenues();
  
  // Return object with legacy property names
  return {
    locations: venuesHook.venues,
    getLocationById: venuesHook.getVenueById,
    loading: venuesHook.loading,
    error: venuesHook.error
  };
};
