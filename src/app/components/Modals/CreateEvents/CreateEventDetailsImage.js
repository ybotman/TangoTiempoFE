import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import Image from 'next/image';

const CreateEventDetailsImage = ({ eventData, setEventData }) => {
  const [uploadError, setUploadError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create a preview URL for immediate display
      const imagePreviewUrl = URL.createObjectURL(file);
      
      setEventData({
        ...eventData,
        imageFile: file,
        imagePreviewUrl
      });
      
      setUploadError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: () => {
      setUploadError('File must be an image under 5MB');
    }
  });

  // Clear the selected image
  const handleClearImage = () => {
    // Revoke the object URL to prevent memory leaks
    if (eventData.imagePreviewUrl) {
      URL.revokeObjectURL(eventData.imagePreviewUrl);
    }

    setEventData({
      ...eventData,
      imageFile: null,
      imagePreviewUrl: null,
      eventImage: null,  // Clear existing image URL so it's removed on save
    });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Event Image
      </Typography>
      
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}
      
      {(eventData.imagePreviewUrl || eventData.eventImage) ? (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '200px',
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <Image
              src={eventData.imagePreviewUrl || eventData.eventImage}
              alt="Event preview"
              fill
              style={{ objectFit: 'cover' }}
            />
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {eventData.imageFile?.name
              ? `New image: ${eventData.imageFile.name}`
              : 'Current image'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearImage}
            size="small"
          >
            Remove Image
          </Button>
        </Box>
      ) : (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#2196f3' : '#cccccc'}`,
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: isDragActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accepted formats: JPG, PNG, GIF, WEBP (max 5MB)
          </Typography>
        </div>
      )}
      
      <Typography variant="body2" color="text.secondary">
        The image should have a 16:9 aspect ratio for best appearance. Images will be displayed prominently on event cards and detail pages.
      </Typography>
    </Box>
  );
};

CreateEventDetailsImage.propTypes = {
  eventData: PropTypes.object.isRequired,
  setEventData: PropTypes.func.isRequired,
};

export default CreateEventDetailsImage;
