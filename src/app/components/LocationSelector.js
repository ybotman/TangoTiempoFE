'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';

const LocationSelector = ({ open, onClose }) => {
  const { selectLocation, fetchNearestCity } = useGeoLocation();
  const { regions, divisions, cities, fetchDivisions, fetchCities, loading } = useMasteredLocations();
  
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const handleRegionChange = async (event) => {
    const regionId = event.target.value;
    setSelectedRegion(regionId);
    setSelectedDivision('');
    setSelectedCity('');
    
    if (regionId) {
      await fetchDivisions(regionId);
    }
  };

  const handleDivisionChange = async (event) => {
    const divisionId = event.target.value;
    setSelectedDivision(divisionId);
    setSelectedCity('');
    
    if (divisionId) {
      await fetchCities(divisionId);
    }
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);
    
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const result = await fetchNearestCity(
                position.coords.latitude,
                position.coords.longitude
              );
              
              if (result && !result.isFallback) {
                // Location detected successfully
                onClose();
              } else {
                setError('Could not find a nearby city. Please select manually.');
              }
            } catch (err) {
              setError('Failed to find nearest city. Please select manually.');
            }
            setIsDetecting(false);
          },
          (err) => {
            setError('Location access denied. Please select manually.');
            setIsDetecting(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
        setIsDetecting(false);
      }
    } catch (err) {
      setError('Failed to detect location. Please select manually.');
      setIsDetecting(false);
    }
  };

  const handleConfirm = () => {
    if (selectedCity) {
      const city = cities.find(c => (c._id || c.cityID) === selectedCity);
      const division = divisions.find(d => (d._id || d.divisionID) === selectedDivision);
      const region = regions.find(r => (r._id || r.regionID) === selectedRegion);
      
      if (city && division && region) {
        selectLocation({
          country: { id: city.countryID || city.masteredCountryId, name: city.countryName || 'United States' },
          region: { id: region._id || region.regionID, name: region.regionName },
          division: { id: division._id || division.divisionID, name: division.divisionName },
          city: {
            id: city._id || city.cityID,
            name: city.cityName,
            latitude: city.latitude || city.location?.coordinates?.[1],
            longitude: city.longitude || city.location?.coordinates?.[0]
          }
        });
        onClose();
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {}} // Prevent closing by clicking outside
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Select Your Location</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Please select your location to view events in your area.
          </Alert>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={isDetecting ? <CircularProgress size={20} /> : <MyLocationIcon />}
              onClick={handleDetectLocation}
              disabled={isDetecting}
              fullWidth
            >
              {isDetecting ? 'Detecting Location...' : 'Use My Current Location'}
            </Button>
          </Box>
          
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            — OR —
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                onChange={handleRegionChange}
                label="Region"
                disabled={loading}
              >
                <MenuItem key="region-placeholder" value="">
                  <em>Select a region</em>
                </MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region._id || region.regionID} value={region._id || region.regionID}>
                    {region.regionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={!selectedRegion}>
              <InputLabel>Division</InputLabel>
              <Select
                value={selectedDivision}
                onChange={handleDivisionChange}
                label="Division"
                disabled={loading || !selectedRegion}
              >
                <MenuItem key="division-placeholder" value="">
                  <em>Select a division</em>
                </MenuItem>
                {divisions.map((division) => (
                  <MenuItem key={division._id || division.divisionID} value={division._id || division.divisionID}>
                    {division.divisionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={!selectedDivision}>
              <InputLabel>City</InputLabel>
              <Select
                value={selectedCity}
                onChange={handleCityChange}
                label="City"
                disabled={loading || !selectedDivision}
              >
                <MenuItem key="city-placeholder" value="">
                  <em>Select a city</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city._id || city.cityID} value={city._id || city.cityID}>
                    {city.cityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedCity}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LocationSelector.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default LocationSelector;