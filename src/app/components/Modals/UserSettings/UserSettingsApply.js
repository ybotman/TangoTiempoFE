// UserSettingsApply.js
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Button, Alert, useMediaQuery, useTheme, CircularProgress, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
  const { createOrganizer, fetchOrganizerById, organizer } = useOrganizers();
  const { logRoleChange, logActivity } = useActivityLogger();

  const [applicationStatus, setApplicationStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [restartMessage, setRestartMessage] = useState(false);
  // TIEMPO-253: Add states for proper next steps flow
  const [showNextStepsDialog, setShowNextStepsDialog] = useState(false);

  // Handle missing data gracefully
  const regionalOrganizerRole = useMemo(() => {
    if (!Array.isArray(roles)) {
// TIEMPO-276: Security cleanup - removed logging
      return null;
    }
// TIEMPO-276: Security cleanup - removed logging
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
  const isEnabled = userData?.regionalOrganizerInfo?.isEnabled || false;
  const hasOrganizerId = Boolean(userData?.regionalOrganizerInfo?.organizerId);
  const organizerId = userData?.regionalOrganizerInfo?.organizerId;

  // Fetch organizer data if organizerId exists
  useEffect(() => {
    if (organizerId) {
      fetchOrganizerById(organizerId);
    }
  }, [organizerId, fetchOrganizerById]);

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
          isEnabled: true,   // Set true for future AI control (can be disabled later)
          isActive: true,
          ApprovalDate: new Date(),
          allowedMasteredCityIds: [],
          allowedMasteredDivisionIds: []
        };

        await updateUserData({
          regionalOrganizerInfo: updatedRegionalInfo,
        });
      }

      setApplicationStatus('success');
      setShowTerms(true);
      // TIEMPO-253: Show next steps dialog after successful application
      setShowNextStepsDialog(true);
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
  // TIEMPO-276: Security cleanup - removed logging

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

      {/* Only show Apply button if not loading and user doesn't have an organizer ID */}
      {!isLoading && !hasOrganizerId && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          disabled={isLoading || !userData || !regionalOrganizerRole}
          size="large"
          fullWidth
        >
          {applicationStatus === 'loading' ? 'Applying...' : 'Apply for Event Organizer'}
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

      {/* Show setup instructions if user is approved but not enabled */}
      {!isLoading && hasOrganizerId && isApproved && !isEnabled && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Complete Your Organizer Setup:
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Click the <strong>user icon</strong> (top right)</li>
              <li>Select <strong>&quot;Change Role&quot;</strong> → Choose <strong>&quot;Organizer/Artist&quot;</strong></li>
              <li>Open the menu (☰) → Click <strong>&quot;Organizer Settings&quot;</strong></li>
              <li>Complete ALL required fields:
                <ul style={{ marginTop: '4px' }}>
                  <li>Organizer Name</li>
                  <li>Short Name</li>
                  <li>Description</li>
                </ul>
              </li>
              <li>Enable your profile once all fields are complete</li>
            </ol>
          </Typography>
        </Alert>
      )}
      
      {/* Show instruction to change role and complete setup */}
      {!isLoading && hasOrganizerId && isApproved && !organizer?.isEnabled && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Next Steps Required:
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><strong>Change your role:</strong> Click the login button → Select "Organizer/Artist"</li>
              <li><strong>Complete your profile:</strong> Go to Event Organizer Settings → Status tab</li>
              <li><strong>Enable your profile:</strong> Complete all requirements and activate</li>
            </ol>
          </Typography>
        </Alert>
      )}
      
      {/* Show success only when organizer is actually enabled */}
      {!isLoading && hasOrganizerId && isApproved && organizer?.isEnabled && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            ✓ You're all set! You can now create events as an Organizer.
          </Typography>
        </Alert>
      )}

      {/* Show organizer status if user has an organizer ID */}
      {!isLoading && hasOrganizerId && (
        <>
          <Divider sx={{ my: 3 }} />
          
          {/* Organizer Status Section */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Organizer Status
            </Typography>
            
            {/* Application Status */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isApproved ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  <Typography variant="body2">
                    <strong>Application:</strong> {isApproved ? 'Approved' : 'Pending'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {organizer?.isEnabled ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  <Typography variant="body2">
                    <strong>Profile Status:</strong> {organizer?.isEnabled ? 'Active' : 'Not Activated'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {!organizer?.isEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  ⚠️ Profile Not Yet Activated
                </Typography>
                <Typography variant="body2">
                  To start creating events:
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  1. Change your role to <strong>"Organizer/Artist"</strong> in the top menu<br/>
                  2. Open <strong>"Event Organizer Settings"</strong><br/>
                  3. Complete all requirements in the <strong>Status tab</strong><br/>
                  4. <strong>Enable your profile</strong> to activate event creation
                </Typography>
              </Alert>
            )}
          </Paper>
        </>
      )}

      {/* TIEMPO-253: Next Steps Dialog - Shows after successful application */}
      <Dialog
        open={showNextStepsDialog}
        onClose={() => {}} // Don't allow closing without agreeing
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          🎉 Application Submitted Successfully!
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Important Next Steps Required:
            </Typography>
          </Alert>
          
          <Typography variant="body1" paragraph>
            Your application to become an Event Organizer has been submitted. To start creating events, you must:
          </Typography>
          
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography variant="body2" component="div">
              <ol style={{ margin: '8px 0' }}>
                <li><strong>Change your role</strong> to "Organizer/Artist" in the top menu</li>
                <li><strong>Open "Event Organizer Settings"</strong> from the menu</li>
                <li><strong>Complete all requirements</strong> in the Status tab</li>
                <li><strong>Enable your profile</strong> to activate event creation</li>
              </ol>
            </Typography>
          </Box>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> The page will refresh after you acknowledge these steps. 
              Please remember to change your role to "Organizer/Artist" to access the Event Organizer Settings.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setHasAgreedToNextSteps(true);
              setShowNextStepsDialog(false);
              // Show restarting message then refresh
              setRestartMessage(true);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }}
            fullWidth
          >
            I Understand - Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restarting message */}
      {restartMessage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Refreshing Application...
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
            Please remember to change your role to Organizer/Artist
          </Typography>
        </Box>
      )}

      {/* Terms modal */}
      <ROTermsModal
        open={showTerms && !showNextStepsDialog}
        onClose={() => handleAgreeToTerms(false)}
        onAgree={() => handleAgreeToTerms(true)}
      />
    </Box>
  );
};

export default UserSettingsApply;
