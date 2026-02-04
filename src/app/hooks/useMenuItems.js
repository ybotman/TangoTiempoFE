// src/hooks/useMenuItems.js
import { useContext } from 'react';
import { RoleContext } from '@/contexts/RoleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { listOfAllRoles } from '@/utils/masterData';

const useMenuItems = () => {
  const { selectedRole } = useContext(RoleContext);
  const { user } = useContext(AuthContext);
  const { selectedLocation } = useGeoLocation();

  // TIEMPO-272: Check isEnabled from user's regionalOrganizerInfo (set at login)
  const isOrganizerProfileComplete = () => {
    if (!user?.backendInfo?.regionalOrganizerInfo) return false;
    return user.backendInfo.regionalOrganizerInfo.isEnabled === true;
  };

  const getMenuItems = (context) => {
    if (context === 'dateClick') {
      // TIEMPO-253: Check if user has completed organizer profile before showing Add Event
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
        if (!isOrganizerProfileComplete()) {
          return [
            { label: 'Complete Organizer Profile First', action: 'noAction', disabled: true },
            { label: 'Go to Event Organizer Settings', action: 'openOrganizerSettings' }
          ];
        }
        return [
          { label: 'Add Event', action: 'addSingleEvent' },
        ];
      }
      
      // RA users can always create events
      if (selectedRole === listOfAllRoles.REGIONAL_ADMIN) {
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
      
      // TIEMPO-253: Check profile completion for RO users
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
        if (isOrganizerProfileComplete()) {
          menuOptions = [
            ...menuOptions,
            { label: 'Add Event', action: 'addSingleEvent' },
            { label: 'Edit Event', action: 'editEvent' },
            { label: 'Delete Event', action: 'deleteEvent' },
            { label: 'Add Photos', action: 'addPhotos' },
          ];
        } else {
          menuOptions = [
            ...menuOptions,
            { label: 'Complete Profile to Add Events', action: 'openOrganizerSettings' }
          ];
        }
      } else if (selectedRole === listOfAllRoles.REGIONAL_ADMIN) {
        // RA users always have full menu
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
