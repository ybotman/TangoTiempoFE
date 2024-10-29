// src/components/Modals/RegionalOrganizersDemographic.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, FormControlLabel, Switch } from '@mui/material';

const RegionalOrganizersDemographic = ({ internetSearchable }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Demographic Preferences</Typography>
    <FormControlLabel
      control={<Switch checked={internetSearchable} />}
      label="Searchable by the Internet"
    />
  </Box>
);

RegionalOrganizersDemographic.propTypes = {
  internetSearchable: PropTypes.bool,
};

export default RegionalOrganizersDemographic;
