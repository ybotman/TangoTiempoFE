// app/auth/login/page.js

'use client';

import React, { useState, useContext } from 'react';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Paper } from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { user, error, authenticateWithGoogle } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogIn = async () => {
    setIsLoading(true);
    const result = await authenticateWithGoogle();

    if (result) {
      router.push('/calendar');
    } else {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (user) {
    router.push('/calendar');
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Log In
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            paragraph
          >
            Log in with your Google account to access your Tango events
            calendar.
          </Typography>
          <Box
            component="img"
            src="/web_light_rd_ctn@1x.png"
            alt="Log in with Google"
            sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
            onClick={handleGoogleLogIn}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
