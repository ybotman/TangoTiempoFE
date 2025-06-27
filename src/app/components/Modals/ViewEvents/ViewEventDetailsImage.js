import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ViewEventDetailsImage = () => {
  return (
    <Box sx={{ padding: 2 }}>
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
      <Button variant="contained" color="primary" disabled sx={{ width: '100%' }}>
        Add an Image (Feature Coming Soon)
      </Button>
    </Box>
  );
};

ViewEventDetailsImage.propTypes = {};

export default ViewEventDetailsImage;
