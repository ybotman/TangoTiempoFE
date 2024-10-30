// src/components/Modals/UserSettingsOther.js
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

const UserSettingsOther = () => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Other Settings</Typography>
    <TextField label="Additional Information" fullWidth margin="normal" />
    <TextField label="Comments" fullWidth margin="normal" multiline rows={4} />
  </Box>
);

export default UserSettingsOther;
