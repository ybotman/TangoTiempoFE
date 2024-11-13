// src/app/components/Modals/RegionalOrganizers/RegionalOrganizersImages.js

'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import { AddPhotoAlternate, Close as CloseIcon } from '@mui/icons-material';
import { useImages } from '@/hooks/useImages';

const RegionalOrganizersImages = ({ organizerId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

      {isMobile ? (
        <Box
          sx={{
            overflowX: 'auto',
            mt: 2,
            display: 'flex',
          }}
        >
          {images.map((image) => (
            <Box
              key={image.name}
              sx={{
                minWidth: 100,
                mx: 1,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.url}
                alt={image.name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {images.map((image) => (
            <Grid item xs={4} sm={3} md={2} key={image.name}>
              <Box
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md">
        <DialogActions>
          <IconButton onClick={handleClosePreview}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

RegionalOrganizersImages.propTypes = {
  organizerId: PropTypes.string.isRequired,
};

export default RegionalOrganizersImages;
