// @/components/Modals/Venues/VenueModalEdit.js
'use client';

import React, { useState, useEffect } from 'react';
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
import VenueMap from '../VenueGeocode/VenueMap';
import axios from 'axios';

const VenueModalEdit = ({ venue, onUpdate, refreshList, onDone }) => {
  const [venueData, setVenueData] = useState({
    name: '',
    shortName: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    comments: '',
    description: ''
  });

  const [geocodeResult, setGeocodeResult] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proximityWarning, setProximityWarning] = useState(false);

  useEffect(() => {
    if (venue) {
      setVenueData({
        name: venue.name || '',
        shortName: venue.shortName || '',
        address1: venue.address1 || '',
        address2: venue.address2 || '',
        address3: venue.address3 || '',
        city: venue.city || '',
        state: venue.state || '',
        zip: venue.zip || '',
        phone: venue.phone || '',
        comments: venue.comments || '',
        description: venue.description || ''
      });

      // If venue already has coordinates, set them as geocode result
      if (venue.latitude && venue.longitude) {
        setGeocodeResult({
          latitude: venue.latitude,
          longitude: venue.longitude,
          confidence: 1,
          formattedAddress: [venue.address1, venue.city, venue.state, venue.zip].filter(Boolean).join(', '),
          masteredCityId: venue.masteredCityId?._id,
          masteredCityName: venue.masteredCityId?.cityName,
          masteredDivisionId: venue.masteredDivisionId,
          masteredRegionId: venue.masteredRegionId,
          masteredCountryId: venue.masteredCountryId
        });
      }
    }
  }, [venue]);

  if (!venue) {
    return <Typography>No venue selected.</Typography>;
  }

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    // Auto-uppercase shortName and limit to 15 characters
    if (field === 'shortName') {
      value = value.toUpperCase().slice(0, 15);
    }
    
    setVenueData({
      ...venueData,
      [field]: value
    });
    
    // Clear geocode result when address changes
    if (['address1', 'address2', 'address3', 'city', 'state', 'zip'].includes(field)) {
      setGeocodeResult(null);
      setNearbyVenues([]);
      setProximityWarning(false);
    }
  };

  const isFormValid = () => {
    return (
      venueData.name &&
      venueData.shortName &&
      venueData.description &&
      venueData.address1 &&
      venueData.city &&
      venueData.state &&
      venueData.zip
    );
  };

  const buildAddressString = () => {
    const parts = [
      venueData.address1,
      venueData.address2,
      venueData.address3,
      venueData.city,
      venueData.state,
      venueData.zip
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleGeocode = async () => {
    if (!venueData.address1 || !venueData.city) {
      setError('Please fill in at least Address 1 and City');
      return;
    }

    setLoading(true);
    setError(null);
    setNearbyVenues([]);
    setProximityWarning(false);

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
        
        // Step 2: Check for nearby venues (excluding current venue)
        const proximityResponse = await axios.get(`${baseURL}/api/venues/check-proximity`, {
          params: {
            lat: geocodeData.latitude,
            lng: geocodeData.longitude,
            radius: 100 // yards
          }
        });
        
        if (proximityResponse.data?.hasNearbyVenues) {
          // Filter out the current venue from nearby venues
          const otherVenues = proximityResponse.data.nearbyVenues.filter(v => v._id !== venue._id);
          if (otherVenues.length > 0) {
            setNearbyVenues(otherVenues);
            setProximityWarning(true);
          }
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

  const handleSave = async () => {
    if (!geocodeResult) {
      setError('Please geocode the address first');
      return;
    }

    if (!isFormValid()) {
      setError('Please fill in all required fields (Name, Short Name, Description, and Address)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        name: venueData.name.trim(),
        shortName: venueData.shortName.trim(),
        description: venueData.description.trim(),
        address1: venueData.address1.trim(),
        address2: venueData.address2.trim(),
        address3: venueData.address3.trim(),
        city: venueData.city.trim(),
        state: venueData.state.trim(),
        zip: venueData.zip.trim(),
        phone: venueData.phone.trim(),
        comments: venueData.comments.trim(),
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        masteredCityId: geocodeResult.masteredCityId,
        masteredDivisionId: geocodeResult.masteredDivisionId,
        masteredRegionId: geocodeResult.masteredRegionId,
        masteredCountryId: geocodeResult.masteredCountryId
      };
      
      console.log('Updating venue:', updateData);
      await onUpdate(venue._id, updateData);
      
      refreshList();
      onDone();
    } catch (err) {
      console.error('Save error:', err);
      
      if (err.response?.status === 409) {
        setError('Another venue already exists within 100 yards of this location');
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
        Edit Venue
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Venue Information
            </Typography>

            <TextField
              fullWidth
              label="Venue Name"
              value={venueData.name}
              onChange={handleInputChange('name')}
              required
              margin="normal"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Short Name"
                  value={venueData.shortName}
                  onChange={handleInputChange('shortName')}
                  required
                  margin="normal"
                  inputProps={{ maxLength: 15 }}
                  helperText="Max 15 characters, auto-uppercase"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={venueData.phone}
                  onChange={handleInputChange('phone')}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Description"
              value={venueData.description}
              onChange={handleInputChange('description')}
              required
              multiline
              rows={2}
              margin="normal"
              helperText="Required for save"
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Address Information
            </Typography>

            <TextField
              fullWidth
              label="Address 1"
              value={venueData.address1}
              onChange={handleInputChange('address1')}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="Address 2"
              value={venueData.address2}
              onChange={handleInputChange('address2')}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Address 3"
              value={venueData.address3}
              onChange={handleInputChange('address3')}
              margin="normal"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={venueData.city}
                  onChange={handleInputChange('city')}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={venueData.state}
                  onChange={handleInputChange('state')}
                  required
                  margin="normal"
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="ZIP"
                  value={venueData.zip}
                  onChange={handleInputChange('zip')}
                  required
                  margin="normal"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Comments"
              value={venueData.comments}
              onChange={handleInputChange('comments')}
              multiline
              rows={2}
              margin="normal"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleGeocode}
                disabled={!venueData.address1 || !venueData.city || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
              >
                {loading ? 'Geocoding...' : 'Geocode'}
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                disabled={!geocodeResult || !isFormValid()}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>

              <Button variant="outlined" onClick={onDone}>
                Cancel
              </Button>
            </Box>
            
            {/* Nearby Venues Warning */}
            {proximityWarning && nearbyVenues.length > 0 && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="warning.dark">
                    Other venues within 100 yards:
                  </Typography>
                </Box>
                <List dense>
                  {nearbyVenues.map((nearbyVenue, index) => (
                    <React.Fragment key={nearbyVenue._id}>
                      <ListItem>
                        <ListItemText
                          primary={nearbyVenue.name}
                          secondary={`${nearbyVenue.address} (${Math.round(nearbyVenue.distance)} yards away)`}
                        />
                      </ListItem>
                      {index < nearbyVenues.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
                  You can still save if this is a different venue at the same location.
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>

        {/* Map Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', minHeight: 600 }}>
            <Typography variant="subtitle1" gutterBottom>
              Location Preview
            </Typography>

            {geocodeResult && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {geocodeResult.formattedAddress}
                </Typography>
                {geocodeResult.masteredCityName && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={<LocationOnIcon />}
                      label={`Nearest mastered city: ${geocodeResult.masteredCityName}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {geocodeResult.confidence < 0.5 && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                        Please verify the location on the map before saving
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {geocodeResult ? (
              <VenueMap
                latitude={geocodeResult.latitude}
                longitude={geocodeResult.longitude}
                venueName={venueData.name}
                address={geocodeResult.formattedAddress}
              />
            ) : (
              <Box
                sx={{
                  height: 450,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Enter address and click Geocode to see location
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

VenueModalEdit.propTypes = {
  venue: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    shortName: PropTypes.string,
    description: PropTypes.string,
    address1: PropTypes.string,
    address2: PropTypes.string,
    address3: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip: PropTypes.string,
    phone: PropTypes.string,
    comments: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    active: PropTypes.bool,
    masteredCityId: PropTypes.shape({
      _id: PropTypes.string,
      cityName: PropTypes.string,
    }),
    masteredDivisionId: PropTypes.string,
    masteredRegionId: PropTypes.string,
    masteredCountryId: PropTypes.string
  }),
  onUpdate: PropTypes.func.isRequired,
  refreshList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default VenueModalEdit;