'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import { useOrganizers } from '@/hooks/useOrganizers';
import axios from 'axios';

const RegionalOrganizersSettings = ({ organizerId, organizer, updateOrganizer, onFieldChange, unsavedChanges, isSaving }) => {
  const { organizers } = useOrganizers();
  
  // Local state (needed for fallback when centralized state is not available)
  const [localIsVisible, setIsVisible] = useState(true);
  const [localIsCrawlable, setIsCrawlable] = useState(false);
  const [localDelegatedOrganizerIds, setDelegatedOrganizerIds] = useState([]);
  
  // TIEMPO-254: Use unsaved changes if available, otherwise use local state
  const isVisible = unsavedChanges?.isVisible !== undefined ? unsavedChanges.isVisible : localIsVisible;
  const isCrawlable = unsavedChanges?.wantRender !== undefined ? unsavedChanges.wantRender : localIsCrawlable;
  const delegatedOrganizerIds = unsavedChanges?.delegatedOrganizerIds !== undefined ? unsavedChanges.delegatedOrganizerIds : localDelegatedOrganizerIds;
  const [selectedDelegateId, setSelectedDelegateId] = useState('');
  
  // Initial values for comparison
  const [initialIsVisible, setInitialIsVisible] = useState(true);
  const [initialIsCrawlable, setInitialIsCrawlable] = useState(false);
  const [initialDelegatedOrganizerIds, setInitialDelegatedOrganizerIds] = useState([]);
  
  // UI state for delegated organizers
  const [delegatedOrganizers, setDelegatedOrganizers] = useState([]);
  const [loadingDelegates, setLoadingDelegates] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get values from userLogins
  // const regionalOrganizerInfo = userData?.regionalOrganizerInfo || {};

  useEffect(() => {
    if (organizer) {
      // Set local state for fallback
      setIsVisible(organizer.isVisible !== false);
      setIsCrawlable(organizer.wantRender || false);
      setDelegatedOrganizerIds(organizer.delegatedOrganizerIds || []);
      // Set initial values for comparison
      setInitialIsVisible(organizer.isVisible !== false);
      setInitialIsCrawlable(organizer.wantRender || false);
      setInitialDelegatedOrganizerIds(organizer.delegatedOrganizerIds || []);
    }
  }, [organizer]);
  
  // Fetch delegated organizer details
  useEffect(() => {
    const fetchDelegatedOrganizers = async () => {
      if (!delegatedOrganizerIds.length) {
        setDelegatedOrganizers([]);
        return;
      }
      
      setLoadingDelegates(true);
      try {
        const fetchedOrganizers = await Promise.all(
          delegatedOrganizerIds.map(async (id) => {
            if (!id) return null;
            try {
              const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${id}`);
              return response.data;
            } catch (error) {
              console.error(`Failed to fetch organizer ${id}:`, error);
              return null;
            }
          })
        );
        setDelegatedOrganizers(fetchedOrganizers.filter(org => org !== null));
      } catch (error) {
        console.error('Error fetching delegated organizers:', error);
      } finally {
        setLoadingDelegates(false);
      }
    };
    
    fetchDelegatedOrganizers();
  }, [delegatedOrganizerIds]);

  // TIEMPO-254: Use centralized isSaving if available, otherwise check for changes
  const isSaveDisabled = isSaving !== undefined ? isSaving : (
    (isVisible === initialIsVisible &&
    isCrawlable === initialIsCrawlable &&
    JSON.stringify(delegatedOrganizerIds) === JSON.stringify(initialDelegatedOrganizerIds)) ||
    saving
  );

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };


  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    setSaving(true);
    
    try {
      // Update organizers collection
      await updateOrganizer(organizerId, {
        isVisible,
        wantRender: isCrawlable,
        delegatedOrganizerIds
      });
      
      // Update initial values
      setInitialIsVisible(isVisible);
      setInitialIsCrawlable(isCrawlable);
      setInitialDelegatedOrganizerIds(delegatedOrganizerIds);
      
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setErrorMessage('An error occurred while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  
  // Handle delegated organizer management
  const handleAddDelegate = () => {
    if (selectedDelegateId && !delegatedOrganizerIds.includes(selectedDelegateId)) {
      const newDelegates = [...delegatedOrganizerIds, selectedDelegateId];
      // TIEMPO-254: Use centralized field change handler if available
      if (onFieldChange) {
        onFieldChange('delegatedOrganizerIds', newDelegates);
      } else {
        setDelegatedOrganizerIds(newDelegates);
      }
      setSelectedDelegateId('');
    }
  };
  
  const handleRemoveDelegate = (delegateId) => {
    const newDelegates = delegatedOrganizerIds.filter(id => id !== delegateId);
    // TIEMPO-254: Use centralized field change handler if available  
    if (onFieldChange) {
      onFieldChange('delegatedOrganizerIds', newDelegates);
    } else {
      setDelegatedOrganizerIds(newDelegates);
    }
  };
  
  // Get available organizers for delegation
  const availableOrganizers = organizers?.filter(
    org => org && org._id && org._id !== organizerId && !delegatedOrganizerIds.includes(org._id)
  ) || [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Organizer Settings & Controls
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* Success notification */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          Settings have been updated successfully!
        </Alert>
      </Snackbar>

      {/* Visibility Controls Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Visibility Controls
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={isVisible} 
                    onChange={(e) => {
                      // TIEMPO-254: Use centralized field change handler if available
                      if (onFieldChange) {
                        onFieldChange('isVisible', e.target.checked);
                      } else {
                        setIsVisible(e.target.checked);
                      }
                    }} 
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Profile Visible</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Others can see and select you as an organizer
                    </Typography>
                  </Box>
                }
                labelPlacement="end"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={isCrawlable} 
                    onChange={(e) => {
                      // TIEMPO-254: Use centralized field change handler if available
                      if (onFieldChange) {
                        onFieldChange('wantRender', e.target.checked);
                      } else {
                        setIsCrawlable(e.target.checked);
                      }
                    }} 
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Search Engine Visible</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Profile appears in search results
                    </Typography>
                  </Box>
                }
                labelPlacement="end"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>



      {/* Delegated Organizers Section */}
      <Card elevation={1} sx={{ mt: 3, p: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <GroupIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Delegated Organizers
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Allow other organizers to create events on your behalf
        </Typography>
        
        {/* Current delegates list */}
        {loadingDelegates ? (
          <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : delegatedOrganizers.length > 0 ? (
          <List dense sx={{ mb: 2 }}>
            {delegatedOrganizers.map((delegate) => delegate && (
              <ListItem key={delegate._id}>
                <ListItemText 
                  primary={delegate.fullName || 'Unknown'}
                  secondary={delegate.shortName}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleRemoveDelegate(delegate._id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No delegated organizers assigned
          </Typography>
        )}
        
        {/* Add delegate controls */}
        <Box display="flex" gap={2} alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200, flex: 1 }}>
            <InputLabel id="delegate-select-label">Select Organizer</InputLabel>
            <Select
              labelId="delegate-select-label"
              value={selectedDelegateId}
              onChange={(e) => setSelectedDelegateId(e.target.value)}
              label="Select Organizer"
            >
              {availableOrganizers.map((org) => (
                <MenuItem key={org._id} value={org._id}>
                  {org.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleAddDelegate}
            disabled={!selectedDelegateId}
          >
            Add
          </Button>
        </Box>
      </Card>

      {/* Info Box */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          These settings control your organizer account configuration. Changes to Profile Enabled 
          may require an app restart to take full effect.
        </Typography>
      </Box>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave} 
        disabled={isSaveDisabled}
        sx={{ mt: 3 }}
        fullWidth
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </Box>
  );
};

RegionalOrganizersSettings.propTypes = {
  organizerId: PropTypes.string.isRequired,
  organizer: PropTypes.shape({
    _id: PropTypes.string,
    isVisible: PropTypes.bool,
    wantRender: PropTypes.bool,
    delegatedOrganizerIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
  // TIEMPO-254: Optional centralized state management props
  onFieldChange: PropTypes.func,
  unsavedChanges: PropTypes.object,
  onSave: PropTypes.func,
  isSaving: PropTypes.bool,
};

export default RegionalOrganizersSettings;