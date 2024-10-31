// src/components/Modals/UserSettingsName.js
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

const UserSettingsName = () => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Update Your Name</Typography>
    <TextField label="First Name" fullWidth margin="normal" />
    <TextField label="Last Name" fullWidth margin="normal" />
  </Box>
);

export default UserSettingsName;
