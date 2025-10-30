// app/auth/reset-password/page.js

'use client';

import React, { useState, useContext } from 'react';
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
import { AuthContext } from '@/contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

const ResetPasswordPage = () => {
  const { resetPassword, loading: authLoading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result && result.success) {
        setLoading(false);
        setSuccess(true);
        // Keep email in field so user can resend if needed
      } else {
        setLoading(false);
        setError(result?.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setLoading(false);
      setError('An unexpected error occurred');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8, marginBottom: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          data-testid="reset-password-page"
        >
          {/* Title */}
          <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Reset Password
          </Typography>

          {/* Description */}
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </Typography>

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ✓ Email Sent Successfully!
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                We&apos;ve sent a password reset link to your email address. Click the link in the email to reset your password.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                💡 Didn&apos;t receive it? Check your spam/junk folder, or click &quot;Send Reset Email&quot; below to try again.
              </Typography>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus={!success}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || authLoading}
              data-testid="reset-password-submit"
            >
              {loading ? <CircularProgress size={24} /> : success ? 'Resend Reset Email' : 'Send Reset Email'}
            </Button>
          </Box>

          {/* Back to Login Link */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Back to Sign In
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;