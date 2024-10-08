// src/components/ImageEventDetails.js

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const ImageEventDetails = ({ imageFile, setImageFile }) => {
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box>
      <Typography variant="h6">Upload Event Image</Typography>
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{
          border: '1px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop an image here, or click to select one</p>
      </div>
      {imageFile && <Typography>Selected Image: {imageFile.name}</Typography>}
    </Box>
  );
};

export default ImageEventDetails;
