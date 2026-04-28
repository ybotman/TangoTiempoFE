'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Box, Typography, TextField, Grid, Card, CardContent,
  InputAdornment, IconButton, Tooltip, Button, CircularProgress,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ImageIcon from '@mui/icons-material/Image';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

// Probe candidate against /shortname-check, suffix-retry up to 5x.
const probeUnique = async (candidate, appId) => {
  const root = (candidate || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 9) || 'New';
  for (let i = 0; i <= 5; i++) {
    const tryName = i === 0 ? root : `${root}${i + 1}`.slice(0, 9);
    try {
      const { data } = await axios.get(
        `${getApiBaseUrl()}/api/organizers/shortname-check?appId=${appId}&candidate=${encodeURIComponent(tryName)}`
      );
      if (data?.available) return tryName;
    } catch {
      return tryName; // network blip — fall through to POST
    }
  }
  return null;
};

const OrganizerProfileTab = ({ organizer, onFieldChange, unsavedChanges, onShortNameBlocked, savedAt }) => {
  const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

  // ── local field state ────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [shortNameLocked, setShortNameLocked] = useState(true);
  const [shortNameStatus, setShortNameStatus] = useState({ checking: false, available: null, message: '' });
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');

  // Seed from organizer (and re-lock shortName whenever organizer or savedAt changes)
  useEffect(() => {
    if (!organizer) return;
    setFullName(organizer.fullName || '');
    setShortName(organizer.shortName || '');
    setDescription(organizer.description || '');
    setUrl(organizer.publicContactInfo?.url || '');
    setPhone(organizer.publicContactInfo?.phone || '');
    setEmail(organizer.publicContactInfo?.Email || '');
    const addr = organizer.publicContactInfo?.address || {};
    setStreet1(addr.street1 || '');
    setStreet2(addr.street2 || '');
    setCity(addr.city || '');
    setAddrState(addr.state || '');
    setZip(addr.postalCode || '');
    // Re-lock short name after every organizer refresh (post-save)
    setShortNameLocked(true);
    setShortNameStatus({ checking: false, available: null, message: '' });
  }, [organizer, savedAt]);

  // Apply unsaved overrides from centralized modal state
  const displayFullName = unsavedChanges?.fullName ?? fullName;
  const displayShortName = unsavedChanges?.shortName ?? shortName;
  const displayDescription = unsavedChanges?.description ?? description;
  const displayUrl = unsavedChanges?.['publicContactInfo.url'] ?? url;
  const displayPhone = unsavedChanges?.['publicContactInfo.phone'] ?? phone;
  const displayEmail = unsavedChanges?.['publicContactInfo.Email'] ?? email;
  const displayStreet1 = unsavedChanges?.['publicContactInfo.address.street1'] ?? street1;
  const displayStreet2 = unsavedChanges?.['publicContactInfo.address.street2'] ?? street2;
  const displayCity = unsavedChanges?.['publicContactInfo.address.city'] ?? city;
  const displayAddrState = unsavedChanges?.['publicContactInfo.address.state'] ?? addrState;
  const displayZip = unsavedChanges?.['publicContactInfo.address.postalCode'] ?? zip;

  // Tell modal whether Save should be blocked due to shortName state
  useEffect(() => {
    const blocked = !shortNameLocked && shortNameStatus.available !== true;
    onShortNameBlocked?.(blocked);
  }, [shortNameLocked, shortNameStatus.available, onShortNameBlocked]);

  const handleShortNameBlur = useCallback(async () => {
    const candidate = displayShortName.trim();
    if (!candidate) {
      setShortNameStatus({ checking: false, available: null, message: '' });
      return;
    }
    if (candidate.length < 3 || candidate.length > 9) {
      setShortNameStatus({ checking: false, available: false, message: 'Must be 3–9 characters' });
      return;
    }
    if (/CHANGE|TANGO/i.test(candidate)) {
      setShortNameStatus({ checking: false, available: false, message: 'Cannot contain "CHANGE" or "TANGO"' });
      return;
    }
    // Skip check if unchanged from saved value
    if (candidate === organizer?.shortName) {
      setShortNameStatus({ checking: false, available: true, message: 'Current name' });
      return;
    }
    setShortNameStatus({ checking: true, available: null, message: 'Checking…' });
    try {
      const { data } = await axios.get(
        `${getApiBaseUrl()}/api/organizers/shortname-check?appId=${appId}&candidate=${encodeURIComponent(candidate)}`
      );
      setShortNameStatus(
        data?.available
          ? { checking: false, available: true, message: 'Available' }
          : { checking: false, available: false, message: 'Already taken — try a variation' }
      );
    } catch {
      setShortNameStatus({ checking: false, available: null, message: '' });
    }
  }, [displayShortName, organizer?.shortName, appId]);

  const handleSuggest = useCallback(async () => {
    const root = displayFullName.replace(/[^A-Za-z0-9]/g, '') || 'New';
    setShortNameStatus({ checking: true, available: null, message: 'Finding a unique name…' });
    const suggested = await probeUnique(root, appId);
    if (suggested) {
      setShortName(suggested);
      onFieldChange?.('shortName', suggested);
      setShortNameStatus({ checking: false, available: true, message: 'Available' });
    } else {
      setShortNameStatus({ checking: false, available: false, message: 'Could not find a unique suggestion — edit manually' });
    }
  }, [displayFullName, appId, onFieldChange]);

  const field = (key, setter) => (v) => {
    setter(v);
    onFieldChange?.(key, v);
  };

  const addrField = (subKey, setter) => (v) => {
    setter(v);
    onFieldChange?.(`publicContactInfo.address.${subKey}`, v);
  };

  const contactField = (subKey, setter) => (v) => {
    setter(v);
    onFieldChange?.(`publicContactInfo.${subKey}`, v);
  };

  return (
    <Box sx={{ mt: 1 }}>

      {/* ── Identity ───────────────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Identity</Typography>
          </Box>

          <Grid container spacing={2}>

            {/* Full Name */}
            <Grid item xs={12} sm={7}>
              <TextField
                label="Full Name"
                fullWidth
                value={displayFullName}
                onChange={(e) => field('fullName', setFullName)(e.target.value)}
                error={displayFullName.trim().length > 0 && displayFullName.trim().length < 7}
                helperText={
                  displayFullName.trim().length > 0 && displayFullName.trim().length < 7
                    ? 'Min 7 characters required'
                    : 'Your name or group name as shown to the public'
                }
                inputProps={{ maxLength: 80 }}
              />
            </Grid>

            {/* Short Name — locked/unlocked */}
            <Grid item xs={12} sm={5}>
              <TextField
                label="Short Name"
                fullWidth
                value={displayShortName}
                disabled={shortNameLocked}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 9);
                  setShortName(v);
                  onFieldChange?.('shortName', v);
                  setShortNameStatus({ checking: false, available: null, message: '' });
                }}
                onBlur={handleShortNameBlur}
                error={!shortNameLocked && shortNameStatus.available === false}
                helperText={
                  shortNameLocked
                    ? 'Click 🔒 to edit'
                    : shortNameStatus.checking
                      ? 'Checking…'
                      : shortNameStatus.message || '3–9 alphanumeric characters'
                }
                inputProps={{ maxLength: 9 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {!shortNameLocked && (
                        shortNameStatus.checking ? (
                          <CircularProgress size={16} sx={{ mr: 0.5 }} />
                        ) : shortNameStatus.available === true ? (
                          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                        ) : shortNameStatus.available === false ? (
                          <CancelIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                        ) : null
                      )}
                      <Tooltip title={shortNameLocked ? 'Unlock to edit Short Name' : 'Lock (discard edit)'}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (shortNameLocked) {
                              setShortNameLocked(false);
                            } else {
                              // Re-lock: revert to saved value
                              setShortName(organizer?.shortName || '');
                              onFieldChange?.('shortName', organizer?.shortName || '');
                              setShortNameLocked(true);
                              setShortNameStatus({ checking: false, available: null, message: '' });
                            }
                          }}
                        >
                          {shortNameLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              {!shortNameLocked && (
                <Button
                  size="small"
                  sx={{ mt: 0.5 }}
                  onClick={handleSuggest}
                  disabled={shortNameStatus.checking}
                >
                  Suggest a unique name
                </Button>
              )}
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={displayDescription}
                onChange={(e) => field('description', setDescription)(e.target.value)}
                inputProps={{ maxLength: 500 }}
                helperText={`${displayDescription.trim().length}/500 — describe what you organize`}
              />
            </Grid>

            {/* URL */}
            <Grid item xs={12}>
              <TextField
                label="Website / Social Media"
                fullWidth
                value={displayUrl}
                onChange={(e) => contactField('url', setUrl)(e.target.value)}
                helperText="Optional — website, Facebook, Instagram, etc."
              />
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <ContactMailIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Contact</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Email"
                fullWidth
                value={displayEmail}
                onChange={(e) => contactField('Email', setEmail)(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={displayPhone}
                onChange={(e) => contactField('phone', setPhone)(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                fullWidth
                value={displayStreet1}
                onChange={(e) => addrField('street1', setStreet1)(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address 2"
                fullWidth
                value={displayStreet2}
                onChange={(e) => addrField('street2', setStreet2)(e.target.value)}
                helperText="Apt, suite, etc. (optional)"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="City"
                fullWidth
                value={displayCity}
                onChange={(e) => addrField('city', setCity)(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="State"
                fullWidth
                value={displayAddrState}
                onChange={(e) => addrField('state', setAddrState)(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Zip"
                fullWidth
                value={displayZip}
                onChange={(e) => addrField('postalCode', setZip)(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Images placeholder ─────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 1, opacity: 0.7 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <ImageIcon sx={{ mr: 1 }} color="disabled" />
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
              Profile Images
            </Typography>
          </Box>
          <Alert severity="info" variant="outlined">
            Banner, profile photo, and logo upload — coming soon.
          </Alert>
        </CardContent>
      </Card>

    </Box>
  );
};

OrganizerProfileTab.propTypes = {
  organizer: PropTypes.object,
  onFieldChange: PropTypes.func,
  unsavedChanges: PropTypes.object,
  onShortNameBlocked: PropTypes.func,
  savedAt: PropTypes.number,
};

export default OrganizerProfileTab;
