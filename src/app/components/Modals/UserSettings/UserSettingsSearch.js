// src/components/Modals/UserSettings/UserSettingsSearch.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Switch, 
  Paper,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { useEventDiscovery } from '@/contexts/EventDiscoveryContext';

const UserSettingsSearch = ({ userData, updateUserData, onSaveSuccess }) => {
  const { state, actions } = useEventDiscovery();
  
  // Initialize from saved user preferences or EventDiscoveryContext
  const getInitialSettings = () => {
    // First check user's saved preferences
    if (userData?.localUserInfo?.userDefaults?.searchSettings?.includeAiGenerated !== undefined) {
      return {
        includeAiGenerated: userData.localUserInfo.userDefaults.searchSettings.includeAiGenerated
      };
    }
    // Fall back to EventDiscoveryContext
    return {
      includeAiGenerated: state.filters.aiRecommendations || false
    };
  };

  const [localSettings, setLocalSettings] = useState(getInitialSettings);
  const [originalSettings, setOriginalSettings] = useState(getInitialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if settings have changed
  const hasChanges = localSettings.includeAiGenerated !== originalSettings.includeAiGenerated;

  // Initialize from user data when it loads
  useEffect(() => {
    if (userData?.localUserInfo?.userDefaults?.searchSettings) {
      const settings = {
        includeAiGenerated: userData.localUserInfo.userDefaults.searchSettings.includeAiGenerated || false
      };
      setLocalSettings(settings);
      setOriginalSettings(settings);
      
      // Also update EventDiscoveryContext to sync
      actions.setFilters({
        aiRecommendations: settings.includeAiGenerated
      });
    }
  }, [userData, actions]);

  const handleToggleAiGenerated = (event) => {
    const newValue = event.target.checked;
    setLocalSettings(prev => ({
      ...prev,
      includeAiGenerated: newValue
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Update EventDiscoveryContext filters
      actions.setFilters({
        aiRecommendations: localSettings.includeAiGenerated
      });

      // Also save to user preferences if we have updateUserData
      if (updateUserData && userData) {
        const updatedUserData = {
          ...userData,
          localUserInfo: {
            ...userData.localUserInfo,
            userDefaults: {
              ...userData.localUserInfo?.userDefaults,
              searchSettings: {
                includeAiGenerated: localSettings.includeAiGenerated
              }
            }
          }
        };

        await updateUserData(updatedUserData);
      }

      setSaveSuccess(true);
      
      // Update original settings to reflect saved state
      setOriginalSettings(localSettings);
      
      // Don't close immediately - let user see success message
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving search settings:', error);
      setSaveError('Failed to save search settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search Settings
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how events are discovered and displayed in your searches.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
          AI-Generated Events
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={localSettings.includeAiGenerated}
              onChange={handleToggleAiGenerated}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body1">
                Include AI-generated events in search results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Show events that have been automatically created or suggested by AI alongside regular events
              </Typography>
            </Box>
          }
          labelPlacement="end"
          sx={{ 
            alignItems: 'flex-start',
            '& .MuiSwitch-root': { 
              mt: 0.5 
            }
          }}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          These settings affect how events are filtered in both map and city list views.
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Search settings saved successfully!
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          sx={{ 
            minWidth: 120,
            opacity: !hasChanges ? 0.6 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

UserSettingsSearch.propTypes = {
  userData: PropTypes.object,
  updateUserData: PropTypes.func,
  onSaveSuccess: PropTypes.func,
};

export default UserSettingsSearch;