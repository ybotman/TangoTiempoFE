'use client';

import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Box, Typography, TextField, MenuItem } from '@mui/material';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet without SSR
const L = dynamic(() => import('leaflet'), { ssr: false });

const VenueModalMap = ({ venues }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [cityFilter, setCityFilter] = useState('');

  // Use the useMasteredLocations hook
  const { cities, fetchCities, loading, error } = useMasteredLocations();

  useEffect(() => {
    // Fetch active cities when the component loads
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return; // Ensure this only runs on the client

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

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Apply city filter
    let filteredVenues = venues;
    if (cityFilter) {
      filteredVenues = venues.filter((v) => v.masteredCityId?.['_id'] === cityFilter);
    }

    // Add markers
    filteredVenues.forEach((v) => {
      if (v.latitude && v.longitude) {
        L.marker([v.latitude, v.longitude]).addTo(map).bindPopup(`${v.name} (${v.shortName})`);
      }
    });
  }, [venues, cityFilter]);

  if (loading) return <Typography>Loading cities...</Typography>;
  if (error) return <Typography color="error">Error loading cities: {error}</Typography>;

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
