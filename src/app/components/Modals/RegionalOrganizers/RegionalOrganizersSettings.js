'use client';

import React, { useState, useEffect, useContext } from 'react';
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
  Divider,
  TextField,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useMasteredCities } from '@/hooks/useMasteredCities';

const RegionalOrganizersSettings = ({ organizerId, organizer }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  const [includeInactive, setIncludeInactive] = useState(false);
  const { masteredCities, loading: citiesLoading } = useMasteredCities(includeInactive);
  
  // State for editable fields
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  
  // Initial values for comparison
  const [initialSelectedCityIds, setInitialSelectedCityIds] = useState([]);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get values from userLogins
  const roInfo = userData?.regionalOrganizerInfo || {};
  const email = userData?.email || 'Not available';
  const firebaseUserId = userData?.firebaseUserId || 'Not available';
  const isApproved = roInfo.isApproved || false;
  const isActive = roInfo.isActive || false;
  const approvalDate = roInfo.ApprovalDate ? new Date(roInfo.ApprovalDate).toLocaleDateString() : 'Not set';

  useEffect(() => {
    if (userData?.regionalOrganizerInfo) {
      setSelectedCityIds(roInfo.allowedMasteredCityIds || []);
      setInitialSelectedCityIds(roInfo.allowedMasteredCityIds || []);
    }
  }, [userData, roInfo.allowedMasteredCityIds]);

  const isSaveDisabled = 
    JSON.stringify(selectedCityIds) === JSON.stringify(initialSelectedCityIds) ||
    saving;

  const handleSnackbarClose = () => {
    setShowSuccessMessage(false);
  };

  const handleCityChange = (event) => {
    const value = event.target.value;
    // Limit to 4 cities
    if (value.length <= 4) {
      setSelectedCityIds(value);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccessMessage(false);
    setSaving(true);
    
    try {
      const updatedRegionalInfo = {
        ...roInfo,
        allowedMasteredCityIds: selectedCityIds
      };
      
      await updateUserData({
        regionalOrganizerInfo: updatedRegionalInfo
      });
      
      setInitialSelectedCityIds(selectedCityIds);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setErrorMessage('An error occurred while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  // Get city object by ID
  const getCityById = (cityId) => {
    return masteredCities.find(city => city._id === cityId);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Account Settings
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

      {/* Private Information Section */}
      <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <LockIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Private Information (Not shown to public)
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{email}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Firebase ID</Typography>
              <Typography variant="body1" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.85rem',
                wordBreak: 'break-all' 
              }}>
                {firebaseUserId}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Organizer ID</Typography>
              <Typography variant="body1" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.85rem' 
              }}>
                {organizerId || 'Not set'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Approval Date</Typography>
              <Typography variant="body1">{approvalDate}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Status Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            System Status
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body1">ROE Approved</Typography>
                <Chip 
                  label={isApproved ? "Yes" : "No"} 
                  color={isApproved ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body1">Account Active</Typography>
                <Chip 
                  label={isActive ? "Yes" : "No"} 
                  color={isActive ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Editable Settings Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Editable Settings
      </Typography>


      {/* City Selection */}
      <Card elevation={1} sx={{ p: 3 }}>
        {/* Active/Inactive Toggle */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                Show inactive cities
              </Typography>
            }
          />
        </Box>
        
        <FormControl fullWidth>
          <InputLabel id="city-select-label">Allowed Cities for Venues</InputLabel>
          <Select
            labelId="city-select-label"
            multiple
            value={selectedCityIds}
            onChange={handleCityChange}
            input={<OutlinedInput label="Allowed Cities for Venues" />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Select cities...</em>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const city = getCityById(value);
                    if (!city) return null;
                    // Show abbreviated version in the selection box
                    const shortName = city.cityName + (city.active ? '' : ' (inactive)');
                    return (
                      <Chip key={value} label={shortName} size="small" />
                    );
                  })}
                </Box>
              );
            }}
            disabled={citiesLoading}
          >
            {masteredCities.map((city) => (
              <MenuItem 
                key={city._id} 
                value={city._id}
                sx={{
                  fontSize: '0.875rem',
                  color: city.active ? 'text.primary' : 'text.disabled'
                }}
              >
                {city.displayName}
                {!city.active && (
                  <Typography 
                    component="span" 
                    variant="caption" 
                    sx={{ ml: 1, color: 'text.disabled' }}
                  >
                    (inactive)
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select up to 4 cities where you can choose venues when creating events.
            {masteredCities.length > 0 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Format: Country - Region - Division - City
              </Typography>
            )}
          </FormHelperText>
        </FormControl>
        
        {selectedCityIds.length === 4 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Maximum of 4 cities reached
          </Alert>
        )}
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
  }).isRequired,
};

export default RegionalOrganizersSettings;