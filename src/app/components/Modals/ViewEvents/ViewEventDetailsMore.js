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
    // Use venueID/venueName first, fallback to locationID/locationName
    venueID,
    venueName,
    locationID,
    locationName,
    ownerOrganizerName,
    active,
    isActive
  } = eventDetails?.extendedProps || {};

  // Convert venueID and locationID to strings if they're objects or MongoDB IDs
  // This ensures we're always working with string IDs
  const getIdString = (id) => {
    if (!id) return null;
    // If it's a string, use it directly
    if (typeof id === 'string') return id;
    // If it has a toString method (like MongoDB ObjectId), use that
    if (id.toString && typeof id.toString === 'function') return id.toString();
    // If it's an object with _id property, use that
    if (typeof id === 'object' && id._id) return String(id._id);
    // Last resort, convert to string
    return String(id);
  };

  // Use either venueID or legacy locationID, ensuring they're strings
  const currentVenueId = getIdString(venueID) || getIdString(locationID);
  const currentVenueName = venueName || locationName;
  const isEventActive = active || isActive;

  // Fetch venue details using venueId (or legacy locationID as fallback)
  useEffect(() => {
    if (currentVenueId) {
// TIEMPO-276: Security cleanup - removed logging
      // Skip the API call if the ID is not valid for the API (e.g., if it's an object that got stringified)
      if (currentVenueId.includes('[object Object]')) {
        console.warn('ViewEventDetailsMore: Invalid venue ID format detected, skipping API call');
        setVenueDetails(null);
        return;
      }

      getVenueById(currentVenueId)
        .then((response) => {
          if (response) {
// TIEMPO-276: Security cleanup - removed logging
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
// TIEMPO-276: Security cleanup - removed logging
    }
  }, [currentVenueId, getVenueById]);

  // Render the venue address if venue details are available
  const renderVenueAddress = () => {
    if (!venueDetails) {
      // Return a more informative message without showing raw ID
      return currentVenueId ?
        `Address not available for this venue` :
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
      // Support both venue and location fields with various types
      venueID: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object, // For MongoDB ObjectId or complex objects
      ]),
      venueName: PropTypes.string,
      locationID: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object, // For MongoDB ObjectId or complex objects
      ]),
      locationName: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
      active: PropTypes.bool,
      isActive: PropTypes.bool,
    }),
  }),
};

export default ViewEventDetailsMore;
