'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { useOrganizers } from '@/hooks/useOrganizers';

const RegionalOrganizersImages = ({ organizerId }) => {
  const { uploadOrganizerImage, organizers, loading, error } = useOrganizers();
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load existing images for the organizer from organizer data
  const organizer = organizers.find((org) => org._id === organizerId);

  useEffect(() => {
    if (organizer && organizer.images) {
      setImages(organizer.images);
    }
  }, [organizer]);

  // Handle file selection
  const handleImageChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles(newFiles);
  };

  // Handle file upload to backend
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      console.log('No files selected for upload.');
      return;
    }

    setUploading(true);
    try {
      const uploadedImages = await Promise.all(
        selectedFiles.map(async (file) => {
          const response = await uploadOrganizerImage(organizerId, file);
          return response;
        })
      );

      // Add uploaded images to the state to display them immediately
      setImages((prevImages) => [...prevImages, ...uploadedImages]);
      console.log('Images uploaded successfully:', uploadedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      setSelectedFiles([]); // Clear selected files after upload
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Upload Images</Typography>

      {/* File input for selecting images */}
      <input
        accept="image/*"
        type="file"
        multiple
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          color="primary"
          component="span"
          sx={{ mt: 2 }}
        >
          Select Images
        </Button>
      </label>

      {/* Show selected files */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Selected Images:</Typography>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </Box>
      )}

      {/* Display uploaded images */}
      {images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Uploaded Images:</Typography>
          <ul>
            {images.map((image, index) => (
              <li key={index}>
                <img
                  src={image.originalUrl}
                  alt={`Organizer Image ${index + 1}`}
                  style={{ width: '100px', height: 'auto', marginRight: '8px' }}
                />
              </li>
            ))}
          </ul>
        </Box>
      )}

      {/* Display loading and error messages */}
      {loading && <p>Loading organizer data...</p>}
      {error && <p>Error loading organizer data: {error.message}</p>}
    </Box>
  );
};

RegionalOrganizersImages.propTypes = {
  organizerId: PropTypes.string.isRequired,
};

export default RegionalOrganizersImages;
