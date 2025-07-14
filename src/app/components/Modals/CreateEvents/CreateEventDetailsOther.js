// src/components/OtherEventDetails.js

import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Switch, FormControlLabel, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import useCategories from '@/hooks/useCategories';
import { useOrganizers } from '@/hooks/useOrganizers';

const CreateEventDetailsOther = ({ eventData, setEventData }) => {
  const categories = useCategories(); // Fetch categories
  const { organizers, fetchLoading: loadingOrganizers, error: errorOrganizers } = useOrganizers(); // Fetch organizers

  // Handle secondary category change
  const handleSecondCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    
    // Find the selected category to get its name
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
    
    // Store both the ID and the name
    setEventData({ 
      ...eventData, 
      categorySecondId: selectedCategoryId,
      categorySecond: selectedCategory ? selectedCategory.categoryName : '' 
    });
  };

  // Handle third category change
  const handleThirdCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    
    // Find the selected category to get its name
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
    
    // Store both the ID and the name
    setEventData({ 
      ...eventData, 
      categoryThirdId: selectedCategoryId,
      categoryThird: selectedCategory ? selectedCategory.categoryName : '' 
    });
  };

  // Handle granted organizer change
  const handleGrantedOrganizerChange = (event) => {
    const selectedOrganizerId = event.target.value;
    
    // Find the selected organizer to get its name
    const selectedOrganizer = organizers.find(org => org._id === selectedOrganizerId);
    
    // Store both the ID and the name
    setEventData({ 
      ...eventData, 
      grantedOrganizerID: selectedOrganizerId,
      grantedOrganizerName: selectedOrganizer ? (selectedOrganizer.name || selectedOrganizer.fullName) : '' 
    });
  };

  // Handle alternate organizer change
  const handleAlternateOrganizerChange = (event) => {
    const selectedOrganizerId = event.target.value;
    
    // Find the selected organizer to get its name
    const selectedOrganizer = organizers.find(org => org._id === selectedOrganizerId);
    
    // Store both the ID and the name
    setEventData({ 
      ...eventData, 
      alternateOrganizerID: selectedOrganizerId,
      alternateOrganizerName: selectedOrganizer ? (selectedOrganizer.name || selectedOrganizer.fullName) : '' 
    });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Additional Event Details
      </Typography>

      <Grid container spacing={2}>
        {/* Secondary Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="secondary-category-label">Secondary Category</InputLabel>
            <Select
              labelId="secondary-category-label"
              value={eventData.categorySecondId || ''}
              onChange={handleSecondCategoryChange}
              label="Secondary Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Third Category Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="third-category-label">Third Category</InputLabel>
            <Select
              labelId="third-category-label"
              value={eventData.categoryThirdId || ''}
              onChange={handleThirdCategoryChange}
              label="Third Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Granted Organizer Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="granted-organizer-label">Granted Organizer</InputLabel>
            <Select
              labelId="granted-organizer-label"
              value={eventData.grantedOrganizerID || ''}
              onChange={handleGrantedOrganizerChange}
              label="Granted Organizer"
              disabled={loadingOrganizers}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {loadingOrganizers ? (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading organizers...
                  </Box>
                </MenuItem>
              ) : errorOrganizers ? (
                <MenuItem disabled>Error loading organizers</MenuItem>
              ) : (
                organizers.map((organizer) => (
                  <MenuItem key={organizer._id} value={organizer._id}>
                    {organizer.name || organizer.fullName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Alternate Organizer Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="alternate-organizer-label">Alternate Organizer</InputLabel>
            <Select
              labelId="alternate-organizer-label"
              value={eventData.alternateOrganizerID || ''}
              onChange={handleAlternateOrganizerChange}
              label="Alternate Organizer"
              disabled={loadingOrganizers}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {loadingOrganizers ? (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading organizers...
                  </Box>
                </MenuItem>
              ) : errorOrganizers ? (
                <MenuItem disabled>Error loading organizers</MenuItem>
              ) : (
                organizers.map((organizer) => (
                  <MenuItem key={organizer._id} value={organizer._id}>
                    {organizer.name || organizer.fullName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Event Canceled Switch */}
        <Grid item xs={12}>
          <Tooltip 
            title={eventData.isRepeating || !!eventData.recurrenceRule ? "Repeating events cannot be canceled from the edit screen" : ""}
            placement="top"
          >
            <span>
              <FormControlLabel
                control={
                  <Switch
                    checked={eventData.isCanceled || false}
                    onChange={(e) => setEventData({ ...eventData, isCanceled: e.target.checked })}
                    color="error"
                    disabled={eventData.isRepeating || !!eventData.recurrenceRule}
                  />
                }
                label={
                  <Typography sx={{ color: eventData.isCanceled ? 'error.main' : 'inherit' }}>
                    Event Canceled
                  </Typography>
                }
                sx={{ mt: 2 }}
              />
            </span>
          </Tooltip>
          {eventData.isCanceled && (
            <Typography variant="caption" color="error" display="block" sx={{ ml: 2 }}>
              This event will be marked as Canceled but still shown
            </Typography>
          )}
          {(eventData.isRepeating || !!eventData.recurrenceRule) && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
              Repeating events cannot be canceled from the edit screen
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

CreateEventDetailsOther.propTypes = {
  eventData: PropTypes.object.isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsOther;
