'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DebugJsonView from './DebugJsonView';
import { useContext } from 'react';
import { RoleContext } from '@/contexts/RoleContext';

/**
 * Debug component for RoleContext
 */
const RoleContextDebug = () => {
  const roleContext = useContext(RoleContext) || {};
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <PersonIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Role Context Debug
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This view shows the current state of the RoleContext, which manages user roles and permissions.
      </Alert>

      <DebugJsonView title="Role Context State" data={roleContext} expandByDefault />
    </Box>
  );
};

export default RoleContextDebug;