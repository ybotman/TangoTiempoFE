// src/app/components/Modals/Venues/VenueModalMap.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// For now, just a placeholder for a map
// Future: integrate Leaflet or MapLibre
const VenueModalMap = ({ venues }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Venues Map
      </Typography>
      <Typography>
        This is a placeholder for the map view of venues. In the future,
        integrate a mapping library (Leaflet/MapLibre) and show venue markers.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Currently loaded venues: {venues.length}
      </Typography>
    </Box>
  );
};

VenueModalMap.propTypes = {
  venues: PropTypes.array.isRequired,
};

export default VenueModalMap;
