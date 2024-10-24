import React from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';

const UnderConstruction = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Aligns content at the top
        alignItems: 'center',
        minHeight: '40vh', // Further reduced height of the container
        padding: '10px', // Reduced padding to shrink vertical space
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        paddingTop: '20px', // Smaller padding from the top
      }}
    >
      <Typography variant="h5" gutterBottom>
        Currently, we are NOT doing repeating events. The new is implemented
        with RRule logic. Note the import from BTC.com is brought in without
        repeats, builds them day by day 1:1 through 2025.
      </Typography>
      <Image
        src="/UnderConstruction.jpg"
        alt="Under Construction"
        width={250}
        height={150}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <Typography variant="body2" sx={{ marginTop: 1 }}>
        We are working hard to bring you this page soon.
      </Typography>
    </Box>
  );
};

export default UnderConstruction;
