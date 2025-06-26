'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import AppleIcon from '@/components/AppleIcon';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithApple, login } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Redirect immediately if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/calendar');
    }
  }, [user, loading, router]);

  const handleGoogleLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    const result = await authenticateWithGoogle();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  const handleAppleLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    const result = await authenticateWithApple();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  const handleEmailLogin = async ({ email, password }) => {
    setAuthError('');
    try {
      const result = await login(email, password);
      if (result) {
        router.push('/calendar');
      }
      return result;
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      return null;
    }
  };

  if (loading || isRedirecting || user) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, marginBottom: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Title with clear SIGN IN label */}
          <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            SIGN IN
          </Typography>

          {/* Signup prompt at the top */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              New user?{' '}
              <Link href="/auth/signup" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                <Typography component="span" color="secondary" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  CREATE ACCOUNT
                </Typography>
              </Link>
            </Typography>
          </Box>

          {(authError || error) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {authError || error}
            </Alert>
          )}

          {!showEmailForm ? (
            <Box sx={{ width: '100%' }}>
              {/* Google Sign In */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGoogleLogIn}
                startIcon={<GoogleIcon sx={{ fontSize: 30 }} />}
                sx={{
                  mb: 2,
                  py: 2,
                  backgroundColor: '#4285F4',
                  '&:hover': { backgroundColor: '#357ae8' },
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Continue with Google
              </Button>

              {/* Apple Sign In */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAppleLogIn}
                startIcon={<AppleIcon sx={{ fontSize: 30 }} />}
                sx={{
                  mb: 2,
                  py: 2,
                  backgroundColor: '#000000',
                  '&:hover': { backgroundColor: '#333333' },
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  position: 'relative',
                }}
              >
                Continue with Apple
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 8, 
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1,
                    borderRadius: 1,
                    fontSize: '0.65rem',
                    fontWeight: 'bold'
                  }}
                >
                  BETA
                </Typography>
              </Button>

              {/* Facebook Sign In - Coming Soon */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled
                startIcon={<FacebookIcon sx={{ fontSize: 30 }} />}
                sx={{
                  mb: 2,
                  py: 2,
                  backgroundColor: '#e4e6eb',
                  color: '#65676b',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Coming Soon
              </Button>

              <Divider sx={{ my: 3 }}>OR</Divider>

              {/* Email Sign In */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => setShowEmailForm(true)}
                startIcon={<EmailIcon sx={{ fontSize: 30 }} />}
                sx={{
                  py: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                Continue with Email
              </Button>
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Button variant="text" onClick={() => setShowEmailForm(false)} sx={{ mb: 2 }}>
                ← Back to options
              </Button>
              <EmailAuthForm mode="login" onSubmit={handleEmailLogin} error={authError || error} />
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;