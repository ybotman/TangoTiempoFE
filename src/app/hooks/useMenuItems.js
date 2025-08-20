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
  const selectedRegion = selectedLocation?.region?.name;
  
  // TIEMPO-253: Check if organizer profile is complete and enabled
  const isOrganizerProfileComplete = () => {
    if (!user?.backendInfo?.regionalOrganizerInfo) return false;
    const orgInfo = user.backendInfo.regionalOrganizerInfo;
    
    // Check mandatory requirements
    const hasValidShortName = orgInfo.shortName && 
                             orgInfo.shortName !== 'Milonga Host' && 
                             orgInfo.shortName.trim().length > 0;
    const hasDescription = orgInfo.description && 
                          orgInfo.description.trim().length > 0;
    const isEnabled = orgInfo.isEnabled === true;
    
    // Must have all mandatory requirements AND be enabled
    return hasValidShortName && hasDescription && isEnabled;
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
