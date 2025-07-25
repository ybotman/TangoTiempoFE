// app/components/UI/RegionMenu.js

'use client';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import axios from 'axios';

const RegionMenu = ({ onClose }) => {
  const { selectLocation } = useGeoLocation();
  const [selectionLevel, setSelectionLevel] = useState(1);
  const [regions, setRegions] = useState([]);
  const [localSelectedRegion, setLocalSelectedRegion] = useState(null);
  const [localSelectedDivision, setLocalSelectedDivision] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch regions data on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`, {
          params: { appId }
        });
        setRegions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
        setRegions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleBack = () => {
    if (selectionLevel === 2) {
      setSelectionLevel(1);
      setLocalSelectedRegion(null);
    } else if (selectionLevel === 3) {
      setSelectionLevel(2);
      setLocalSelectedDivision(null);
    }
  };

  const handleRegionClick = (region) => {
    console.log('Region Selected:', region);
    setLocalSelectedRegion(region);
    setSelectionLevel(2);
  };

  const handleDivisionClick = (division) => {
    console.log('Division Selected:', division);
    setLocalSelectedDivision(division);
    setSelectionLevel(3);
  };

  const handleCityClick = (city) => {
    console.log('City Selected:', city);
    
    // Update GeoLocationContext with the selected location
    selectLocation({
      country: {
        id: localSelectedRegion?.countryID || null,
        name: localSelectedRegion?.countryName || 'United States'
      },
      region: {
        id: localSelectedRegion?.regionID || localSelectedRegion?._id,
        name: localSelectedRegion?.regionName
      },
      division: {
        id: localSelectedDivision?.divisionID || localSelectedDivision?._id,
        name: localSelectedDivision?.divisionName
      },
      city: {
        id: city.cityID || city._id,
        name: city.cityName,
        latitude: city.latitude,
        longitude: city.longitude
      }
    });

    // Reset state and close
    setSelectionLevel(1);
    setLocalSelectedRegion(null);
    setLocalSelectedDivision(null);
    onClose();
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading regions...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
        {selectionLevel > 1 && (
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {selectionLevel === 1 && 'Select Region'}
          {selectionLevel === 2 && 'Select Division'}
          {selectionLevel === 3 && 'Select City'}
        </Typography>
      </Box>

      {/* List Items Based on Selection Level */}
      <List component="nav">
        {selectionLevel === 1 &&
          regions.map((region) => (
            <ListItem button="true" key={region.regionCode} onClick={() => handleRegionClick(region)}>
              <ListItemText primary={region.regionName} />
            </ListItem>
          ))}

        {selectionLevel === 2 &&
          localSelectedRegion?.divisions?.map((division) => (
            <ListItem button="true" key={division.divisionCode} onClick={() => handleDivisionClick(division)}>
              <ListItemText primary={division.divisionName} />
            </ListItem>
          ))}

        {selectionLevel === 3 &&
          localSelectedDivision?.majorCities?.map((city) => (
            <ListItem button="true" key={city.cityCode} onClick={() => handleCityClick(city)}>
              <ListItemText primary={city.cityName} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

RegionMenu.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default RegionMenu;