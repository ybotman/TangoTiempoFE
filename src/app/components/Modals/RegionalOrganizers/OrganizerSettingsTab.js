'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, FormControlLabel, Checkbox, Switch,
  Tooltip, IconButton, Grid, Card, CardContent, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupIcon from '@mui/icons-material/Group';

// ── Tooltip info strings ────────────────────────────────────────────────────
const TYPE_INFO = {
  isEventOrganizer: 'Required. Allows you to create and manage tango events (milongas, classes, festivals).',
  isTeacher:        'You offer tango group or private lessons. Will appear in the Teachers directory when available.',
  isMaestro:        'Recognized master teacher. Travels to teach and perform at festivals.',
  isDJ:             'You play music at milongas and tango events.',
  isOrchestra:      'You perform live Argentine tango music.',
  isTaxiDancer:     'You are available for hire as a guided dance partner at events.',
  isVendor:         'You sell tango-related products or services (shoes, clothing, music, etc.).',
};

const VISIBILITY_INFO = {
  isEnabled:   'Activates your organizer account. When on, you can create and edit events. Turn off to pause without deleting your profile.',
  isVisible:   'Your profile appears in organizer dropdowns so others can add you as the organizer of their events.',
  wantRender:  'Your organizer profile page is included in search engine results (Google, etc.).',
};

const InfoTip = ({ text }) => (
  <Tooltip title={text} arrow placement="right">
    <IconButton size="small" tabIndex={-1} sx={{ ml: 0.5, color: 'text.secondary' }}>
      <InfoOutlinedIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);
InfoTip.propTypes = { text: PropTypes.string.isRequired };

const OrganizerSettingsTab = ({ organizer, onFieldChange, unsavedChanges }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const defaultTypes = {
    isEventOrganizer: true,
    isTeacher: false,
    isMaestro: false,
    isDJ: false,
    isOrchestra: false,
    isTaxiDancer: false,
    isVendor: false,
  };

  const [localTypes, setLocalTypes] = useState(defaultTypes);
  const [localIsEnabled, setLocalIsEnabled] = useState(true);
  const [localIsVisible, setLocalIsVisible] = useState(true);
  const [localWantRender, setLocalWantRender] = useState(false);

  useEffect(() => {
    if (!organizer) return;
    const t = organizer.organizerTypes || {};
    setLocalTypes({
      isEventOrganizer: t.isEventOrganizer ?? true,
      isTeacher:        t.isTeacher        ?? false,
      isMaestro:        t.isMaestro        ?? false,
      isDJ:             t.isDJ             ?? false,
      isOrchestra:      t.isOrchestra      ?? false,
      isTaxiDancer:     t.isTaxiDancer     ?? false,
      isVendor:         t.isVendor         ?? false,
    });
    setLocalIsEnabled(organizer.isEnabled !== false);
    setLocalIsVisible(organizer.isVisible !== false);
    setLocalWantRender(organizer.wantRender || false);
  }, [organizer]);

  // Apply centralized overrides
  const types      = unsavedChanges?.organizerTypes ?? localTypes;
  const isEnabled  = unsavedChanges?.isEnabled  ?? localIsEnabled;
  const isVisible  = unsavedChanges?.isVisible  ?? localIsVisible;
  const wantRender = unsavedChanges?.wantRender ?? localWantRender;

  const handleTypeChange = (name, checked) => {
    if (name === 'isEventOrganizer' && !checked) return; // always-on
    const next = { ...types, [name]: checked };
    setLocalTypes(next);
    onFieldChange?.('organizerTypes', next);
  };

  const handleVisibility = (key, setter) => (e) => {
    setter(e.target.checked);
    onFieldChange?.(key, e.target.checked);
  };

  const typeRows = [
    ['isEventOrganizer', 'Event Organizer'],
    ['isTeacher',        'Teacher'],
    ['isMaestro',        'Maestro'],
    ['isDJ',             'DJ'],
    ['isOrchestra',      'Orchestra'],
    ['isTaxiDancer',     'Taxi Dancer'],
    ['isVendor',         'Vendor'],
  ];

  return (
    <Box sx={{ mt: 1 }}>

      {/* ── What you do ──────────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            What you do
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Artists+ types will have dedicated searchable profiles. Select yours now to be notified when they launch.
          </Typography>

          <Grid container spacing={0} columns={isMobile ? 1 : 2}>
            {typeRows.map(([key, label]) => (
              <Grid item xs={1} key={key}>
                <Box display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={types[key] ?? false}
                        onChange={(e) => handleTypeChange(key, e.target.checked)}
                        disabled={key === 'isEventOrganizer'}
                        color="primary"
                        size="small"
                      />
                    }
                    label={label}
                    sx={{ mr: 0 }}
                  />
                  <InfoTip text={TYPE_INFO[key]} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Visibility & Access ──────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Visibility &amp; Access
          </Typography>

          {[
            { key: 'isEnabled',  label: 'Profile Active',         value: isEnabled,  setter: setLocalIsEnabled },
            { key: 'isVisible',  label: 'Profile Visible',        value: isVisible,  setter: setLocalIsVisible },
            { key: 'wantRender', label: 'Search Engine Visible',  value: wantRender, setter: setLocalWantRender },
          ].map(({ key, label, value, setter }) => (
            <Box key={key} display="flex" alignItems="center" sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={handleVisibility(key, setter)}
                    color="primary"
                    size="small"
                  />
                }
                label={label}
                sx={{ mr: 0, minWidth: 200 }}
              />
              <InfoTip text={VISIBILITY_INFO[key]} />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* ── Delegation placeholder ───────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 1, opacity: 0.7 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <GroupIcon sx={{ mr: 1 }} color="disabled" />
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
              Delegated Organizers
            </Typography>
          </Box>
          <Alert severity="info" variant="outlined">
            Allow others to create events on your behalf — coming soon.
          </Alert>
        </CardContent>
      </Card>

    </Box>
  );
};

OrganizerSettingsTab.propTypes = {
  organizer: PropTypes.object,
  onFieldChange: PropTypes.func,
  unsavedChanges: PropTypes.object,
};

export default OrganizerSettingsTab;
