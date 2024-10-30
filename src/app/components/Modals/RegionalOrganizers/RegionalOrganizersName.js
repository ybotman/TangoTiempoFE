// src/components/Modals/RegionalOrganizers/RegionalOrganizersName.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField } from '@mui/material';

const RegionalOrganizersName = ({ name, shortName, contact }) => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Name and Contact</Typography>
    <TextField label="Name" fullWidth margin="normal" defaultValue={name} />
    <TextField
      label="Short Name"
      fullWidth
      margin="normal"
      defaultValue={shortName}
    />
    <TextField
      label="Contact"
      fullWidth
      margin="normal"
      defaultValue={contact}
    />
  </Box>
);

RegionalOrganizersName.propTypes = {
  name: PropTypes.string,
  shortName: PropTypes.string,
  contact: PropTypes.string,
};

export default RegionalOrganizersName;
