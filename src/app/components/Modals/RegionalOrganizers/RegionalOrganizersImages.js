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
} from '@mui/material';
import { AddPhotoAlternate, Close as CloseIcon } from '@mui/icons-material';
import { useImages } from '@/hooks/useImages';

const RegionalOrganizersImages = ({ organizerId }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
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

      <Box
        sx={{
          overflowX: 'auto',
          mt: 2,
          maxWidth: '100%',
          whiteSpace: 'nowrap',
        }}
      >
        {images.map((image) => (
          <Box
            key={image.name}
            component="span"
            sx={{
              display: 'inline-block',
              position: 'relative',
              mx: 1,
              cursor: 'pointer',
            }}
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image.url}
              alt={image.name}
              style={{
                width: isMobile ? '100px' : '150px',
                height: isMobile ? '100px' : '150px',
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          </Box>
        ))}
      </Box>

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
