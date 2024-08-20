"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Paper } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const LoginPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User logged in:', result.user);
      router.push('/calendar');  // Redirect to the calendar page
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
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
              src="/web_light_rd_ctn@1x.png"
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
            Log In
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" paragraph>
            Log in with your Google account to access your Tango events calendar.
          </Typography>
          <Box
            component="img"
            src="/web_light_rd_ctn@1x.png"
            alt="Log in with Google"
            sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
            onClick={handleGoogleSignIn}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
