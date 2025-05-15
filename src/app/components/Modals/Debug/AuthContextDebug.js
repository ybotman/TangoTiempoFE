'use client';

import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DebugJsonView from './DebugJsonView';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Debug component for AuthContext
 */
const AuthContextDebug = () => {
  let authContext;
  
  try {
    // Get the auth context but handle it carefully to avoid circular references
    const authContextRaw = useContext(AuthContext) || {};
    
    // Create a sanitized version of the auth context
    authContext = {
      user: authContextRaw.user ? {
        uid: authContextRaw.user.uid,
        email: authContextRaw.user.email,
        displayName: authContextRaw.user.displayName,
        phoneNumber: authContextRaw.user.phoneNumber,
        photoURL: authContextRaw.user.photoURL,
        emailVerified: authContextRaw.user.emailVerified,
        isAnonymous: authContextRaw.user.isAnonymous,
        metadata: authContextRaw.user.metadata,
      } : null,
      isAuthenticated: authContextRaw.isAuthenticated,
      isInitialized: authContextRaw.isInitialized,
      error: authContextRaw.error,
      loading: authContextRaw.loading,
    };
  } catch (error) {
    console.error('Error accessing AuthContext:', error);
    authContext = { error: 'Failed to access AuthContext' };
  }
  
  // Extract basic user info for display
  const userInfo = authContext?.user ? {
    uid: authContext.user.uid,
    email: authContext.user.email,
    displayName: authContext.user.displayName,
    photoURL: authContext.user.photoURL,
  } : null;
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <AccountCircleIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Auth Context Debug
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This view shows the current state of the AuthContext, which manages user authentication.
      </Alert>
      
      {/* Authentication Status Summary */}
      <Box mb={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Authentication Status</Typography>
          <Typography>
            <strong>Authenticated:</strong> {authContext?.isAuthenticated ? 'Yes' : 'No'}
          </Typography>
          <Typography>
            <strong>Initialized:</strong> {authContext?.isInitialized ? 'Yes' : 'No'}
          </Typography>
          <Typography>
            <strong>Loading:</strong> {authContext?.loading ? 'Yes' : 'No'}
          </Typography>
          {authContext?.error && (
            <Typography color="error">
              <strong>Error:</strong> {authContext.error}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* User Info Summary */}
      {userInfo && (
        <Box mb={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>User Information</Typography>
            <Typography>
              <strong>Display Name:</strong> {userInfo.displayName || '-'}
            </Typography>
            <Typography>
              <strong>Email:</strong> {userInfo.email || '-'}
            </Typography>
            <Typography>
              <strong>UID:</strong> {userInfo.uid}
            </Typography>
          </Paper>
        </Box>
      )}

      <DebugJsonView title="Auth Context State" data={authContext} expandByDefault />
    </Box>
  );
};

export default AuthContextDebug;