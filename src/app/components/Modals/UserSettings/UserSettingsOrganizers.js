// src/components/Modals/userSettingsOrganizers.js
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

const UserSettingsOrganizers = () => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Organizer Details</Typography>
    <TextField label="Organizer Name" fullWidth margin="normal" />
    <TextField label="Organization Website" fullWidth margin="normal" />
  </Box>
);

export default UserSettingsOrganizers;
