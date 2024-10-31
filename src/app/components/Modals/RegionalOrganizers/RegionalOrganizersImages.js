'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';

const RegionalOrganizersImages = () => {
  const [images, setImages] = useState([]);

  const handleImageChange = (event) => {
    const newImages = Array.from(event.target.files);
    setImages([...images, ...newImages]);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Upload Images</Typography>
      <input
        accept="image/*"
        type="file"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button variant="contained" color="primary" component="span" sx={{ mt: 2 }}>
          Select Images
        </Button>
      </label>
      {images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Selected Images:</Typography>
          <ul>
            {images.map((img, index) => (
              <li key={index}>{img.name}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

RegionalOrganizersImages.propTypes = {
  onImageUpload: PropTypes.func,
};

export default RegionalOrganizersImages;