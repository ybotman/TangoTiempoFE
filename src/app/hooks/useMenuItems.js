// src/hooks/useMenuItems.js
import { useContext } from 'react';
import { RoleContext } from '@/contexts/RoleContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { listOfAllRoles } from '@/utils/masterData';

const useMenuItems = () => {
  const { selectedRole } = useContext(RoleContext);
  const { selectedLocation } = useGeoLocation();
  const selectedRegion = selectedLocation?.region?.name;

  const getMenuItems = (context) => {
    if (context === 'dateClick') {
      // RO and RA users can always create events using their GeoLocation context (lat/long based)
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER || selectedRole === listOfAllRoles.REGIONAL_ADMIN) {
        return [
          { label: 'Add Event', action: 'addSingleEvent' },
        ];
      }
      
      // For other users, check if location is set (lat/long based system, not region based)
      // Legacy region check removed - system now uses lat/long from GeoLocation context
      if (!selectedLocation?.latitude || !selectedLocation?.longitude) {
        return [{ label: 'Set your location first', action: 'noAction' }];
      }
    }

    if (context === 'eventClick') {
      let menuOptions = [{ label: 'View Event', action: 'viewDetails' }];
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER || selectedRole === listOfAllRoles.REGIONAL_ADMIN) {
        menuOptions = [
          ...menuOptions,
          { label: 'Add Event', action: 'addSingleEvent' },
          { label: 'Edit Event', action: 'editEvent' },
          { label: 'Delete Event', action: 'deleteEvent' },
          { label: 'Add Photos', action: 'addPhotos' },
        ];
      } else if (selectedRole === listOfAllRoles.NAMED_USER) {
        menuOptions = [...menuOptions, { label: 'Add Comment/Photo', action: 'addCommentPhoto' }];
      }
      return menuOptions;
    }
    return [];
  };

  return { getMenuItems };
};

export default useMenuItems;
