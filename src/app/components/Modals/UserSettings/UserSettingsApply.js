// src/components/Modals/UserSettings/UserSettingsApply.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
import { useOrganizers } from '@/hooks/useOrganizers';

const UserSettingsApply = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const { userData, loading: userDataLoading, updateUserData } = useUsers();

  const { loading: rolesLoading, getRoleByName } = useRoles();
  const { createOrganizer, createLoading } = useOrganizers();

  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    console.log('UserData:', userData);
    if (userData?.regionalOrganizerInfo?.isApproved) {
      setIsApplied(true);
    }
  }, [userData]);

  const handleApply = async () => {
    setApplicationStatus('loading');
    setErrorMessage('');

    try {
      // Step 1: Get the RegionalOrganizer role ID
      const regionalOrganizerRole = getRoleByName('RegionalOrganizer');
      if (!regionalOrganizerRole) {
        throw new Error('RegionalOrganizer role not found.');
      }

      // Step 2: Add RegionalOrganizer role to user's roleIds
      const updatedRoleIds = [...userData.roleIds, regionalOrganizerRole._id];

      // Remove duplicates if any
      const uniqueRoleIds = [...new Set(updatedRoleIds.map(String))];

      await updateUserData({
        roleIds: uniqueRoleIds,
      });

      // Step 3: Create a new organizer with default values
      const organizerData = {
        linkedUserLogin: userData._id,
        firebaseUserId: user.uid,
        name: userData.localUserInfo.firstName || 'Default Name',
        fullName:
          `${userData.localUserInfo.firstName || ''} ${userData.localUserInfo.lastName || ''}`.trim(),
        shortName: (userData.localUserInfo.firstName || 'Default')
          .substring(0, 9)
          .toUpperCase(),
        description: '',
        publicContactInfo: {},
        organizerRegion:
          userData.localUserInfo.userDefaults?.region || 'defaultRegionId',
        isEnabled: false,
        organizerTypes: {
          isEventOrganizer: true,
        },
        // Add any other default values as needed
      };

      const newOrganizer = await createOrganizer(organizerData);

      // Step 4: Update userLogins.regionalOrganizerInfo.organizerId
      await updateUserData({
        regionalOrganizerInfo: {
          ...userData.regionalOrganizerInfo,
          organizerId: newOrganizer._id,
          isApproved: true,
        },
      });

      setApplicationStatus('success');
      setIsApplied(true);
    } catch (error) {
      console.error('Error during application process:', error);
      setErrorMessage(error.message || 'An error occurred during application.');
      setApplicationStatus('error');
    }
  };

  // Check if userData and roles are still loading
  if (rolesLoading || userDataLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if the application is in loading state
  if (applicationStatus === 'loading' || createLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Display error message if any
  if (errorMessage) {
    return (
      <Box sx={{ mt: 2, p: isMobile ? 1 : 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, p: isMobile ? 1 : 3 }}>
      <Typography variant="h6" gutterBottom>
        Apply to Become a Regional Organizer
      </Typography>

      {isApplied ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have already applied and are approved as a Regional Organizer.
        </Alert>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            As a Regional Organizer, you will have the ability to submit events
            and manage your organizer profile.
          </Typography>

          {applicationStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your application was successful! You can now manage your organizer
              profile.
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            disabled={
              applicationStatus === 'loading' || applicationStatus === 'success'
            }
          >
            {applicationStatus === 'loading' ? 'Applying...' : 'Apply Now'}
          </Button>
        </>
      )}
    </Box>
  );
};

UserSettingsApply.propTypes = {
  // No props are used
};

export default UserSettingsApply;
