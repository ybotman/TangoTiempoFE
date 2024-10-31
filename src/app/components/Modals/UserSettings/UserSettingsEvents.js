// src/components/Modals/UserSettingsEvents.js
import React from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

const UserSettingsEvents = () => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Event Preferences</Typography>
    <FormControlLabel control={<Switch />} label="Show Past Events" />
    <FormControlLabel control={<Switch />} label="Display RSVP Options" />
  </Box>
);

export default UserSettingsEvents;
