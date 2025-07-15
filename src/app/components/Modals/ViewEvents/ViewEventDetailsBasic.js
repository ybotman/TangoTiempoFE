import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

const ViewEventDetailsBasic = ({ eventDetails }) => {
  const [showMore, setShowMore] = useState(false);

  // Safely access event details with optional chaining
  const description = eventDetails?.extendedProps?.description || 'No description available';
  const cost = eventDetails?.extendedProps?.cost || 'No cost available';
  const eventTitle = eventDetails?.title || '';

  // Get venue information - using both new venueID and legacy locationID fields for backward compatibility
  const venueName = eventDetails?.extendedProps?.venueName ||
                   eventDetails?.extendedProps?.locationName ||
                   'Venue not specified';

  // Convert line breaks to HTML <br> tags for proper display
  const descriptionWithBreaks = description.replace(/\n/g, '<br>');
  
  // Sanitize the description using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(descriptionWithBreaks);

  // Function to toggle "Show More"
  const toggleShowMore = () => setShowMore(!showMore);

  return (
    <Box>
      {/* Event Title (in small letters above description) */}
      {eventTitle && (
        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
          {eventTitle}
        </Typography>
      )}

      {/* Event Description */}
      <Typography variant="h6" component="h3" gutterBottom>
        Description
      </Typography>

      {/* Render sanitized description as HTML with line limitation */}
      <div
        style={{
          maxHeight: showMore ? 'none' : '15em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />

      {/* Show More / Show Less Button */}
      {sanitizedDescription.length > 15 * 80 && (
        <Button onClick={toggleShowMore}>{showMore ? 'Show Less' : 'Show More'}</Button>
      )}

      {/* Venue Name */}
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        Venue
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {venueName}
      </Typography>

      {/* Event Cost */}
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        Cost
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {cost}
      </Typography>
    </Box>
  );
};
ViewEventDetailsBasic.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      description: PropTypes.string,
      cost: PropTypes.string,
      venueName: PropTypes.string,
      locationName: PropTypes.string, // Legacy field for backward compatibility
      venueID: PropTypes.string,
      locationID: PropTypes.string, // Legacy field for backward compatibility
    }),
  }),
};

export default ViewEventDetailsBasic;
