'use client';

import React, { useState, useContext, useMemo } from 'react';
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

  const { roles, loading: rolesLoading } = useRoles();
  const { createOrganizer, createLoading, fetchOrganizerByFirebaseUserId } =
    useOrganizers();

  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Memoize the RegionalOrganizer role
  const regionalOrganizerRole = useMemo(() => {
    return roles?.find((role) => role.roleName === 'RegionalOrganizer');
  }, [roles]);

  // Determine if the user already has the role
  const hasRole = useMemo(() => {
    return (
      regionalOrganizerRole &&
      Array.isArray(userData?.roleIds) &&
      userData.roleIds.includes(regionalOrganizerRole._id)
    );
  }, [userData, regionalOrganizerRole]);

  // Check if the user has applied (i.e., has an organizerId)
  const isApplied = useMemo(() => {
    return Boolean(userData?.regionalOrganizerInfo?.organizerId);
  }, [userData]);

  const handleApply = async () => {
    setApplicationStatus('loading');
    setErrorMessage('');

    try {
      if (!regionalOrganizerRole) {
        throw new Error('RegionalOrganizer role not found.');
      }

      if (!hasRole) {
        const currentRoleIds = userData.roleIds.map((role) =>
          typeof role === 'object' && role._id ? String(role._id) : String(role)
        );

        const updatedRoleIds = [
          ...currentRoleIds,
          String(regionalOrganizerRole._id),
        ];

        const uniqueRoleIds = [...new Set(updatedRoleIds)];

        await updateUserData({
          roleIds: uniqueRoleIds,
        });
      }

      let organizerId = userData?.regionalOrganizerInfo?.organizerId;

      if (!organizerId) {
        // Try to find existing organizer
        const existingOrganizer = await fetchOrganizerByFirebaseUserId(
          user.uid
        );
        if (existingOrganizer) {
          organizerId = existingOrganizer._id;
        } else {
          // Prepare default values
          const firstName = userData.localUserInfo?.firstName || 'Default';
          const lastName = userData.localUserInfo?.lastName || 'Name';
          const fullName = `${firstName} ${lastName}`.trim() || 'Change this';

          const organizerData = {
            linkedUserLogin: userData._id,
            firebaseUserId: user.uid,
            name: firstName,
            fullName: fullName,
            shortName: firstName.substring(0, 9).toUpperCase(),
            description: '',
            publicContactInfo: {},
            organizerRegion:
              userData.localUserInfo?.userDefaults?.region ||
              '66c4d99042ec462ea22484bd', // Default region ID
            isEnabled: false,
            organizerTypes: {
              isEventOrganizer: true,
            },
          };

          const newOrganizer = await createOrganizer(organizerData);
          organizerId = newOrganizer._id;
        }

        // Update userLogins.regionalOrganizerInfo.organizerId
        await updateUserData({
          regionalOrganizerInfo: {
            ...(userData.regionalOrganizerInfo || {}),
            organizerId: organizerId,
            isApproved: false,
          },
        });
      }

      setApplicationStatus('success');
    } catch (error) {
      console.error('Error during application process:', error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'An error occurred during application.'
      );
      setApplicationStatus('error');
    }
  };

  if (rolesLoading || userDataLoading || createLoading) {
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

  return (
    <Box sx={{ mt: 2, p: isMobile ? 1 : 3 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {applicationStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your application has been submitted successfully!
        </Alert>
      )}
      <Typography variant="h6" gutterBottom>
        Apply for Regional Organizer
      </Typography>
      <Typography variant="body1" gutterBottom>
        By applying, you can manage events in your region.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleApply}
        disabled={hasRole || isApplied || applicationStatus === 'loading'}
      >
        {applicationStatus === 'loading'
          ? 'Applying...'
          : hasRole || isApplied
            ? 'Already Applied'
            : 'Apply'}
      </Button>
    </Box>
  );
};

export default UserSettingsApply;
