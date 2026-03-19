// src/components/OtherEventDetails.js
// TIEMPO-388: Removed Granted/Alternate Organizer - moved to GRANTS tab

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Grid
} from '@mui/material';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types';
import useCategories from '@/hooks/useCategories';

const CreateEventDetailsOther = ({ eventData, setEventData }) => {
  const allCategories = useCategories(); // Fetch categories
  // TIEMPO-291: Filter out DayWorkshop (replaced by Encuentro), Trip, and Unknown
  const categories = useMemo(() =>
    allCategories.filter(cat =>
      cat.categoryName !== 'DayWorkshop' &&
      cat.categoryName !== 'Trip' &&
      cat.categoryName !== 'Unknown'
    ),
    [allCategories]
  );

  // Handle secondary category change
  const handleSecondCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;

    // Find the selected category to get its name
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);

    // Store both the ID and the name
    setEventData(prevData => ({
      ...prevData,
      categorySecondId: selectedCategoryId,
      categorySecond: selectedCategory ? selectedCategory.categoryName : ''
    }));
  };

  // Handle third category change
  const handleThirdCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;

    // Find the selected category to get its name
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);

    // Store both the ID and the name
    setEventData(prevData => ({
      ...prevData,
      categoryThirdId: selectedCategoryId,
      categoryThird: selectedCategory ? selectedCategory.categoryName : ''
    }));
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
      </Grid>
    </Box>
  );
};

CreateEventDetailsOther.propTypes = {
  eventData: PropTypes.object.isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsOther;
