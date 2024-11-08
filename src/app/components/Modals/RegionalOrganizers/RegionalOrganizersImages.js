// src/components/Modals/RegionalOrganizers/RegionalOrganizersImages.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { AddPhotoAlternate } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { useImages } from '@/hooks/useImages';

const RegionalOrganizersImages = ({
  organizerId,
  // organizer,
  // updateOrganizer,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { images, uploadImage, loading } = useImages(organizerId);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedImage(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadImage(file);
      // Optionally, update the organizer's images in the database
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Manage Images</Typography>

      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<AddPhotoAlternate />}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {images.map((image) => (
          <Grid item xs={6} sm={4} md={3} key={image.name}>
            <Box
              onClick={() => handleImageClick(image)}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                style={{ width: '100%', height: 'auto', borderRadius: 4 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md">
        <DialogActions>
          <IconButton onClick={handleClosePreview}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <ImageIcon style={{ fontSize: 100 }} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

RegionalOrganizersImages.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.object.isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersImages;
