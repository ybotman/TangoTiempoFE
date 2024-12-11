// UserSettingsApply.js
'use client';
import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Alert, useMediaQuery, useTheme } from '@mui/material';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useOrganizers } from '@/hooks/useOrganizers';
import ROTermsModal from './UserSettingApplyROTerms.js';

const UserSettingsApply = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { userData, updateUserData } = useUsers();
  const { roles } = useRoles();
  const { createOrganizer } = useOrganizers();

  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [restartMessage, setRestartMessage] = useState(false);

  const regionalOrganizerRole = useMemo(() => {
    return roles?.find((role) => role.roleName === 'RegionalOrganizer');
  }, [roles]);

  const hasRole = useMemo(() => {
    const userRoleIds = (userData?.roleIds || []).map((role) => (role._id ? String(role._id) : String(role)));
    return regionalOrganizerRole && userRoleIds.includes(String(regionalOrganizerRole._id));
  }, [userData, regionalOrganizerRole]);

  const isApproved = userData?.regionalOrganizerInfo?.isApproved || false;
  const hasOrganizerId = !!userData?.regionalOrganizerInfo?.organizerId;

  const handleApply = async () => {
    setApplicationStatus('loading');
    setErrorMessage('');

    try {
      if (!regionalOrganizerRole) {
        throw new Error('RegionalOrganizer role not found.');
      }

      if (!hasRole) {
        const existingRoleIds = (userData.roleIds || []).map((role) => (role._id ? String(role._id) : String(role)));
        const updatedRoleIds = [...new Set([...existingRoleIds, String(regionalOrganizerRole._id)])];

        await updateUserData({ roleIds: updatedRoleIds });
      }

      if (!hasOrganizerId) {
        const organizerData = {
          linkedUserLogin: userData._id,
          firebaseUserId: userData.firebaseUserId,
          name: 'New Organizer',
          fullName: 'New Organizer',
          organizerRegion: userData.localUserInfo?.userDefaults?.region || '66c4d99042ec462ea22484bd',
          isActive: true,
          isEnabled: true,
          wantRender: true,
          organizerTypes: {
            isEventOrganizer: true,
            isVenue: false,
            isTeacher: false,
            isMaestro: false,
            isDJ: false,
            isOrchestra: false,
          },
        };

        const newOrganizer = await createOrganizer(organizerData);

        const updatedRegionalInfo = {
          organizerId: newOrganizer._id,
          isApproved: false,
          isEnabled: true,
          isActive: true,
        };

        await updateUserData({
          regionalOrganizerInfo: updatedRegionalInfo,
        });
      }

      setApplicationStatus('success');
      setShowTerms(true);
    } catch (error) {
      console.error('Error during application process:', error);
      setErrorMessage(error.response?.data?.message || error.message || 'An error occurred during application.');
      setApplicationStatus('error');
    }
  };

  const handleAgreeToTerms = async (agreed) => {
    try {
      const updatedRegionalInfo = {
        ...userData.regionalOrganizerInfo,
        isApproved: agreed,
      };

      await updateUserData({
        regionalOrganizerInfo: updatedRegionalInfo,
      });

      setShowTerms(false);

      if (agreed) {
        setRestartMessage(true);
        setTimeout(() => {
          window.location.reload(); // Force app restart
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating terms agreement:', error);
      setErrorMessage('Failed to update terms agreement.');
    }
  };

  return (
    <Box sx={{ mt: 2, p: isMobile ? 1 : 3 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {restartMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Restarting App for Organizer Role...
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
      {!hasOrganizerId && (
        <Button variant="contained" color="primary" onClick={handleApply} disabled={applicationStatus === 'loading'}>
          {applicationStatus === 'loading' ? 'Applying...' : 'Apply'}
        </Button>
      )}
      {hasOrganizerId && !isApproved && (
        <Button variant="outlined" color="secondary" onClick={() => setShowTerms(true)}>
          Accept Terms of Use
        </Button>
      )}
      {hasOrganizerId && isApproved && (
        <Typography variant="body2" color="textSecondary">
          You have successfully applied as a Regional Organizer.
        </Typography>
      )}

      <ROTermsModal
        open={showTerms}
        onClose={() => handleAgreeToTerms(false)}
        onAgree={() => handleAgreeToTerms(true)}
      />
    </Box>
  );
};

export default UserSettingsApply;
