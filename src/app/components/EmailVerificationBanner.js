// app/components/EmailVerificationBanner.js

'use client';

import React, { useState, useContext } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AuthContext } from '@/contexts/AuthContext';

const EmailVerificationBanner = () => {
  const { user, sendVerificationEmail } = useContext(AuthContext);
  const [open, setOpen] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Don't show banner if:
  // - No user logged in
  // - User email is already verified
  // - User logged in with OAuth (Google, Apple, etc.)
  if (!user || user.emailVerified || !user.email) {
    return null;
  }

  // Check if user signed in with OAuth provider
  const hasOAuthProvider = user.providerData?.some(
    provider => provider.providerId !== 'password'
  );
  if (hasOAuthProvider) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    setError('');

    try {
      const result = await sendVerificationEmail();
      
      if (result.success) {
        setMessage('Verification email sent! Check your inbox.');
        // Hide success message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(result.error || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Error resending verification:', err);
      setError('An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = () => {
    // Force a page refresh to check if email is now verified
    window.location.reload();
  };

  return (
    <Collapse in={open} sx={{ width: '100%' }}>
      <Alert
        severity="warning"
        icon={<EmailIcon />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 2,
          borderRadius: 0,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>
          Verify Your Email Address
        </AlertTitle>
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please verify your email address ({user.email}) to ensure you receive important updates and can recover your account if needed.
          </Typography>

          {/* Success Message */}
          {message && (
            <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
              ✓ {message}
            </Typography>
          )}

          {/* Error Message */}
          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleResend}
              disabled={sending}
              sx={{
                backgroundColor: 'warning.main',
                color: 'warning.contrastText',
                '&:hover': {
                  backgroundColor: 'warning.dark',
                },
              }}
            >
              {sending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: 'warning.main',
                color: 'warning.main',
                '&:hover': {
                  borderColor: 'warning.dark',
                  backgroundColor: 'warning.light',
                },
              }}
            >
              I've Verified
            </Button>
          </Box>

          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Didn't receive the email? Check your spam folder or click resend.
          </Typography>
        </Box>
      </Alert>
    </Collapse>
  );
};

export default EmailVerificationBanner;