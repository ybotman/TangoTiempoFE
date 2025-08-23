'use client';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Tabs, Tab, useMediaQuery, useTheme, AppBar, Toolbar, IconButton, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import RegionalOrganizersProfile from './RegionalOrganizersProfile';
import RegionalOrganizersProfileImages from './RegionalOrganizersProfileImages';
import RegionalOrganizerTypes from './RegionalOrganizersTypes';
import RegionalOrganizersStatus from './RegionalOrganizersStatus';
import RegionalOrganizersSettings from './RegionalOrganizersSettings';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';
import modalStyle from '@/components/Styles/modalStyles';

const RegionalOrganizersModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = useContext(AuthContext);
  const { user } = auth || {};
  const { organizers: _, organizer, loading, error, fetchOrganizerById, updateOrganizer } = useOrganizers();
  const [currentTab, setCurrentTab] = useState('status');
  
  // TIEMPO-254: Centralized state for all tabs - persists across tab changes
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (open) {
      setCurrentTab('status');
      // TIEMPO-254: Reset unsaved changes when modal opens
      setUnsavedChanges({});
      setHasUnsavedChanges(false);
      setSaveMessage('');

      const organizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;

      if (organizerId) {
        try {
          fetchOrganizerById(organizerId);
        } catch (error) {
          console.error('Error calling fetchOrganizerById:', error);
        }
      } else {
        console.warn('No Organizer ID available. Skipping fetch.');
      }
    }
  }, [open, user, fetchOrganizerById]);

  const handleTabChange = (event, newValue) => {
    // TIEMPO-254: Preserve unsaved changes when switching tabs
    setCurrentTab(newValue);
  };

  // TIEMPO-254: Centralized field change handler
  const handleFieldChange = (tabName, fieldName, value) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        [fieldName]: value
      }
    }));
    setHasUnsavedChanges(true);
    setSaveMessage(''); // Clear any previous save message
  };

  // TIEMPO-254: Centralized save handler - saves all tabs at once
  const handleSaveAll = async () => {
    if (!hasUnsavedChanges || !organizer?._id) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Merge all unsaved changes into a single update object
      const allChanges = {};
      Object.values(unsavedChanges).forEach(tabChanges => {
        Object.assign(allChanges, tabChanges);
      });

      // Update the organizer with all changes
      await updateOrganizer(organizer._id, allChanges);

      // Clear unsaved changes and show success
      setUnsavedChanges({});
      setHasUnsavedChanges(false);
      setSaveMessage('All changes saved successfully!');
      
      // Refresh organizer data
      fetchOrganizerById(organizer._id);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveMessage('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // TIEMPO-254: Handle modal close - warn about unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setUnsavedChanges({});
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle(isMobile)}>
        {/* Header with Close Button */}
        <AppBar position="static" color="default">
          <Toolbar variant="dense">
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Event Organizer Settings
              {hasUnsavedChanges && (
                <Typography component="span" variant="caption" sx={{ ml: 2, color: 'warning.main' }}>
                  (Unsaved Changes)
                </Typography>
              )}
            </Typography>
            {/* TIEMPO-254: Save All button in header */}
            {hasUnsavedChanges && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSaveAll}
                disabled={isSaving}
                sx={{ mr: 2 }}
              >
                {isSaving ? 'Saving...' : 'Save All'}
              </Button>
            )}
            {saveMessage && (
              <Typography variant="caption" sx={{ mr: 2, color: saveMessage.includes('Error') ? 'error.main' : 'success.main' }}>
                {saveMessage}
              </Typography>
            )}
            <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {user?.backendInfo.regionalOrganizerInfo?.organizerId && (
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ p: 1 }}>
            Organizer ID: {user.backendInfo.regionalOrganizerInfo.organizerId}
          </Typography>
        )}

        {user?.backendInfo.regionalOrganizerInfo?.organizerId ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="Regional Organizer Settings Tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTabs-scrollableX': {
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                },
                '& .MuiTabs-scroller': {
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }
              }}
            >
              <Tab label="Status" value="status" />
              <Tab label="Settings" value="settings" />
              <Tab label="Profile" value="profile" />
              <Tab label="Artists+" value="types" />
              <Tab label="Profile Images" value="profileImages" />
            </Tabs>

            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">Error loading organizer data</Typography>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: 2,
                }}
              >
                {currentTab === 'status' && (
                  <RegionalOrganizersStatus
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                    onFieldChange={(field, value) => handleFieldChange('status', field, value)}
                    unsavedChanges={unsavedChanges.status || {}}
                    onSave={handleSaveAll}
                    isSaving={isSaving}
                  />
                )}
                {currentTab === 'settings' && (
                  <RegionalOrganizersSettings
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                    onFieldChange={(field, value) => handleFieldChange('settings', field, value)}
                    unsavedChanges={unsavedChanges.settings || {}}
                    onSave={handleSaveAll}
                    isSaving={isSaving}
                  />
                )}
                {currentTab === 'profile' && (
                  <RegionalOrganizersProfile
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                    onFieldChange={(field, value) => handleFieldChange('profile', field, value)}
                    unsavedChanges={unsavedChanges.profile || {}}
                    onSave={handleSaveAll}
                    isSaving={isSaving}
                  />
                )}
                {currentTab === 'types' && (
                  <RegionalOrganizerTypes
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                    onFieldChange={(field, value) => handleFieldChange('types', field, value)}
                    unsavedChanges={unsavedChanges.types || {}}
                    onSave={handleSaveAll}
                    isSaving={isSaving}
                  />
                )}
                {currentTab === 'profileImages' && (
                  <RegionalOrganizersProfileImages
                    organizerId={organizer?._id}
                    organizer={organizer}
                    updateOrganizer={updateOrganizer}
                    onFieldChange={(field, value) => handleFieldChange('profileImages', field, value)}
                    unsavedChanges={unsavedChanges.profileImages || {}}
                    onSave={handleSaveAll}
                    isSaving={isSaving}
                  />
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="textSecondary" gutterBottom sx={{ p: 2 }}>
            No organizer information available.
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
