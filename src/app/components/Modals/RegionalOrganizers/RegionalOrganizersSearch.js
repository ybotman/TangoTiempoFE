// src/components/Modals/RegionalOrganizers/RegionalOrganizersSearch.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField } from '@mui/material';

const RegionalOrganizersSearch = ({ searchTerms }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Search Settings</Typography>
    <TextField label="Search Terms" fullWidth margin="normal" multiline rows={3} defaultValue={searchTerms} />
  </Box>
);

RegionalOrganizersSearch.propTypes = {
  searchTerms: PropTypes.string,
};

export default RegionalOrganizersSearch;
