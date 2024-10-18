import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing HTML content

const ViewEventDetailsBasic = ({ eventDetails }) => {
  const [showMore, setShowMore] = useState(false);

  // Safely access event details with optional chaining
  const description =
    eventDetails?.extendedProps?.description || 'No description available';
  const cost = eventDetails?.extendedProps?.cost || 'No cost available';

  // Sanitize the description using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(description);

  // Function to toggle "Show More"
  const toggleShowMore = () => setShowMore(!showMore);

  return (
    <Box>
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
        <Button onClick={toggleShowMore}>
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      )}

      {/* Event Cost */}
      <Typography variant="h6" component="h3" gutterBottom>
        Cost
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {cost}
      </Typography>
    </Box>
  );
};

export default ViewEventDetailsBasic;
