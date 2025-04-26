// src/components/Modals/RegionalOrganizers/RegionalOrganizersPrimaryLocations.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField } from '@mui/material';

const RegionalOrganizersPrimaryLocations = ({ locations }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Primary Locations</Typography>
    <TextField label="Primary Locations" fullWidth margin="normal" multiline rows={3} defaultValue={locations} />
  </Box>
);

RegionalOrganizersPrimaryLocations.propTypes = {
  locations: PropTypes.string,
};

export default RegionalOrganizersPrimaryLocations;
