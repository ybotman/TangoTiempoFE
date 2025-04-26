'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DebugJsonView from './DebugJsonView';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Debug component for AuthContext
 */
const AuthContextDebug = () => {
  const authContext = useContext(AuthContext) || {};
  
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

      <DebugJsonView title="Auth Context State" data={authContext} expandByDefault />
    </Box>
  );
};

export default AuthContextDebug;