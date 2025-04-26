import React from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ViewEventDetailsVenueOther = () => {
  // Renamed component from locationOther to venueOther
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: '40vh',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        paddingTop: '20px',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Page Under Construction
      </Typography>
      <Image
        src="/UnderConstruction.jpg"
        alt="Under Construction"
        width={250}
        height={150}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <Typography variant="body2" sx={{ marginTop: 1 }}>
        We are working hard to bring you this page soon.
      </Typography>
    </Box>
  );
};

ViewEventDetailsVenueOther.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      // Support both venue and location fields
      venueId: PropTypes.string,
      venueName: PropTypes.string,
      locationID: PropTypes.string,
      locationName: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
    }),
  }),
};

export default ViewEventDetailsVenueOther;
