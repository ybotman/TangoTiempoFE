'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Grid,
  Button,
  TextField,
  Typography,
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
import ModalHeader from '../../UI/ModalHeader';
import modalStyle from '../../Styles/modalStyles';
import VenueMap from './VenueMap';
import axios from 'axios';

const VenueGeocodeModal = ({ open, onClose }) => {
  const [venueData, setVenueData] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: ''
  });

  const [geocodeResult, setGeocodeResult] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proximityWarning, setProximityWarning] = useState(false);

  const handleInputChange = (field) => (event) => {
    setVenueData({
      ...venueData,
      [field]: event.target.value
    });
    // Clear geocode result when address changes
    if (['address1', 'address2', 'city', 'state', 'zip'].includes(field)) {
      setGeocodeResult(null);
    }
  };

  const isFormValid = () => {
    return (
      venueData.name &&
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
      venueData.city,
      venueData.state,
      venueData.zip
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleGeocode = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
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
// TIEMPO-276: Security cleanup - removed logging
      const geocodeResponse = await axios.get(`${baseURL}/api/venues/geocode`, {
        params: { address: addressString }
      });

      if (geocodeResponse.data) {
        const geocodeData = geocodeResponse.data;
// TIEMPO-276: Security cleanup - removed logging
        
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
      console.error('Error response:', err.response?.data);
      
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

    setLoading(true);
    setError(null);

    try {
      const baseURL = process.env.NEXT_PUBLIC_BE_URL;
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
      
      const payload = {
        ...venueData,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        masteredCityId: geocodeResult.masteredCityId,
        masteredDivisionId: geocodeResult.masteredDivisionId,
        masteredRegionId: geocodeResult.masteredRegionId,
        masteredCountryId: geocodeResult.masteredCountryId,
        appId
      };
      
// TIEMPO-276: Security cleanup - removed logging
      const response = await axios.post(`${baseURL}/api/venues`, payload);
      
      if (response.data) {
// TIEMPO-276: Security cleanup - removed logging
        // TODO: Show success message and close modal
        handleClose();
      }
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

  const handleClose = () => {
    setVenueData({
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: ''
    });
    setGeocodeResult(null);
    setError(null);
    setNearbyVenues([]);
    setProximityWarning(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="venue-geocode-modal"
    >
      <Box sx={modalStyle()}>
        <ModalHeader
          title="Venue Geocoding"
          onClose={handleClose}
        />

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
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

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleGeocode}
                    disabled={!isFormValid() || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
                  >
                    {loading ? 'Geocoding...' : 'Geocode'}
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={!geocodeResult}
                    startIcon={<SaveIcon />}
                  >
                    Save
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
                  </Paper>
                )}
              </Paper>
            </Grid>

            {/* Map Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
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
                      height: 350,
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
      </Box>
    </Modal>
  );
};

VenueGeocodeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default VenueGeocodeModal;