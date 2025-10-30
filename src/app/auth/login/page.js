'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import AppleIcon from '@/components/AppleIcon';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';
import { useActivityLogger } from '@/hooks/useActivityLogger';

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithApple, login } = useContext(AuthContext);
  const { logAuthEvent } = useActivityLogger();
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
    try {
      const result = await authenticateWithGoogle();
      if (result) {
        // Log successful login
        await logAuthEvent('LOGIN', true, {
          method: 'google',
          provider: 'google.com'
        });
        router.push('/calendar');
      } else {
        // Log failed login
        await logAuthEvent('LOGIN_FAILED', false, {
          method: 'google',
          provider: 'google.com',
          reason: 'Authentication failed'
        });
        setIsRedirecting(false);
      }
    } catch (error) {
      // Log error during login
      await logAuthEvent('LOGIN_FAILED', false, {
        method: 'google',
        provider: 'google.com',
        error: error.message
      });
      setIsRedirecting(false);
    }
  };

  const handleAppleLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    try {
      const result = await authenticateWithApple();
      if (result) {
        // Log successful login
        await logAuthEvent('LOGIN', true, {
          method: 'apple',
          provider: 'apple.com'
        });
        router.push('/calendar');
      } else {
        // Log failed login
        await logAuthEvent('LOGIN_FAILED', false, {
          method: 'apple',
          provider: 'apple.com',
          reason: 'Authentication failed'
        });
        setIsRedirecting(false);
      }
    } catch (error) {
      // Log error during login
      await logAuthEvent('LOGIN_FAILED', false, {
        method: 'apple',
        provider: 'apple.com',
        error: error.message
      });
      setIsRedirecting(false);
    }
  };

  const handleEmailLogin = async ({ email, password }) => {
    setAuthError('');
    try {
      const result = await login(email, password);
      if (result) {
        // Log successful login
        await logAuthEvent('LOGIN', true, {
          method: 'email',
          provider: 'password',
          email: email // Include email for tracking
        });
        router.push('/calendar');
      }
      return result;
    } catch (error) {
      // Log failed login
      await logAuthEvent('LOGIN_FAILED', false, {
        method: 'email',
        provider: 'password',
        email: email,
        error: error.message || 'Login failed'
      });
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
          {/* Mobile back navigation */}
          <Box sx={{ alignSelf: 'flex-start', width: '100%', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/calendar')}
              data-testid="back-to-calendar-button"
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              Back to Calendar
            </Button>
          </Box>

          {/* Title with clear SIGN IN label */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }} data-testid="login-page">
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              SIGN IN
            </Typography>
          </Box>

          {/* Info about multiple sign-in methods */}
          <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Good to know:</strong> You can use the same email address with different sign-in methods (Google, Apple, Facebook, or Email).
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
              Your account stays the same, but some advanced features work best when you use Facebook, Google, or Apple sign-in.
            </Typography>
          </Alert>

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
                data-testid="google-login-button"
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
                data-testid="apple-login-button"
                sx={{
                  mb: 2,
                  py: 2,
                  backgroundColor: '#000000',
                  '&:hover': { backgroundColor: '#333333' },
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Continue with Apple
              </Button>

              {/* Facebook Sign In - Coming Soon */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled
                startIcon={<FacebookIcon sx={{ fontSize: 30 }} />}
                data-testid="facebook-login-button"
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
                data-testid="email-login-button"
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
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link href="/auth/reset-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Forgot Password?
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;