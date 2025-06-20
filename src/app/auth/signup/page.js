// app/auth/signup/page.js

'use client';

import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';

const SignUpPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithFacebook, signUp } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Redirect immediately if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/calendar');
    }
  }, [user, loading, router]);

  const handleGoogleSignUp = async () => {
    setIsRedirecting(true);
    setAuthError('');
    const result = await authenticateWithGoogle();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsRedirecting(true);
    setAuthError('');
    const result = await authenticateWithFacebook();
    if (result) {
      router.push('/calendar');
    } else {
      setIsRedirecting(false);
    }
  };

  const handleEmailSignUp = async (formData) => {
    setAuthError('');
    try {
      const result = await signUp(formData);
      if (result) {
        router.push('/calendar');
      }
      return result;
    } catch (error) {
      setAuthError(error.message || 'Sign up failed');
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
          <Typography component="h1" variant="h4" gutterBottom>
            Create Account
          </Typography>

          {!showEmailForm ? (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">Email Sign Up<br />(BETA - <span style={{color: 'red'}}>Don't Use</span>)</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Create an account using your email address and a password
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => setShowEmailForm(true)} sx={{ ml: 1, mb: 1 }}>
                    Continue with Email
                  </Button>
                </CardActions>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GoogleIcon sx={{ mr: 1, color: '#4285F4' }} />
                    <Typography variant="h6">Google Sign Up</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Create an account using your Google account credentials
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={handleGoogleSignUp} sx={{ ml: 1, mb: 1 }}>
                    Continue with Google
                  </Button>
                </CardActions>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FacebookIcon sx={{ mr: 1, color: '#4267B2' }} />
                    <Typography variant="h6">Facebook Sign Up<br />(BETA - <span style={{color: 'red'}}>Don't Use</span>)</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Create an account using your Facebook account credentials
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={handleFacebookSignUp} sx={{ ml: 1, mb: 1 }}>
                    <>Continue with Facebook<br />(BETA - <span style={{color: 'red'}}>Don't Use</span>)</>
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ) : (
            <Box>
              <Button variant="text" onClick={() => setShowEmailForm(false)} sx={{ mb: 2 }}>
                ← Back to options
              </Button>
              <EmailAuthForm mode="signup" onSubmit={handleEmailSignUp} error={authError || error} />
            </Box>
          )}

          <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/auth/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpPage;
