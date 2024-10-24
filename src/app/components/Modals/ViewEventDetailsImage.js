import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';

const ViewEventDetailsImage = ({ eventDetails }) => {
  // Assuming eventImage is already provided in eventDetails
  const eventImage =
    eventDetails?.extendedProps?.eventImage || '/path/to/placeholder.jpg';

  return (
    <Box sx={{ padding: 2 }}>
      {/* High-Resolution Image Display */}
      <Typography variant="h6" gutterBottom>
        Event Image
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Image
          src={eventImage}
          alt="Event Image"
          width={500}
          height={300} // Adjust as needed for the modal size
          style={{ objectFit: 'cover', maxHeight: '100%' }}
        />
      </Box>

      {/* Placeholder for Gallery */}
      <Typography variant="h6" gutterBottom>
        Gallery (Coming Soon)
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px dashed grey',
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Typography variant="body1" color="textSecondary">
          No additional images available.
        </Typography>
      </Box>

      {/* Fake Add Image Button */}
      <Button
        variant="contained"
        color="primary"
        disabled
        sx={{ width: '100%' }}
      >
        Add an Image (Feature Coming Soon)
      </Button>
    </Box>
  );
};

ViewEventDetailsImage.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      eventImage: PropTypes.string,
    }),
  }),
};

export default ViewEventDetailsImage;
