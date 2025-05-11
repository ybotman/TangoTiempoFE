'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  Tabs, 
  Tab,
  Card,
  CardContent,
  CardActions,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithFacebook, login } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('options');
  
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setAuthError('');
  };

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

  const handleFacebookLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    const result = await authenticateWithFacebook();
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

  if (loading || isRedirecting) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
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
              You are already logged in!
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
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, marginBottom: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Log In
          </Typography>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="login options" 
            sx={{ mb: 3, width: '100%' }}
            variant="fullWidth"
          >
            <Tab label="Options" value="options" />
            <Tab label="Email" value="email" />
            <Tab label="Google" value="google" />
            <Tab label="Facebook" value="facebook" />
          </Tabs>
          
          {activeTab === 'options' && (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">Email Login</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Log in with your email address and password
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => setActiveTab('email')}
                    sx={{ ml: 1, mb: 1 }}
                  >
                    Continue with Email
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GoogleIcon sx={{ mr: 1, color: '#4285F4' }} />
                    <Typography variant="h6">Google Login</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Log in with your Google account credentials
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => setActiveTab('google')}
                    sx={{ ml: 1, mb: 1 }}
                  >
                    Continue with Google
                  </Button>
                </CardActions>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FacebookIcon sx={{ mr: 1, color: '#4267B2' }} />
                    <Typography variant="h6">Facebook Login</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Log in with your Facebook account credentials
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => setActiveTab('facebook')}
                    sx={{ ml: 1, mb: 1 }}
                  >
                    Continue with Facebook
                  </Button>
                </CardActions>
              </Card>
            </Box>
          )}
          
          {activeTab === 'email' && (
            <EmailAuthForm 
              mode="login" 
              onSubmit={handleEmailLogin} 
              error={authError || error} 
            />
          )}
          
          {activeTab === 'google' && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
              <GoogleIcon sx={{ fontSize: 60, color: '#4285F4', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Log in with Google</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We&apos;ll securely connect your Google account
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GoogleIcon />}
                sx={{ mt: 2 }}
                onClick={handleGoogleLogIn}
                fullWidth
              >
                Continue with Google
              </Button>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          )}
          
          {activeTab === 'facebook' && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
              <FacebookIcon sx={{ fontSize: 60, color: '#4267B2', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Log in with Facebook</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We&apos;ll securely connect your Facebook account
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: '#4267B2',
                  '&:hover': {
                    backgroundColor: '#365899',
                  },
                  width: '100%'
                }}
                startIcon={<FacebookIcon />}
                onClick={handleFacebookLogIn}
              >
                Continue with Facebook
              </Button>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;