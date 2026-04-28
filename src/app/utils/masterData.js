//@utils/masterData.js

export const listOfAllRoles = {
  NAMED_USER: 'NamedUser',
  SPOTLIGHTER: 'Spotlighter',
  REGIONAL_ORGANIZER: 'RegionalOrganizer',
  REGIONAL_ADMIN: 'RegionalAdmin',
  SYSTEM_OWNER: 'SystemOwner',
  SYSTEM_ADMIN: 'SystemAdmin',
  ANONYMOUS: 'Anonymous',
};

// Default test venue information - includes both old and new field names for compatibility
export const defaultTestVenue = {
  masteredRegionName: 'Northeast',
  masteredDivisionName: 'New England',
  masteredCityName: 'Boston',
  venueId: '66c8bc4c6b597390419b9187',
  venueName: 'Fake Tango Venue',
  // Include legacy fields for backward compatibility
  locationID: '66c8bc4c6b597390419b9187',
  locationName: 'Fake Tango Venue',
};

// Legacy alias for backward compatibility - will be deprecated
export const defaultTestLocationID = defaultTestVenue;

export const defaultTestOrganizer = {
  ownerOrganizerID: '6442ccb5f88a6c48aa30be35',
  grantedOrganizerID: '6442ccb5f88a6c48aa30be35',
  alternateOrganizerID: '6442ccb5f88a6c48aa30be35',
};
