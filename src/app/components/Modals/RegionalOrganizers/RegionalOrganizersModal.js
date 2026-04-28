'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Box, AppBar, Toolbar, Typography, Tabs, Tab,
  IconButton, Button, Tooltip, CircularProgress,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import modalStyle from '@/components/Styles/modalStyles';
import OrganizerProfileTab  from './OrganizerProfileTab';
import OrganizerSettingsTab from './OrganizerSettingsTab';
import OrganizerStatusTab   from './OrganizerStatusTab';

const RegionalOrganizersModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext) || {};
  const { organizer, loading, error, fetchOrganizerById, updateOrganizer } = useOrganizers();

  const [currentTab, setCurrentTab]           = useState('profile');
  const [unsavedChanges, setUnsavedChanges]   = useState({});
  const [hasUnsaved, setHasUnsaved]           = useState(false);
  const [shortNameBlocked, setShortNameBlocked] = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [saveMessage, setSaveMessage]         = useState('');
  // Bumped on successful save to trigger Profile re-lock
  const [savedAt, setSavedAt]                 = useState(0);

  useEffect(() => {
    if (!open) return;
    setCurrentTab('profile');
    setUnsavedChanges({});
    setHasUnsaved(false);
    setSaveMessage('');
    const organizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;
    if (organizerId) fetchOrganizerById(organizerId);
  }, [open, user, fetchOrganizerById]);

  const handleTabChange = (_, newTab) => setCurrentTab(newTab);

  const handleFieldChange = useCallback((tabKey, fieldName, value) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], [fieldName]: value },
    }));
    setHasUnsaved(true);
    setSaveMessage('');
  }, []);

  const handleSaveAll = async () => {
    if (!hasUnsaved || !organizer?._id) return;
    setIsSaving(true);
    setSaveMessage('');
    const allChanges = {};
    Object.values(unsavedChanges).forEach(c => Object.assign(allChanges, c));
    try {
      await updateOrganizer(organizer._id, allChanges);
      setUnsavedChanges({});
      setHasUnsaved(false);
      setSavedAt(Date.now());
      setSaveMessage('Saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      if (err.response?.status === 409) {
        setSaveMessage(`Short name "${allChanges.shortName || organizer.shortName}" is already taken.`);
      } else {
        setSaveMessage('Error saving — please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsaved) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return;
    }
    setUnsavedChanges({});
    setHasUnsaved(false);
    onClose();
  };

  const saveBlocked = shortNameBlocked;
  const saveDisabled = !hasUnsaved || isSaving || saveBlocked;

  const saveTooltip = isSaving
    ? 'Saving…'
    : saveBlocked
      ? 'Confirm short name availability before saving'
      : !hasUnsaved
        ? 'No changes'
        : '';

  const organizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle(isMobile)}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Organizer Settings
              {hasUnsaved && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main' }}>
                  · unsaved
                </Typography>
              )}
            </Typography>

            {saveMessage && (
              <Typography
                variant="caption"
                sx={{ mr: 1.5, color: saveMessage === 'Saved' ? 'success.main' : 'error.main' }}
              >
                {saveMessage}
              </Typography>
            )}

            <Tooltip title={saveTooltip} disableHoverListener={!saveTooltip}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleSaveAll}
                  disabled={saveDisabled}
                  sx={{ mr: 1 }}
                  startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : null}
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </span>
            </Tooltip>

            <IconButton edge="end" color="inherit" onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {organizerId ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)' }}>

            {/* ── Tabs ───────────────────────────────────────────────────── */}
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
            >
              <Tab label="Profile"  value="profile"  />
              <Tab label="Settings" value="settings" />
              <Tab label="Status"   value="status"   />
            </Tabs>

            {/* ── Tab content ────────────────────────────────────────────── */}
            {loading ? (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>Error loading organizer data.</Typography>
            ) : (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>

                {currentTab === 'profile' && (
                  <OrganizerProfileTab
                    organizer={organizer}
                    unsavedChanges={unsavedChanges.profile || {}}
                    onFieldChange={(field, value) => handleFieldChange('profile', field, value)}
                    onShortNameBlocked={setShortNameBlocked}
                    savedAt={savedAt}
                  />
                )}

                {currentTab === 'settings' && (
                  <OrganizerSettingsTab
                    organizer={organizer}
                    unsavedChanges={unsavedChanges.settings || {}}
                    onFieldChange={(field, value) => handleFieldChange('settings', field, value)}
                  />
                )}

                {currentTab === 'status' && (
                  <OrganizerStatusTab
                    organizer={organizer}
                    user={user}
                  />
                )}

              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No organizer profile found. Apply to become an Event Organizer first.
          </Typography>
        )}

      </Box>
    </Modal>
  );
};

RegionalOrganizersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegionalOrganizersModal;
