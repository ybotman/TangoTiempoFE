'use client';

// OutreachApplyForm.js
// Single-page, pre-filled organizer application form for outreach link arrivals.
// Renders when orgToken is present in URL. No tabs, no wizard — just a simple form.
// Backend endpoints (resolve-token, track) are placeholder until Fulton delivers.

import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  MenuItem,
  Link as MuiLink
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppleIcon from '@/components/AppleIcon';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useOrganizers } from '@/hooks/useOrganizers';
import { useRoles } from '@/hooks/useRoles';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useOutreachToken } from '@/hooks/useOutreachToken';
import PropTypes from 'prop-types';

const ORGANIZER_TYPES = [
  { key: 'isEventOrganizer', label: 'Event Organizer' },
  { key: 'isVenue', label: 'Venue' },
  { key: 'isTeacher', label: 'Teacher' },
  { key: 'isMaestro', label: 'Maestro' },
  { key: 'isDJ', label: 'DJ' },
  { key: 'isOrchestra', label: 'Orchestra' },
];

// --- Auth Gate Section ---
const AuthGateSection = ({ onAuthComplete }) => {
  const { authenticateWithGoogle, authenticateWithApple, loading } = useContext(AuthContext);
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleGoogleAuth = async () => {
    setAuthenticating(true);
    setAuthError('');
    try {
      const result = await authenticateWithGoogle();
      if (result) {
        onAuthComplete?.();
      } else {
        setAuthError('Authentication failed. Please try again.');
      }
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleAppleAuth = async () => {
    setAuthenticating(true);
    setAuthError('');
    try {
      const result = await authenticateWithApple();
      if (result) {
        onAuthComplete?.();
      } else {
        setAuthError('Authentication failed. Please try again.');
      }
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setAuthenticating(false);
    }
  };

  if (loading || authenticating) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Signing you in...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <PersonAddIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Sign in to continue your application
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create a free account or sign in to get started as an organizer.
      </Typography>

      {authError && (
        <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320, mx: 'auto' }}>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleAuth}
          size="large"
          fullWidth
        >
          Continue with Google
        </Button>
        <Button
          variant="outlined"
          startIcon={<AppleIcon />}
          onClick={handleAppleAuth}
          size="large"
          fullWidth
        >
          Continue with Apple
        </Button>
        <Divider sx={{ my: 1 }}>or</Divider>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink href="/auth/login" underline="hover">Sign in</MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

AuthGateSection.propTypes = {
  onAuthComplete: PropTypes.func,
};

// --- Main Outreach Apply Form ---
const OutreachApplyForm = () => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData, loading: userLoading } = useUsers();
  const { createOrganizer } = useOrganizers();
  const { roles } = useRoles();
  const { logRoleChange, logActivity } = useActivityLogger();
  const {
    prefillData,
    tokenError,
    resolving,
    trackEvent,
    clearToken
  } = useOutreachToken();

  // Form state — initialized from prefill data when available
  const [formData, setFormData] = useState({
    orgName: '',
    shortName: '',
    contactName: '',
    contactEmail: '',
    organizerType: 'isEventOrganizer',
    description: '',
    website: '',
  });
  const [roeAccepted, setRoeAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [newOrganizerId, setNewOrganizerId] = useState(null);

  // Apply prefill data when it arrives from token resolution
  useEffect(() => {
    if (prefillData && !prefillApplied) {
      setFormData(prev => ({
        ...prev,
        orgName: prefillData.orgName || prev.orgName,
        contactName: prefillData.contactName || prev.contactName,
        contactEmail: prefillData.contactEmail || user?.email || prev.contactEmail,
        organizerType: prefillData.organizerType || prev.organizerType,
        website: prefillData.website || prev.website,
      }));
      setPrefillApplied(true);
    }
  }, [prefillData, prefillApplied, user?.email]);

  // Fall back to user email if no prefill email
  useEffect(() => {
    if (user?.email && !formData.contactEmail) {
      setFormData(prev => ({ ...prev, contactEmail: user.email }));
    }
  }, [user?.email, formData.contactEmail]);

  // Track form opened event
  useEffect(() => {
    if (user && prefillData) {
      trackEvent('form_opened', { firebaseUserId: user.uid });
    }
  }, [user, prefillData, trackEvent]);

  // Track onboarding complete when success screen renders
  useEffect(() => {
    if (submitSuccess && newOrganizerId) {
      trackEvent('onboarding_complete', {
        firebaseUserId: user?.uid,
        organizerId: newOrganizerId
      });
    }
  }, [submitSuccess, newOrganizerId, user?.uid, trackEvent]);

  // Auto-generate shortName suggestion from orgName
  useEffect(() => {
    if (formData.orgName && !formData.shortName) {
      const words = formData.orgName.split(' ');
      const suggestion = words.length > 2
        ? words.map(w => w[0]).join('').toUpperCase().slice(0, 12)
        : formData.orgName.slice(0, 12);
      setFormData(prev => ({ ...prev, shortName: suggestion }));
    }
  }, [formData.orgName, formData.shortName]);

  const regionalOrganizerRole = useMemo(() => {
    if (!Array.isArray(roles)) return null;
    return roles.find(role => role?.roleName === 'RegionalOrganizer');
  }, [roles]);

  const isAlreadyOrganizer = userData?.regionalOrganizerInfo?.organizerId;

  const handleChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.orgName || formData.orgName.length < 7) {
      setSubmitError('Organizer name must be at least 7 characters.');
      return;
    }
    if (!formData.shortName || formData.shortName.length < 3 || formData.shortName.length > 12) {
      setSubmitError('Short name must be 3-12 characters.');
      return;
    }
    if (!formData.contactEmail) {
      setSubmitError('Contact email is required.');
      return;
    }
    if (!formData.description) {
      setSubmitError('Please add a brief description.');
      return;
    }
    if (!roeAccepted) {
      setSubmitError('You must accept the organizer guidelines to continue.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Step 1: Add RegionalOrganizer role if needed
      if (regionalOrganizerRole?._id && userData) {
        const existingRoleIds = Array.isArray(userData.roleIds)
          ? userData.roleIds.map(role =>
              typeof role === 'string' ? role : (role?._id ? String(role._id) : '')
            ).filter(Boolean)
          : [];

        if (!existingRoleIds.includes(String(regionalOrganizerRole._id))) {
          const updatedRoleIds = [...new Set([...existingRoleIds, String(regionalOrganizerRole._id)])];
          await updateUserData({ roleIds: updatedRoleIds });

          await logRoleChange('NamedUser', 'RegionalOrganizer', {
            changedBy: 'user',
            location: 'OutreachApplyForm',
            applicationStatus: 'outreach_apply'
          });
        }
      }

      // Step 2: Build organizer type flags
      const organizerTypes = {
        isEventOrganizer: false,
        isVenue: false,
        isTeacher: false,
        isMaestro: false,
        isDJ: false,
        isOrchestra: false,
      };
      if (formData.organizerType && Object.prototype.hasOwnProperty.call(organizerTypes, formData.organizerType)) {
        organizerTypes[formData.organizerType] = true;
      } else {
        organizerTypes.isEventOrganizer = true;
      }

      // Step 3: Create organizer record
      const resolvedRegionId = prefillData?.regionId || userData?.localUserInfo?.userDefaults?.region || null;
      if (!resolvedRegionId) {
        setSubmitError('Unable to determine your region. Please contact support or use the standard application.');
        setSubmitting(false);
        return;
      }

      const organizerPayload = {
        linkedUserLogin: userData._id,
        firebaseUserId: userData.firebaseUserId || user?.uid || '',
        name: formData.orgName,
        fullName: formData.orgName,
        shortName: formData.shortName,
        contactName: formData.contactName || '',
        contactEmail: formData.contactEmail,
        description: formData.description,
        website: formData.website || '',
        organizerRegion: resolvedRegionId,
        isActive: true,
        isEnabled: true,
        wantRender: false,
        organizerTypes,
        onboardingSource: 'outreach',
      };

      const newOrganizer = await createOrganizer(organizerPayload);

      if (!newOrganizer?._id) {
        throw new Error('Failed to create organizer record.');
      }

      // Step 4: Update user's regionalOrganizerInfo
      await updateUserData({
        regionalOrganizerInfo: {
          organizerId: newOrganizer._id,
          isApproved: true,
          isEnabled: true,
          isActive: true,
          ApprovalDate: new Date(),
          allowedMasteredCityIds: [],
          allowedMasteredDivisionIds: [],
        },
      });

      // Step 5: Log and track
      await logActivity('OUTREACH_APPLICATION', 'user', userData._id, {
        organizerId: newOrganizer._id,
        source: 'outreach',
        organizerType: formData.organizerType
      });

      await trackEvent('application_submitted', {
        firebaseUserId: user?.uid,
        organizerId: newOrganizer._id.toString()
      });

      clearToken();
      setNewOrganizerId(newOrganizer._id.toString());
      setSubmitSuccess(true);

    } catch (error) {
      console.error('Outreach application error:', error);
      setSubmitError(
        error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render: Token Error States ---
  if (tokenError && tokenError !== 'endpoint_unavailable') {
    const errorMessages = {
      token_not_found: 'This invitation link isn\'t valid.',
      token_expired: 'This invitation has expired.',
      token_already_used: 'This invitation has already been used.',
    };

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {errorMessages[tokenError] || 'There was a problem with this invitation link.'}
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You can still apply to become an organizer using our standard application.
        </Typography>
        <Button variant="contained" href="/organizers/apply">
          Apply Manually
        </Button>
      </Box>
    );
  }

  // --- Render: Resolving Token ---
  if (resolving) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading your invitation...
        </Typography>
      </Box>
    );
  }

  // --- Render: Auth Gate (not logged in) ---
  if (!user) {
    return <AuthGateSection />;
  }

  // --- Render: Already an organizer ---
  if (isAlreadyOrganizer) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          You&apos;re already an organizer!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your organizer profile is set up. You can start adding events right away.
        </Typography>
        <Button variant="contained" href="/calendar">
          Go to Calendar
        </Button>
      </Box>
    );
  }

  // --- Render: Loading user data ---
  if (userLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading your profile...
        </Typography>
      </Box>
    );
  }

  // --- Render: Success ---
  if (submitSuccess) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          You&apos;re in!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Welcome to TangoTiempo. Your organizer profile has been created and approved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" href="/calendar">
            Add Your First Event
          </Button>
          <Button variant="outlined" href="/organizers/apply">
            Edit Your Profile
          </Button>
        </Box>
      </Box>
    );
  }

  // --- Render: The Simple Form ---
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Complete Your Organizer Application
      </Typography>

      {prefillData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          We&apos;ve pre-filled some information from your invitation. Feel free to edit anything.
        </Alert>
      )}

      {/* Endpoint unavailable notice — shown during scaffolding, before Fulton delivers */}
      {tokenError === 'endpoint_unavailable' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Pre-fill data is not yet available. Please fill in your details below.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Organizer Name"
          value={formData.orgName}
          onChange={handleChange('orgName')}
          required
          fullWidth
          helperText="At least 7 characters. This is how you'll appear on TangoTiempo."
          error={formData.orgName.length > 0 && formData.orgName.length < 7}
        />

        <TextField
          label="Short Name"
          value={formData.shortName}
          onChange={handleChange('shortName')}
          required
          fullWidth
          helperText="3-12 characters. Used in compact displays."
          inputProps={{ maxLength: 12 }}
          error={formData.shortName.length > 0 && (formData.shortName.length < 3 || formData.shortName.length > 12)}
        />

        <TextField
          label="Contact Name (optional)"
          value={formData.contactName}
          onChange={handleChange('contactName')}
          fullWidth
          helperText="Your name or the primary contact person's name."
        />

        <TextField
          label="Contact Email"
          type="email"
          value={formData.contactEmail}
          onChange={handleChange('contactEmail')}
          required
          fullWidth
        />

        <TextField
          label="Organizer Type"
          select
          value={formData.organizerType}
          onChange={handleChange('organizerType')}
          fullWidth
        >
          {ORGANIZER_TYPES.map(type => (
            <MenuItem key={type.key} value={type.key}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          required
          multiline
          rows={3}
          fullWidth
          helperText="Tell the tango community about yourself or your organization."
        />

        <TextField
          label="Website (optional)"
          value={formData.website}
          onChange={handleChange('website')}
          fullWidth
          placeholder="https://"
        />

        <Divider />

        {/* Inline ROE Terms Acceptance */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Community Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            As a TangoTiempo organizer, you agree to create and manage authentic Argentine Tango
            events, maintain accurate event information, and represent the tango community
            professionally. Only strictly Argentine Tango events are permitted. Events are
            monitored by our AI system for quality and compliance.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={roeAccepted}
                onChange={(e) => setRoeAccepted(e.target.checked)}
                color="primary"
              />
            }
            label="I accept the organizer community guidelines"
          />
        </Paper>

        {submitError && (
          <Alert severity="error">{submitError}</Alert>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting || !roeAccepted}
          sx={{ py: 1.5 }}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default OutreachApplyForm;
