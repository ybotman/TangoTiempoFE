'use client';

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VenueMap from '../VenueGeocode/VenueMap';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { searchVenues } from '@/utils/geoLocations';
import debounce from 'lodash/debounce';

const VenueModalAddWithSearch = ({ onAdd, refreshList, onDone }) => {
  const { user } = useContext(AuthContext);

  // Entry mode: 'search' or 'manual'
  const [entryMode, setEntryMode] = useState('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // Stage 1: Address collection
  const [addressData, setAddressData] = useState({
    address1: '',
    address2: '',
    address3: '',
    city: '',
    state: '',
    zip: ''
  });

  // Stage 2: Additional venue details
  const [venueData, setVenueData] = useState({
    name: '',
    shortName: '',
    description: '',
    phone: '',
    comments: ''
  });

  const [geocodeResult, setGeocodeResult] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proximityWarning, setProximityWarning] = useState(false);
  const [stage, setStage] = useState(1); // 1 = address, 2 = details
  const [isOverriding, setIsOverriding] = useState(false);
  const [, setOverrideType] = useState(null); // 'no-city' or 'proximity'

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSearchOptions([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await searchVenues(query, {
          limit: 8,
          types: 'poi,address'
        });
        setSearchOptions(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchOptions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchInputChange = (event, newInputValue) => {
    setSearchQuery(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleVenueSelect = (event, newValue) => {
    if (!newValue) {
      // Clear selection
      setSelectedVenue(null);
      setAddressData({
        address1: '',
        address2: '',
        address3: '',
        city: '',
        state: '',
        zip: ''
      });
      setVenueData(prev => ({
        ...prev,
        name: '',
        shortName: ''
      }));
      setGeocodeResult(null);
      return;
    }

    setSelectedVenue(newValue);

    // Populate address fields from search result
    setAddressData({
      address1: newValue.address1 || '',
      address2: newValue.address2 || '',
      address3: newValue.address3 || '',
      city: newValue.city || '',
      state: newValue.state || '',
      zip: newValue.zip || ''
    });

    // Pre-populate venue name if it's a POI
    if (newValue.placeType === 'poi' && newValue.name) {
      setVenueData(prev => ({
        ...prev,
        name: newValue.name,
        shortName: newValue.name.toUpperCase().slice(0, 15)
      }));
    }

    // Set geocode result immediately since we have coordinates
    setGeocodeResult({
      latitude: newValue.latitude,
      longitude: newValue.longitude,
      confidence: 1.0,
      formattedAddress: newValue.fullAddress
    });
  };

  const handleEntryModeChange = (event, newMode) => {
    if (newMode !== null) {
      setEntryMode(newMode);
      // Clear search when switching to manual
      if (newMode === 'manual') {
        setSearchQuery('');
        setSearchOptions([]);
        setSelectedVenue(null);
      }
      // Clear manual entries when switching to search
      if (newMode === 'search') {
        setAddressData({
          address1: '',
          address2: '',
          address3: '',
          city: '',
          state: '',
          zip: ''
        });
        setGeocodeResult(null);
      }
    }
  };

  const handleAddressChange = (field) => (event) => {
    setAddressData({
      ...addressData,
      [field]: event.target.value
    });
    // Reset geocode when address changes
    setGeocodeResult(null);
    setNearbyVenues([]);
    setProximityWarning(false);
    setIsOverriding(false);
    setOverrideType(null);
  };

  const handleVenueDataChange = (field) => (event) => {
    let value = event.target.value;

    // Auto-uppercase shortName and limit to 15 characters
    if (field === 'shortName') {
      value = value.toUpperCase().slice(0, 15);
    }

    setVenueData({
      ...venueData,
      [field]: value
    });
  };

  const isAddressValid = () => {
    return addressData.address1 && addressData.city && addressData.state && addressData.zip;
  };

  const isVenueDataValid = () => {
    return venueData.name && venueData.shortName && venueData.description;
  };

  const buildAddressString = () => {
    const parts = [
      addressData.address1,
      addressData.address2,
      addressData.address3,
      addressData.city,
      addressData.state,
      addressData.zip
    ].filter(Boolean);

    return parts.join(', ');
  };

  const handleGeocode = async () => {
    if (entryMode === 'search' && selectedVenue && geocodeResult) {
      // Already have coordinates from search, check for nearby venues
      setLoading(true);
      try {
        const baseURL = process.env.NEXT_PUBLIC_BE_URL;
        const nearbyResponse = await axios.post(`${baseURL}/api/venues/check-proximity`, {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude
        });

        if (nearbyResponse.data?.nearbyVenues?.length > 0) {
          setNearbyVenues(nearbyResponse.data.nearbyVenues);
          setProximityWarning(true);
        } else {
          // No nearby venues, proceed to stage 2
          setStage(2);
        }
      } catch (err) {
        console.error('Proximity check error:', err);
        // Proceed anyway if proximity check fails
        setStage(2);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isAddressValid()) {
      setError('Please fill in all required address fields');
      return;
    }

    setLoading(true);
    setError(null);
    setNearbyVenues([]);
    setProximityWarning(false);
    setIsOverriding(false);
    setOverrideType(null);

    try {
      const baseURL = process.env.NEXT_PUBLIC_BE_URL;
      const addressString = buildAddressString();

      // Step 1: Geocode the address
      const geocodeResponse = await axios.get(`${baseURL}/api/venues/geocode`, {
        params: { address: addressString }
      });

      if (geocodeResponse.data) {
        const geocodeData = geocodeResponse.data;

        setGeocodeResult({
          latitude: geocodeData.latitude,
          longitude: geocodeData.longitude,
          confidence: geocodeData.confidence,
          formattedAddress: geocodeData.formattedAddress || addressString,
          masteredCityId: geocodeData.masteredCityId,
          masteredCityName: geocodeData.masteredCityName,
          masteredDivisionId: geocodeData.masteredDivisionId,
          masteredDivisionName: geocodeData.masteredDivisionName,
          masteredRegionId: geocodeData.masteredRegionId,
          masteredRegionName: geocodeData.masteredRegionName,
          masteredCountryId: geocodeData.masteredCountryId,
          masteredCountryName: geocodeData.masteredCountryName
        });

        // Step 2: Check for nearby venues
        const nearbyResponse = await axios.post(`${baseURL}/api/venues/check-proximity`, {
          latitude: geocodeData.latitude,
          longitude: geocodeData.longitude
        });

        if (nearbyResponse.data?.nearbyVenues?.length > 0) {
          setNearbyVenues(nearbyResponse.data.nearbyVenues);
          setProximityWarning(true);
        } else {
          // No issues, proceed to stage 2
          setStage(2);
        }
      } else {
        setError('Unable to geocode this address. Please check the address and try again.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(err.response?.data?.message || 'Failed to geocode address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideProximity = () => {
    setIsOverriding(true);
    setOverrideType('proximity');
    setProximityWarning(false);
    setStage(2);
  };

  const handleEditAddress = () => {
    setGeocodeResult(null);
    setProximityWarning(false);
    setNearbyVenues([]);
  };

  const handleSave = async () => {
    if (!isVenueDataValid()) {
      setError('Please fill in all required fields (Name, Short Name, and Description)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        name: venueData.name.trim(),
        shortName: venueData.shortName.trim(),
        description: venueData.description.trim(),
        address1: addressData.address1.trim(),
        address2: addressData.address2.trim(),
        address3: addressData.address3.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        zip: addressData.zip.trim(),
        phone: venueData.phone.trim(),
        comments: venueData.comments.trim(),
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        masteredCityId: geocodeResult.masteredCityId,
        masteredDivisionId: geocodeResult.masteredDivisionId,
        masteredRegionId: geocodeResult.masteredRegionId,
        masteredCountryId: geocodeResult.masteredCountryId
      };

      await onAdd(data);

      refreshList();
      onDone();
    } catch (err) {
      console.error('Save error:', err);

      if (err.response?.status === 409) {
        setError('A venue already exists within 100 yards of this location');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save venue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Venue - {stage === 1 ? 'Step 1: Location' : 'Step 2: Details'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {stage === 1 ? (
        // Stage 1: Address and Geocoding
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">
                  Venue Location
                </Typography>
                <ToggleButtonGroup
                  value={entryMode}
                  exclusive
                  onChange={handleEntryModeChange}
                  size="small"
                >
                  <ToggleButton value="search">
                    <SearchIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Search
                  </ToggleButton>
                  <ToggleButton value="manual">
                    <KeyboardIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Manual
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {entryMode === 'search' ? (
                <>
                  <Autocomplete
                    fullWidth
                    value={selectedVenue}
                    onChange={handleVenueSelect}
                    inputValue={searchQuery}
                    onInputChange={handleSearchInputChange}
                    options={searchOptions}
                    getOptionLabel={(option) => option.fullAddress || ''}
                    loading={searchLoading}
                    loadingText="Searching..."
                    noOptionsText={searchQuery.length < 3 ? "Type at least 3 characters" : "No venues found"}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search for venue or address"
                        placeholder="Start typing venue name or address..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          endAdornment: (
                            <>
                              {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <ListItem {...props}>
                        <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText
                          primary={option.name}
                          secondary={option.fullAddress}
                        />
                      </ListItem>
                    )}
                  />

                  {selectedVenue && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Location:
                      </Typography>
                      <Typography variant="body2">
                        {selectedVenue.fullAddress}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip size="small" label={`${selectedVenue.city}, ${selectedVenue.state}`} />
                        {selectedVenue.zip && <Chip size="small" label={selectedVenue.zip} />}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Address 1"
                    value={addressData.address1}
                    onChange={handleAddressChange('address1')}
                    required
                    margin="normal"
                    autoFocus
                  />

                  <TextField
                    fullWidth
                    label="Address 2"
                    value={addressData.address2}
                    onChange={handleAddressChange('address2')}
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    label="Address 3"
                    value={addressData.address3}
                    onChange={handleAddressChange('address3')}
                    margin="normal"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={addressData.city}
                        onChange={handleAddressChange('city')}
                        required
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="State"
                        value={addressData.state}
                        onChange={handleAddressChange('state')}
                        required
                        margin="normal"
                        inputProps={{ maxLength: 2 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="ZIP"
                        value={addressData.zip}
                        onChange={handleAddressChange('zip')}
                        required
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGeocode}
                  disabled={loading || (entryMode === 'search' ? !selectedVenue : !isAddressValid())}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
                >
                  {loading ? 'Validating...' : 'Validate Location'}
                </Button>
                {geocodeResult && (
                  <Tooltip title="Edit address">
                    <IconButton onClick={handleEditAddress}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            {geocodeResult && (
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Location Preview
                </Typography>
                <VenueMap
                  latitude={geocodeResult.latitude}
                  longitude={geocodeResult.longitude}
                  name="New Venue"
                  height={300}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates: {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
                  </Typography>
                  {geocodeResult.confidence && (
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {(geocodeResult.confidence * 100).toFixed(0)}%
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      ) : (
        // Stage 2: Venue Details
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Venue Information
              </Typography>

              <TextField
                fullWidth
                label="Venue Name"
                value={venueData.name}
                onChange={handleVenueDataChange('name')}
                required
                margin="normal"
                autoFocus
                helperText="The full name of the venue"
              />

              <TextField
                fullWidth
                label="Short Name"
                value={venueData.shortName}
                onChange={handleVenueDataChange('shortName')}
                required
                margin="normal"
                inputProps={{ maxLength: 15 }}
                helperText={`${venueData.shortName.length}/15 characters (auto-uppercase)`}
              />

              <TextField
                fullWidth
                label="Description"
                value={venueData.description}
                onChange={handleVenueDataChange('description')}
                required
                multiline
                rows={3}
                margin="normal"
                helperText="Brief description of the venue"
              />

              <TextField
                fullWidth
                label="Phone"
                value={venueData.phone}
                onChange={handleVenueDataChange('phone')}
                margin="normal"
                type="tel"
              />

              <TextField
                fullWidth
                label="Internal Comments"
                value={venueData.comments}
                onChange={handleVenueDataChange('comments')}
                multiline
                rows={2}
                margin="normal"
                helperText="Internal notes (not visible to public)"
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setStage(1)}
                >
                  Back to Location
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading || !isVenueDataValid()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  color="success"
                >
                  {loading ? 'Saving...' : 'Save Venue'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Location Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Address"
                    secondary={[
                      addressData.address1,
                      addressData.address2,
                      addressData.address3,
                      `${addressData.city}, ${addressData.state} ${addressData.zip}`
                    ].filter(Boolean).join(', ')}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Coordinates"
                    secondary={`${geocodeResult.latitude.toFixed(6)}, ${geocodeResult.longitude.toFixed(6)}`}
                  />
                </ListItem>
                {geocodeResult.masteredCityName && (
                  <>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Region"
                        secondary={`${geocodeResult.masteredCityName}, ${geocodeResult.masteredDivisionName || geocodeResult.masteredRegionName}`}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Proximity Warning Dialog */}
      {proximityWarning && nearbyVenues.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, border: '2px solid', borderColor: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="warning.main">
              Nearby Venues Detected
            </Typography>
          </Box>
          <Typography variant="body2" gutterBottom>
            The following venues are within 100 yards of this location:
          </Typography>
          <List dense>
            {nearbyVenues.map((venue, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={venue.name}
                  secondary={`${venue.address1}, ${venue.city}, ${venue.state} (${venue.distanceInYards} yards)`}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleEditAddress}
            >
              Edit Address
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleOverrideProximity}
            >
              Continue Anyway
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

VenueModalAddWithSearch.propTypes = {
  onAdd: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired
};

export default VenueModalAddWithSearch;