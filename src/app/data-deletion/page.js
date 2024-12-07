// app/data-deletion/page.js

'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const DataDeletion = () => {
  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Deletion Instructions
        </Typography>
        <Typography variant="body1" paragraph>
          Our application respects your privacy and provides you with options to manage and delete your personal data.
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          How to Request Data Deletion
        </Typography>
        <Typography variant="body1" paragraph>
          If you would like to delete your account and all associated data, please follow these steps:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              Contact our support team at <a href="mailto:support@tangotiempo.com">support@tangotiempo.com</a> to
              request data deletion. Provide your account ID or registered email for verification.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Alternatively, if you are logged in, you can go to your account settings and initiate a data deletion
              request from there.
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" paragraph>
          Once your request is confirmed, we will permanently delete your data within 30 days. Some data may remain in
          backup copies for a limited time as part of our retention policy.
        </Typography>
      </Box>
    </Container>
  );
};

export default DataDeletion;
