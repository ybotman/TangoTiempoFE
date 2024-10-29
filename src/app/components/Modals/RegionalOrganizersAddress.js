// src/components/Modals/RegionalOrganizersAddress.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField } from '@mui/material';

const RegionalOrganizersAddress = ({ address }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Address</Typography>
    <TextField
      label="Address"
      fullWidth
      margin="normal"
      multiline
      rows={4}
      defaultValue={address}
    />
  </Box>
);

RegionalOrganizersAddress.propTypes = {
  address: PropTypes.string,
};

export default RegionalOrganizersAddress;
