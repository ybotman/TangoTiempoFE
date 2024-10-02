// src/components/OtherEventDetails.js

import React from 'react';
import { Box, TextField, Button } from '@mui/material';

const OtherEventDetails = ({ eventData, setEventData }) => {
  return (
    <Box>
      <TextField
        fullWidth
        label="Granted Organizer"
        value={eventData.grantedOrganizer}
        onChange={(e) => setEventData({ ...eventData, grantedOrganizer: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Secondary Category"
        value={eventData.categorySecond}
        onChange={(e) => setEventData({ ...eventData, categorySecond: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Third Category"
        value={eventData.categoryThird}
        onChange={(e) => setEventData({ ...eventData, categoryThird: e.target.value })}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={() => console.log('Promote to Facebook')}>
        Promote on Facebook
      </Button>
    </Box>
  );
};

export default OtherEventDetails;