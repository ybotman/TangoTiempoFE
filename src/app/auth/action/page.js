// app/auth/action/page.js

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Separate component for the action handler content
const ActionHandlerContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  
  // Password reset states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate password
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  };

  // Check the action code on component mount
  useEffect(() => {
    const checkActionCode = async () => {
      if (!mode || !oobCode) {
        setError('Invalid or missing action parameters');
        setLoading(false);
        return;
      }

      try {
        if (mode === 'resetPassword') {
          // Verify the password reset code
          const emailResult = await verifyPasswordResetCode(auth, oobCode);
          setEmail(emailResult);
        } else if (mode === 'verifyEmail') {
          // Apply the email verification code
          await applyActionCode(auth, oobCode);
          setSuccess(true);
        } else {
          setError('Unsupported action mode');
        }
      } catch (err) {
        console.error('Action code error:', err);
        
        let errorMessage = 'Invalid or expired link';
        if (err.code === 'auth/expired-action-code') {
          errorMessage = 'This link has expired. Please request a new one.';
        } else if (err.code === 'auth/invalid-action-code') {
          errorMessage = 'This link is invalid. It may have already been used.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkActionCode();
  }, [mode, oobCode]);

  // Handle password reset submission
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 8 characters long and contain at least one letter and one number');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'Failed to reset password';
      if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (err.code === 'auth/expired-action-code') {
        errorMessage = 'This link has expired. Please request a new password reset.';
      }
      
      setPasswordError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login after success
  const handleContinue = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8, marginBottom: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Error State */}
          {error && !success && (
            <>
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                Error
              </Typography>
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/auth/login')}
                sx={{ mt: 2 }}
              >
                Back to Sign In
              </Button>
            </>
          )}

          {/* Email Verification Success */}
          {mode === 'verifyEmail' && success && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Email Verified!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Your email has been successfully verified. You can now sign in to your account.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleContinue}
                sx={{ mt: 2 }}
              >
                Continue to Sign In
              </Button>
            </>
          )}

          {/* Password Reset Form */}
          {mode === 'resetPassword' && !error && !success && (
            <>
              <LockResetIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Reset Password
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                Enter your new password for
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, fontWeight: 'bold' }}>
                {email}
              </Typography>

              {passwordError && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordReset} sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />

                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Password must be at least 8 characters with at least one letter and one number
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </Box>
            </>
          )}

          {/* Password Reset Success */}
          {mode === 'resetPassword' && success && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Password Reset!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Your password has been successfully reset. You can now sign in with your new password.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleContinue}
                sx={{ mt: 2 }}
              >
                Continue to Sign In
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

// Main component with Suspense boundary
const ActionPage = () => {
  return (
    <Suspense fallback={
      <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <ActionHandlerContent />
    </Suspense>
  );
};

export default ActionPage;