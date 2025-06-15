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
      // If no region is selected, show only the "Select a region first" option
      if (!selectedRegion) {
        return [{ label: 'Select a region first', action: 'noAction' }];
      }

      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
        return [
          { label: 'Add Event', action: 'addSingleEvent' },
        ];
      }
    }

    if (context === 'eventClick') {
      let menuOptions = [{ label: 'View Event', action: 'viewDetails' }];
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
        menuOptions = [
          ...menuOptions,
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
