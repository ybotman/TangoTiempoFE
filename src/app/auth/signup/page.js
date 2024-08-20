"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, Typography, Container, Paper } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const SignUpPage = () => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      // Successfully signed in
      console.log('User signed in:', result.user);
      router.push('/calendar');  // Redirect to the calendar page
    } catch (error) {
      console.error('Error during sign in:', error);
      // Handle Errors here.
    }
  };

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
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleSignIn}
            sx={{ mt: 2, mb: 2 }}
          >
            Sign Up with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpPage;
