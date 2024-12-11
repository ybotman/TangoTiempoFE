// src/components/Modals/RegionalOrganizers/RegionalOrganizersProfileImages.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Grid, TextField } from '@mui/material';
import { useImages } from '@/hooks/useImages';

const RegionalOrganizersProfileImages = ({ organizerId, organizer, updateOrganizer }) => {
  const { uploadImage, loading } = useImages(organizerId);
  const [images, setImages] = useState({
    organizerBannerImage: organizer?.organizerBannerImage || '',
    organizerProfileImage: organizer?.organizerProfileImage || '',
    organizerLandscapeImage: organizer?.organizerLandscapeImage || '',
    organizerLogoImage: organizer?.organizerLogoImage || '',
  });

  const handleImageChange = async (event, imageType) => {
    const file = event.target.files[0];
    if (file) {
      const uploadedImageUrl = await uploadImage(file);
      setImages((prev) => ({ ...prev, [imageType]: uploadedImageUrl }));
      await updateOrganizer(organizerId, { [imageType]: uploadedImageUrl });
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Profile Images</Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {Object.keys(images).map((imageType) => (
          <Grid item xs={12} sm={6} key={imageType}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">{imageType.replace('organizer', '').replace(/([A-Z])/g, ' $1')}</Typography>
              <TextField variant="outlined" fullWidth value={images[imageType]} disabled />
              <Button variant="contained" component="label" fullWidth sx={{ mt: 1 }}>
                Upload {imageType}
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, imageType)} />
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      {loading && <Typography variant="body2">Uploading...</Typography>}
    </Box>
  );
};

RegionalOrganizersProfileImages.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.object.isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersProfileImages;
