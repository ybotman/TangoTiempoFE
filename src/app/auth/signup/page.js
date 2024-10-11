// app/auth/signup/page.js

'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  LinearProgress,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleAuthButton from '@/components/UI/GoogleAuthButton';

const SignUpPage = () => {
  const router = useRouter();
  const { user, isLoadingUser, error, authenticateWithGoogle } =
    useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to calendar if user is already signed in
  // Also runs every time user changes, for example, when user signs in
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      router.push('/calendar');
    }
  }, [user, router]);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const result = await authenticateWithGoogle();

    if (result) {
      router.push('/calendar');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={5} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Sign Up
        </Typography>
        {error ? (
          <Typography>Error: {error}</Typography>
        ) : isLoading || isLoadingUser ? (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        ) : (
          // <Box
          //   component="img"
          //   src="/web_light_rd_SU@1x.png"
          //   alt="Sign Up with Google"
          //   sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
          //   onClick={handleGoogleSignUp}
          // />
          <GoogleAuthButton onClick={handleGoogleSignUp} />
        )}
      </Paper>
    </Container>
  );
};

export default SignUpPage;
