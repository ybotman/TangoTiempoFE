// src/components/Modals/UserSettings/UserSettings/Notifications.js
import React from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';

const UserSettingsNotifications = () => (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Notification Settings</Typography>
    <FormControlLabel control={<Switch />} label="Email Notifications" />
    <FormControlLabel control={<Switch />} label="SMS Notifications" />
  </Box>
);

export default UserSettingsNotifications;
