// app/auth/signup/page.js

'use client';

import React, { useState, useContext } from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

const SignUpPage = () => {
  const router = useRouter();
  const {
    user,
    loading,
    error,
    authenticateWithGoogle,
    authenticateWithFacebook,
  } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsRedirecting(true);
    const result = await authenticateWithGoogle();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsRedirecting(true);
    const result = await authenticateWithFacebook();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  if (loading || isRedirecting) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (user) {
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
              You are already signed up!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ cursor: 'pointer', mt: 2 }}
              onClick={() => router.push('/calendar')}
            >
              Go to Calendar
            </Button>
          </Box>
        </Paper>
      </Container>
    );
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
            Sign Up
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            paragraph
          >
            Sign up with your Google or Facebook account to start organizing and
            managing Tango events.
          </Typography>
          {/* Google Sign Up Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            sx={{ mt: 2, mb: 2, width: '100%' }}
            onClick={handleGoogleSignUp}
          >
            Sign up with Google
          </Button>
          {/* Facebook Sign Up Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<FacebookIcon />}
            sx={{ mt: 2, mb: 2, width: '100%', backgroundColor: '#4267B2' }}
            onClick={handleFacebookSignUp}
          >
            Sign up with Facebook
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpPage;
