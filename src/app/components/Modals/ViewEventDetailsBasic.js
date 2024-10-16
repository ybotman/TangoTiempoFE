import React from 'react';
import { Box, Typography } from '@mui/material';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing HTML content

const ViewEventDetailsBasic = ({ eventDetails }) => {
  // Safely access event details with optional chaining
  const description =
    eventDetails?.extendedProps?.description || 'No description available';

  // Sanitize the description using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(description);

  return (
    <Box>
      {/* Event Description */}
      <Typography variant="h6" component="h3" gutterBottom>
        Description
      </Typography>

      {/* Render sanitized description as HTML */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
    </Box>
  );
};

export default ViewEventDetailsBasic;
