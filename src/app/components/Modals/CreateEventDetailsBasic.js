import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import useCategories from '@/hooks/useCategories'; // Import the categories hook
import { useOrganizers } from '@/hooks/useOrganizers'; // Import the organizers hook
import PropTypes from 'prop-types';

const CreateEventDetailsBasic = ({ open, eventData, setEventData }) => {
  const categories = useCategories(); // Fetch categories
  const { organizers, loading, error } = useOrganizers(); // Fetch organizers

  // Handle category change
  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setEventData({ ...eventData, categoryFirst: selectedCategoryId });
  };

  // Handle title change
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setEventData({ ...eventData, title });
  };

  // Handle organizer change
  const handleOrganizerChange = (event) => {
    const selectedOrganizerId = event.target.value;
    setEventData({ ...eventData, grantedOrganizer: selectedOrganizerId });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2">
        Mandatory Event Details (Basic)
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Title Input */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Event Title"
              value={eventData.title}
              onChange={handleTitleChange}
              fullWidth
            />
          </FormControl>
        </Grid>

        {/* Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={eventData.categoryFirst || ''}
              onChange={handleCategoryChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Description Input */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          label="Event Description"
          multiline
          rows={4}
          value={eventData.description}
          onChange={(e) =>
            setEventData({ ...eventData, description: e.target.value })
          }
          fullWidth
        />
      </FormControl>

      {/* Organizer Selection */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="organizer-label">Organizer</InputLabel>
        <Select
          labelId="organizer-label"
          value={eventData.grantedOrganizer || ''}
          onChange={handleOrganizerChange}
          label="Organizer"
        >
          {loading ? (
            <MenuItem disabled>Loading...</MenuItem>
          ) : error ? (
            <MenuItem disabled>Error loading organizers</MenuItem>
          ) : (
            organizers.map((organizer) => (
              <MenuItem key={organizer._id} value={organizer._id}>
                {organizer.name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

CreateEventDetailsBasic.propTypes = {
  open: PropTypes.bool.isRequired,
  eventData: PropTypes.object.isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsBasic;
