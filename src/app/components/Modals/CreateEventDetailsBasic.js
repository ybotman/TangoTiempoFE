import React from 'react';
import { Box, Typography, TextField, Grid, Switch } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';

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

BasicEventDetails.propTypes = {
  eventData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startDate: PropTypes.instanceOf(Date).isRequired,
    endDate: PropTypes.instanceOf(Date).isRequired,
    isRepeating: PropTypes.bool.isRequired,
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default BasicEventDetails;
