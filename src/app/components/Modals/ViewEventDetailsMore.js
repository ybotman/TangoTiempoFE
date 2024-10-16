import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocations } from '@/hooks/useLocations'; // Assuming the hook is available for fetching locations

const ViewEventDetailsMore = ({ eventDetails }) => {
  const { getLocationById } = useLocations(); // Use the hook's method for fetching
  const [locationDetails, setLocationDetails] = useState(null);

  // Extract event details
  const {
    categoryFirst,
    categorySecond,
    categoryThird,
    locationID,
    locationName,
    ownerOrganizerName,
    active,
  } = eventDetails?.extendedProps || {};

  // Fetch location details using locationID
  useEffect(() => {
    if (locationID) {
      getLocationById(locationID)
        .then((response) => setLocationDetails(response))
        .catch((error) => console.error('Error fetching location details:', error));
    }
  }, [locationID, getLocationById]);

  // Render the location address if location details are available
  const renderLocationAddress = () => {
    if (!locationDetails) return 'Address not available';

    const { address_1, address_2, address_3, city, state, zip } = locationDetails;
    return (
      <>
        <Typography variant="body1">
          {address_1}, {address_2 && `${address_2}, `}
          {address_3 && `${address_3}, `}
          {city}, {state} {zip}
        </Typography>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Categories Line */}
      <Typography variant="h6" gutterBottom>
        {categoryFirst || 'No Category'}
        {categorySecond && ` | ${categorySecond}`}
        {categoryThird && ` | ${categoryThird}`}
      </Typography>

      {/* Location Name */}
      <Typography variant="subtitle1" gutterBottom>
        Location: {locationName || 'Unknown Location'}
      </Typography>

      {/* Location Address */}
      <Typography variant="body2" gutterBottom>
        {renderLocationAddress()}
      </Typography>

      {/* Owner Organizer Name */}
      <Typography variant="body2" gutterBottom>
        Organizer: {ownerOrganizerName || 'Unknown Organizer'}
      </Typography>

      {/* Active Flag */}
      <Typography variant="body2" color={active ? 'green' : 'red'} gutterBottom>
        {active ? 'Active' : 'Inactive'}
      </Typography>
    </Box>
  );
};

export default ViewEventDetailsMore;