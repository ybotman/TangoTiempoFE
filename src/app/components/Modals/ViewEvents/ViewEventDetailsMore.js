import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useVenues } from '@/hooks/useVenues';
import PropTypes from 'prop-types';
const ViewEventDetailsMore = ({ eventDetails }) => {
  const { getVenueById } = useVenues(); // Use the updated hook
  const [venueDetails, setVenueDetails] = useState(null);

  // Extract event details - support both legacy and new fields
  const { 
    categoryFirst, 
    categorySecond, 
    categoryThird,
    // Use venueId/venueName first, fallback to locationID/locationName
    venueId, 
    venueName,
    locationID, 
    locationName, 
    ownerOrganizerName, 
    active, 
    isActive 
  } = eventDetails?.extendedProps || {};
  
  // Use either venueId or legacy locationID
  const currentVenueId = venueId || locationID;
  const currentVenueName = venueName || locationName;
  const isEventActive = active || isActive;

  // Fetch venue details using venueId (or legacy locationID as fallback)
  useEffect(() => {
    if (currentVenueId) {
      console.log(`ViewEventDetailsMore: Attempting to fetch venue with ID: ${currentVenueId}`);
      getVenueById(currentVenueId)
        .then((response) => {
          if (response) {
            console.log(`ViewEventDetailsMore: Successfully retrieved venue: ${response.name || 'Unknown name'}`);
            setVenueDetails(response);
          } else {
            console.warn(`ViewEventDetailsMore: Venue with ID ${currentVenueId} not found or returned null`);
            setVenueDetails(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching venue details:', error);
          setVenueDetails(null);
        });
    } else {
      console.log('ViewEventDetailsMore: No venue ID provided');
    }
  }, [currentVenueId, getVenueById]);

  // Render the venue address if venue details are available
  const renderVenueAddress = () => {
    if (!venueDetails) {
      // Return a more informative message
      return currentVenueId ? 
        `Address not available (venue ID: ${currentVenueId})` : 
        'No venue selected';
    }

    // Handle both legacy and new field naming patterns
    const address1 = venueDetails.address1 || venueDetails.address_1;
    const address2 = venueDetails.address2 || venueDetails.address_2;
    const address3 = venueDetails.address3 || venueDetails.address_3;
    const { city, state, zip } = venueDetails;
    
    return (
      <>
        <Typography component="span" variant="body1">
          {address1 || 'No address'}, {address2 && `${address2}, `}
          {address3 && `${address3}, `}
          {city || 'Unknown city'}, {state || ''} {zip || ''}
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

      {/* Venue Name */}
      <Typography variant="subtitle1" gutterBottom>
        Venue: {currentVenueName || 'Unknown Venue'}
      </Typography>

      {/* Venue Address */}
      <Typography variant="body2" gutterBottom>
        {renderVenueAddress()}
      </Typography>

      {/* Owner Organizer Name */}
      <Typography variant="body2" gutterBottom>
        Organizer: {ownerOrganizerName || 'Unknown Organizer'}
      </Typography>

      {/* Active Flag */}
      <Typography variant="body2" color={isEventActive ? 'green' : 'red'} gutterBottom>
        {isEventActive ? 'Active' : 'Inactive'}
      </Typography>
    </Box>
  );
};

ViewEventDetailsMore.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      description: PropTypes.string,
      cost: PropTypes.string,
      categoryFirst: PropTypes.string,
      categorySecond: PropTypes.string,
      categoryThird: PropTypes.string,
      // Support both venue and location fields
      venueId: PropTypes.string,
      venueName: PropTypes.string,
      locationID: PropTypes.string,
      locationName: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
      active: PropTypes.bool,
      isActive: PropTypes.bool,
    }),
  }),
};

export default ViewEventDetailsMore;
