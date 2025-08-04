// UserSettingsApply.js
'use client';
import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Alert, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useOrganizers } from '@/hooks/useOrganizers';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import ROTermsModal from './UserSettingApplyROTerms.js';

const UserSettingsApply = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { userData, updateUserData, loading: userDataLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const { createOrganizer } = useOrganizers();
  const { logRoleChange, logActivity } = useActivityLogger();

  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [restartMessage, setRestartMessage] = useState(false);

  // Handle missing data gracefully
  const regionalOrganizerRole = useMemo(() => {
    if (!Array.isArray(roles)) {
      console.log('Roles not loaded or not an array:', roles);
      return null;
    }
    console.log('Available roles:', roles.map(r => r?.roleName));
    return roles.find((role) => role && role.roleName === 'RegionalOrganizer');
  }, [roles]);

  const hasRole = useMemo(() => {
    if (!userData || !regionalOrganizerRole) return false;

    // Handle potential data issues safely
    const userRoleIds = Array.isArray(userData.roleIds)
      ? userData.roleIds.map(role => {
          if (!role) return '';
          return typeof role === 'string' ? role : (role._id ? String(role._id) : '');
        })
      : [];

    return regionalOrganizerRole._id && userRoleIds.includes(String(regionalOrganizerRole._id));
  }, [userData, regionalOrganizerRole]);

  // Safe access to nested properties with defaults
  const isApproved = userData?.regionalOrganizerInfo?.isApproved || false;
  const hasOrganizerId = Boolean(userData?.regionalOrganizerInfo?.organizerId);

  const handleApply = async () => {
    // Don't proceed if data is loading or missing
    if (userDataLoading || rolesLoading || !userData || !regionalOrganizerRole) {
      setErrorMessage('Application data is still loading. Please try again in a moment.');
      return;
    }

    setApplicationStatus('loading');
    setErrorMessage('');

    try {
      if (!regionalOrganizerRole._id) {
        throw new Error('RegionalOrganizer role not found or invalid.');
      }

      // Apply for regional organizer role if needed
      if (!hasRole) {
        // Safely handle roleIds and ensure we have a valid array
        const existingRoleIds = Array.isArray(userData.roleIds)
          ? userData.roleIds.map(role => {
              return typeof role === 'string' ? role : (role && role._id ? String(role._id) : '');
            }).filter(id => id) // Remove empty strings
          : [];

        const updatedRoleIds = [...new Set([...existingRoleIds, String(regionalOrganizerRole._id)])];

        // Log the role application
        await logActivity('ROLE_APPLICATION', 'user', userData._id, {
          appliedRole: 'RegionalOrganizer',
          previousRoles: existingRoleIds,
          action: 'apply'
        });

        await updateUserData({ roleIds: updatedRoleIds });
        
        // Log the role change from NU to RO
        await logRoleChange('NamedUser', 'RegionalOrganizer', {
          changedBy: 'user',
          location: 'UserSettingsApply',
          applicationStatus: 'pending_approval'
        });
      }

      // Create an organizer if needed
      if (!hasOrganizerId && userData._id) {
        // Use a default region if user's region is not available
        const defaultRegionId = '66c4d99042ec462ea22484bd'; // Fallback region ID

        const organizerData = {
          linkedUserLogin: userData._id,
          firebaseUserId: userData.firebaseUserId || '',
          name: `${userData?.localUserInfo?.firstName || 'New'} ${userData?.localUserInfo?.lastName || 'Organizer'}`,
          fullName: `${userData?.localUserInfo?.firstName || 'New'} ${userData?.localUserInfo?.lastName || 'Organizer'}`,
          organizerRegion: userData?.localUserInfo?.userDefaults?.region || defaultRegionId,
          isActive: true,
          isEnabled: false,  // Requires manual enable for safety
          wantRender: false, // Not searchable until enabled
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

        if (!newOrganizer || !newOrganizer._id) {
          throw new Error('Failed to create organizer record');
        }

        const updatedRegionalInfo = {
          organizerId: newOrganizer._id,
          isApproved: true,  // Auto-approved after ROE acceptance
          isEnabled: false,  // Requires manual enable for safety
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
      // Only proceed if we have valid userData
      if (!userData || !userData.regionalOrganizerInfo) {
        setErrorMessage('User data is not available. Please try again later.');
        return;
      }

      const updatedRegionalInfo = {
        ...userData.regionalOrganizerInfo,
        isApproved: agreed,
      };

      await updateUserData({
        regionalOrganizerInfo: updatedRegionalInfo,
      });

      // Log the terms agreement
      await logActivity('TERMS_AGREEMENT', 'user', userData._id, {
        termsType: 'RegionalOrganizerTerms',
        agreed: agreed,
        role: 'RegionalOrganizer'
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
      setErrorMessage('Failed to update terms agreement: ' + (error.message || 'Unknown error'));
    }
  };

  // Determine the overall loading state
  const isLoading = userDataLoading || rolesLoading || applicationStatus === 'loading';
  
  // Debug logging
  console.log('UserSettingsApply Debug:', {
    hasOrganizerId,
    isApproved,
    isLoading,
    userData: !!userData,
    regionalOrganizerRole: !!regionalOrganizerRole,
    buttonDisabled: isLoading || !userData || !regionalOrganizerRole
  });

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

      {/* Show loading indicator if data is still loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Loading data...</Typography>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Apply for Regional Organizer
      </Typography>

      <Typography variant="body1" gutterBottom>
        By applying, you can manage events in your region.
      </Typography>

      {/* Only show Apply button if not loading and user doesn't have an organizer ID */}
      {!isLoading && !hasOrganizerId && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          disabled={isLoading || !userData || !regionalOrganizerRole}
        >
          {applicationStatus === 'loading' ? 'Applying...' : 'Apply'}
        </Button>
      )}

      {/* Only show Terms button if user has an organizer ID but hasn't approved terms */}
      {!isLoading && hasOrganizerId && !isApproved && (
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setShowTerms(true)}
          disabled={isLoading}
        >
          Accept Terms of Use
        </Button>
      )}

      {/* Show success message if user is fully set up */}
      {!isLoading && hasOrganizerId && isApproved && (
        <Typography variant="body2" color="textSecondary">
          You have successfully applied as a Regional Organizer.
        </Typography>
      )}

      {/* Terms modal */}
      <ROTermsModal
        open={showTerms}
        onClose={() => handleAgreeToTerms(false)}
        onAgree={() => handleAgreeToTerms(true)}
      />
    </Box>
  );
};

export default UserSettingsApply;
