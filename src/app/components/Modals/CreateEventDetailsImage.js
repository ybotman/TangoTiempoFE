import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

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
        <p>Drag `&lsquo;n&apos; drop an image here, or click to select one</p>
      </div>
      {imageFile && <Typography>Selected Image: {imageFile.name}</Typography>}
    </Box>
  );
};

ImageEventDetails.propTypes = {
  imageFile: PropTypes.object, // Represents the selected file object
  setImageFile: PropTypes.func.isRequired, // Function to update the selected file
};

export default ImageEventDetails;
