"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const SignUpPage = () => {
  const router = useRouter();
  const { user, loading, error, signUpWithGoogle } = useAuth();

  const handleSignUp = async () => {
    const result = await signUpWithGoogle();
    if (result) {
      router.push('/calendar');  // Redirect to the calendar page
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (user) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              You are already logged in!
            </Typography>
            <Box
              component="img"
              src="/web_light_rd_SU@4x.png"
              alt="Go to Calendar"
              sx={{ cursor: 'pointer', mt: 2 }}
              onClick={() => router.push('/calendar')}
            />
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" paragraph>
            Sign up with your Google account to start organizing and managing Tango events.
          </Typography>
          <Box
            component="img"
            src="/web_light_rd_SU@1x.png"
            alt="Sign up with Google"
            sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
            onClick={handleSignUp}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpPage;