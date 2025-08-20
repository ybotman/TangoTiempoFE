'use client';

import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import VenueMap from '../VenueGeocode/VenueMap';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

const VenueModalAdd = ({ onAdd, refreshList, onDone }) => {
  const { user } = useContext(AuthContext);
  
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
  const [overrideType, setOverrideType] = useState(null); // 'no-city' or 'proximity'

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
      console.log('Geocoding address:', addressString);
      const geocodeResponse = await axios.get(`${baseURL}/api/venues/geocode`, {
        params: { address: addressString }
      });

      if (geocodeResponse.data) {
        const geocodeData = geocodeResponse.data;
        console.log('Geocode result:', geocodeData);
        
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
        const proximityResponse = await axios.get(`${baseURL}/api/venues/check-proximity`, {
          params: {
            lat: geocodeData.latitude,
            lng: geocodeData.longitude,
            radius: 100 // yards
          }
        });
        
        if (proximityResponse.data?.hasNearbyVenues) {
          setNearbyVenues(proximityResponse.data.nearbyVenues);
          setProximityWarning(true);
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      
      if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to geocode address. Please check the address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (geocodeResult && (geocodeResult.masteredCityName || isOverriding)) {
      setStage(2);
    }
  };

  const handleOverride = () => {
    setIsOverriding(true);
    // Add override info to comments
    if (user) {
      // TIEMPO-246: Use ISO string without Date() for logging
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.000Z`;
      const overrideMessage = `[OVERRIDE] No nearest city found. Override authorized by ${user.email} (${user.displayName || 'Unknown'}) on ${timestamp}`;
      setVenueData(prev => ({
        ...prev,
        comments: prev.comments ? `${prev.comments}\n${overrideMessage}` : overrideMessage
      }));
    }
    setStage(2);
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
      
      console.log('Creating venue:', data);
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
              <Typography variant="subtitle1" gutterBottom>
                Venue Address
              </Typography>

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
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
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

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleGeocode}
                    disabled={!isAddressValid() || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      padding: '6px 12px',
                      minWidth: 'auto',
                      whiteSpace: 'pre-line',
                      textAlign: 'center'
                    }}
                  >
                    {loading ? 'Finding...' : 'Find\nStep 1'}
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleProceed}
                    disabled={!geocodeResult || (!geocodeResult.masteredCityName && !isOverriding)}
                    startIcon={<EditIcon />}
                    sx={{
                      fontSize: '0.75rem',
                      padding: '6px 12px',
                      minWidth: 'auto',
                      whiteSpace: 'pre-line',
                      textAlign: 'center'
                    }}
                  >
                    Details{'\n'}Step 2
                  </Button>

                  {geocodeResult && !geocodeResult.masteredCityName && !isOverriding && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleOverride}
                      startIcon={<WarningIcon />}
                    >
                      Override
                    </Button>
                  )}
                </Box>

                <Button variant="outlined" onClick={onDone} sx={{ alignSelf: 'flex-start' }}>
                  Cancel
                </Button>
              </Box>

              
              {/* Nearby Venues Warning */}
              {proximityWarning && nearbyVenues.length > 0 && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="warning.dark">
                      Venues within 100 yards:
                    </Typography>
                  </Box>
                  <List dense>
                    {nearbyVenues.map((venue, index) => (
                      <React.Fragment key={venue._id}>
                        <ListItem>
                          <ListItemText
                            primary={venue.name}
                            secondary={`${venue.address} (${Math.round(venue.distance)} yards away)`}
                          />
                        </ListItem>
                        {index < nearbyVenues.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
                    You can still proceed if this is a different venue.
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
              <Typography variant="subtitle1" gutterBottom>
                Location Preview
              </Typography>

              {geocodeResult && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {geocodeResult.formattedAddress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lat: {geocodeResult.latitude.toFixed(5)}, Long: {geocodeResult.longitude.toFixed(5)}
                  </Typography>
                  {geocodeResult.masteredCityName && (
                    <Chip
                      icon={<LocationOnIcon />}
                      label={`Nearest mastered city: ${geocodeResult.masteredCityName}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {geocodeResult.confidence < 0.5 && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      Please verify the location on the map
                    </Typography>
                  )}
                </Box>
              )}

              {geocodeResult ? (
                <VenueMap
                  latitude={geocodeResult.latitude}
                  longitude={geocodeResult.longitude}
                  venueName="New Venue"
                  address={geocodeResult.formattedAddress}
                />
              ) : (
                <Box
                  sx={{
                    height: 350,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Enter address and click Find Location to see map
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // Stage 2: Venue Details
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Venue Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue Name"
                value={venueData.name}
                onChange={handleVenueDataChange('name')}
                required
                margin="normal"
                autoFocus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Short Name"
                value={venueData.shortName}
                onChange={handleVenueDataChange('shortName')}
                required
                margin="normal"
                inputProps={{ maxLength: 15 }}
                helperText="Max 15 characters, auto-uppercase"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={venueData.phone}
                onChange={handleVenueDataChange('phone')}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={venueData.description}
                onChange={handleVenueDataChange('description')}
                required
                multiline
                rows={3}
                margin="normal"
                helperText="Required - Describe this venue"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments (Internal)"
                value={venueData.comments}
                onChange={handleVenueDataChange('comments')}
                multiline
                rows={2}
                margin="normal"
                helperText={isOverriding ? "Contains override authorization (read-only)" : "Optional internal notes"}
                InputProps={{
                  readOnly: isOverriding && venueData.comments.includes('[OVERRIDE]')
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Location Summary:
            </Typography>
            <Typography variant="body2">
              {addressData.address1}, {addressData.city}, {addressData.state} {addressData.zip}
            </Typography>
            {geocodeResult && (
              <Typography variant="body2" color="text.secondary">
                Lat: {geocodeResult.latitude.toFixed(5)}, Long: {geocodeResult.longitude.toFixed(5)}
              </Typography>
            )}
            {geocodeResult && geocodeResult.masteredCityName ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nearest City: {geocodeResult.masteredCityName}
                </Typography>
                {geocodeResult.masteredDivisionName && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Division: {geocodeResult.masteredDivisionName}
                  </Typography>
                )}
                {geocodeResult.masteredRegionName && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Region: {geocodeResult.masteredRegionName}
                  </Typography>
                )}
                {geocodeResult.masteredCountryName && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Country: {geocodeResult.masteredCountryName}
                  </Typography>
                )}
                {geocodeResult.confidence && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Confidence: {(geocodeResult.confidence * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>
            ) : geocodeResult && isOverriding ? (
              <Typography variant="body2" color="warning.main">
                No nearest city found - Override authorized
              </Typography>
            ) : geocodeResult ? (
              <Typography variant="body2" color="warning.main">
                No nearest city found
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setStage(1)}
            >
              Back to Address
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={!isVenueDataValid() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Saving...' : 'Save Venue'}
            </Button>

            <Button variant="outlined" onClick={onDone}>
              Cancel
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

VenueModalAdd.propTypes = {
  onAdd: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalAdd;