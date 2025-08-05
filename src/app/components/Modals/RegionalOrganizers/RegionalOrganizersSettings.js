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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import GroupIcon from '@mui/icons-material/Group';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useMasteredCities } from '@/hooks/useMasteredCities';
import { useOrganizers } from '@/hooks/useOrganizers';
import axios from 'axios';

const RegionalOrganizersSettings = ({ organizerId, organizer, updateOrganizer }) => {
  const { user } = useContext(AuthContext);
  const { userData, updateUserData } = useUsers();
  const [includeInactive, setIncludeInactive] = useState(false);
  const { masteredCities, loading: citiesLoading } = useMasteredCities(includeInactive);
  const { organizers } = useOrganizers();
  
  // State for editable fields
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isCrawlable, setIsCrawlable] = useState(false);
  const [delegatedOrganizerIds, setDelegatedOrganizerIds] = useState([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState('');
  
  // Initial values for comparison
  const [initialSelectedCityIds, setInitialSelectedCityIds] = useState([]);
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
    if (organizer) {
      setIsVisible(organizer.isVisible !== false); // Default true
      setInitialIsVisible(organizer.isVisible !== false);
      setIsCrawlable(organizer.wantRender || false);
      setInitialIsCrawlable(organizer.wantRender || false);
      setDelegatedOrganizerIds(organizer.delegatedOrganizerIds || []);
      setInitialDelegatedOrganizerIds(organizer.delegatedOrganizerIds || []);
    }
  }, [userData, roInfo.allowedMasteredCityIds, organizer]);
  
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

  const isSaveDisabled = 
    (JSON.stringify(selectedCityIds) === JSON.stringify(initialSelectedCityIds) &&
    isVisible === initialIsVisible &&
    isCrawlable === initialIsCrawlable &&
    JSON.stringify(delegatedOrganizerIds) === JSON.stringify(initialDelegatedOrganizerIds)) ||
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
      // Update userLogins collection
      const updatedRegionalInfo = {
        ...roInfo,
        allowedMasteredCityIds: selectedCityIds
      };
      
      await updateUserData({
        regionalOrganizerInfo: updatedRegionalInfo
      });
      
      // Update organizers collection
      await updateOrganizer(organizerId, {
        isVisible,
        wantRender: isCrawlable,
        delegatedOrganizerIds
      });
      
      // Update initial values
      setInitialSelectedCityIds(selectedCityIds);
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

  // Get city object by ID
  const getCityById = (cityId) => {
    return masteredCities.find(city => city._id === cityId);
  };
  
  // Handle delegated organizer management
  const handleAddDelegate = () => {
    if (selectedDelegateId && !delegatedOrganizerIds.includes(selectedDelegateId)) {
      setDelegatedOrganizerIds([...delegatedOrganizerIds, selectedDelegateId]);
      setSelectedDelegateId('');
    }
  };
  
  const handleRemoveDelegate = (delegateId) => {
    setDelegatedOrganizerIds(delegatedOrganizerIds.filter(id => id !== delegateId));
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
                    onChange={(e) => setIsVisible(e.target.checked)} 
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
                    onChange={(e) => setIsCrawlable(e.target.checked)} 
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


      {/* City Selection */}
      <Card elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center">
            <LocationCityIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              City Selection
            </Typography>
          </Box>
          {/* Active/Inactive Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label="Show inactive cities"
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
};

export default RegionalOrganizersSettings;