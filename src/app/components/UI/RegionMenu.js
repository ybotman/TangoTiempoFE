'use client'; // RegionMenu.js
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RegionsContext } from '@/contexts/RegionsContext';

const RegionMenu = ({ onRegionSelect, onClose }) => {
  const { regions, setSelectedRegion } = useContext(RegionsContext);
  const [selectionLevel, setSelectionLevel] = useState(1);
  const [localSelectedRegion, setLocalSelectedRegion] = useState(null);
  const [localSelectedDivision, setLocalSelectedDivision] = useState(null);

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
    setLocalSelectedRegion(region);
    setSelectedRegion(region.regionName);
    setSelectionLevel(2);
  };

  const handleDivisionClick = (division) => {
    setLocalSelectedDivision(division);
    setSelectedRegion(division.divisionName);
    setSelectionLevel(3);
  };

  const handleCityClick = (city) => {
    setSelectedRegion(city.cityName);
    onRegionSelect(city.cityCode);
    setSelectionLevel(1);
    setLocalSelectedRegion(null);
    setLocalSelectedDivision(null);
    onClose();
  };

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
            <ListItem
              button="true"
              key={region.regionCode}
              onClick={() => handleRegionClick(region)}
            >
              <ListItemText primary={region.regionName} />
            </ListItem>
          ))}

        {selectionLevel === 2 &&
          localSelectedRegion.divisions.map((division) => (
            <ListItem
              button
              key={division.divisionCode}
              onClick={() => handleDivisionClick(division)}
            >
              <ListItemText primary={division.divisionName} />
            </ListItem>
          ))}

        {selectionLevel === 3 &&
          localSelectedDivision.majorCities.map((city) => (
            <ListItem
              button
              key={city.cityCode}
              onClick={() => handleCityClick(city)}
            >
              <ListItemText primary={city.cityName} />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

RegionMenu.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onRegionSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegionMenu;
