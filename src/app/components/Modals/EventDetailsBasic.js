import React from 'react';
//import { TextField, Grid, Switch, Typography } from '@mui/material';
import {
  Modal,
  Box,
  Typography,
  TextField,
  // Button,
  // MenuItem,
  Grid,
  // Tabs,
  // Tab,
  Switch,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BasicEventDetails = ({ eventData, setEventData }) => {
  return (
    <Box>
      <TextField
        fullWidth
        label="Event Title"
        value={eventData.title}
        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
      />
      <TextField
        fullWidth
        label="Description"
        value={eventData.description}
        onChange={(e) =>
          setEventData({ ...eventData, description: e.target.value })
        }
        multiline
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">Starting:</Typography>
          <DatePicker
            selected={eventData.startDate}
            onChange={(date) => setEventData({ ...eventData, startDate: date })}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Ending:</Typography>
          <DatePicker
            selected={eventData.endDate}
            onChange={(date) => setEventData({ ...eventData, endDate: date })}
          />
        </Grid>
      </Grid>
      <Typography>Is Repeating?</Typography>
      <Switch
        checked={eventData.isRepeating}
        onChange={() =>
          setEventData({ ...eventData, isRepeating: !eventData.isRepeating })
        }
      />
    </Box>
  );
};

export default BasicEventDetails;
