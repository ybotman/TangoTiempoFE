// @/components/Modals/Venues/VenueModalMap.js
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, MenuItem } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const VenueModalMap = ({ venues }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [cities, setCities] = useState([]);
  const [cityFilter, setCityFilter] = useState('');

  const fetchCities = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/masteredLocations/activeCities`);
      setCities(response.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [37.0902, -95.7129],
        zoom: 4,
      });
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
        {
          maxZoom: 18,
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    let filteredVenues = venues;
    if (cityFilter) {
      filteredVenues = venues.filter((v) => v.masteredCityId?.['_id'] === cityFilter);
    }

    filteredVenues.forEach((v) => {
      if (v.latitude && v.longitude) {
        L.marker([v.latitude, v.longitude]).addTo(map).bindPopup(`${v.name} (${v.shortName})`);
      }
    });
  }, [venues, cityFilter]);

  return (
    <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Venues Map
      </Typography>
      <TextField
        select
        label="Filter by Calculated City"
        value={cityFilter}
        onChange={(e) => setCityFilter(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="">All Cities</MenuItem>
        {cities.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.cityName}
          </MenuItem>
        ))}
      </TextField>
      <Box ref={mapRef} sx={{ flexGrow: 1 }} />
    </Box>
  );
};

VenueModalMap.propTypes = {
  venues: PropTypes.array.isRequired,
};

export default VenueModalMap;
