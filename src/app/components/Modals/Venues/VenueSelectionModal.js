'use client';

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  CircularProgress, 
  Typography, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useVenues } from '@/hooks/useVenues';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const VenueSelectionModal = ({ open, onClose }) => {
  const { venues, fetchVenues, loading: venuesLoading, error: venuesError } = useVenues();
  const { selectedLocation } = useGeoLocation();
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [venuesWithCoords, setVenuesWithCoords] = useState([]);
  const [mapContainerKey, setMapContainerKey] = useState(Date.now()); // Force re-render key
  const mapRef = useRef(null); // For potential direct map access
  const [selectedVenue, setSelectedVenue] = useState(null);
  
  // Additional state for filtering
  const [venueType, setVenueType] = useState('all');
  const [useDivisionScope, setUseDivisionScope] = useState(false);
  
  // Fetch venues when modal opens
  useEffect(() => {
    const loadVenues = async () => {
      if (open && selectedLocation?.city?.id) {
        setLoading(true);
        try {
          await fetchVenues();
          console.log('Venues fetched successfully');
          // Force map container to re-render with new key
          setMapContainerKey(Date.now());
        } catch (error) {
          console.error('Error fetching venues:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadVenues();
    
    // Add a safeguard timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout triggered - forcing loading to false');
        setLoading(false);
        setMapReady(true);
        // Force map container to re-render with new key when timeout occurs
        setMapContainerKey(Date.now());
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [open, fetchVenues, selectedLocation]);

  // Process venues to ensure they have coordinates and apply filters
  useEffect(() => {
    if (venues && Array.isArray(venues)) {
      console.log(`Processing venues array with ${venues.length} items`);
      
      // Filter based on coordinates
      const validVenues = venues.filter(venue => 
        venue.latitude !== undefined && 
        venue.longitude !== undefined && 
        venue.latitude !== null && 
        venue.longitude !== null &&
        !isNaN(parseFloat(venue.latitude)) && 
        !isNaN(parseFloat(venue.longitude))
      );
      
      console.log(`Venues with valid coordinates: ${validVenues.length} out of ${venues.length}`);
      
      // Apply location filter based on mastered location IDs
      let filteredVenues = validVenues;
      
      if (useDivisionScope && selectedLocation?.division?.id) {
        // Filter by division
        filteredVenues = filteredVenues.filter(venue => 
          venue.masteredDivisionId === selectedLocation.division.id
        );
      } else if (selectedLocation?.city?.id) {
        // Filter by city
        filteredVenues = filteredVenues.filter(venue => 
          venue.masteredCityId === selectedLocation.city.id
        );
      }
      
      // Apply venue type filter if not "all"
      if (venueType !== 'all') {
        filteredVenues = filteredVenues.filter(venue => 
          venue.venueType === venueType
        );
      }
      
      console.log(`Filtered venues count: ${filteredVenues.length}`);
      
      // Log the first few venues for debugging
      if (filteredVenues.length > 0) {
        console.log('Sample venue data:', filteredVenues[0]);
        console.log('First 3 venue coordinates:', filteredVenues.slice(0, 3).map(v => 
          `${v.name || v.shortName}: [${v.latitude}, ${v.longitude}]`).join(', '));
      } else {
        console.warn('No venues with valid coordinates found after filtering');
      }
      
      setVenuesWithCoords(filteredVenues);
      
      // Force map container to re-render with new key when venues change
      if (filteredVenues.length > 0) {
        setMapContainerKey(Date.now());
      }
    } else {
      console.log('Venues array is null, undefined, or not an array');
      setVenuesWithCoords([]);
    }
    
    // Always set mapReady to true after processing, even if there are no valid venues
    // This prevents the loading spinner from being stuck indefinitely
    setMapReady(true);
  }, [venues, venueType, useDivisionScope, selectedLocation]);

  // Handle venue selection
  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    // For now, we just select and close - in future we would handle this by updating context
    console.log(`Selected venue: ${venue.name || venue.shortName}`);
  };

  // Ensure we have a valid center based on the selected city
  const center =
    selectedLocation?.city?.latitude && selectedLocation?.city?.longitude
      ? [selectedLocation.city.latitude, selectedLocation.city.longitude]
      : [39.8283, -98.5795]; // Default fallback center (USA approx)

  const isLoading = loading || venuesLoading || !mapReady;
  const hasError = venuesError;
  const hasVenues = venuesWithCoords && venuesWithCoords.length > 0;

  // Handle venue type change
  const handleVenueTypeChange = (event) => {
    setVenueType(event.target.value);
  };

  // Handle scope switch change
  const handleScopeChange = (event) => {
    setUseDivisionScope(event.target.checked);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Venue</DialogTitle>
      <DialogContent style={{ height: '500px', position: 'relative' }}>
        {!selectedLocation?.city?.id ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="error" gutterBottom>Please select a city first</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You need to select a city before you can choose a venue.
            </Typography>
            <Button onClick={onClose} color="primary" variant="outlined">
              Close
            </Button>
          </Box>
        ) : isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading venues...</Typography>
          </Box>
        ) : hasError ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="error" gutterBottom>Error loading venues: {venuesError}</Typography>
            <Typography variant="body2">Try again later or contact administrator</Typography>
            <Button onClick={onClose} color="primary" variant="outlined" sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        ) : !hasVenues ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="error" gutterBottom>No venues found in this area</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Try expanding the search to the division level or contact your administrator to add venues.
            </Typography>
            <Button onClick={onClose} color="primary" variant="outlined">
              Close
            </Button>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Filter controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel id="venue-type-label">Venue Type</InputLabel>
                <Select
                  labelId="venue-type-label"
                  id="venue-type"
                  value={venueType}
                  label="Venue Type"
                  onChange={handleVenueTypeChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="milonga">Milonga</MenuItem>
                  <MenuItem value="practica">Practica</MenuItem>
                  <MenuItem value="class">Class</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={useDivisionScope} 
                    onChange={handleScopeChange}
                    color="primary"
                  />
                }
                label={`${useDivisionScope ? 'Division' : 'City'} view`}
              />
            </Box>
            
            {/* Map container */}
            <Box 
              sx={{ 
                flexGrow: 1,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #ccc',
                borderRadius: '4px',
                '& .leaflet-container': {
                  height: '100%',
                  width: '100%',
                  zIndex: 1
                },
                '& .leaflet-marker-icon': {
                  zIndex: 500
                },
                '& .leaflet-tooltip': {
                  zIndex: 600
                }
              }}
              ref={mapRef}
            >
              <MapContainer
                center={center}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                key={`map-${mapContainerKey}`}
                whenCreated={(map) => {
                  console.log('Map created successfully', map);
                  // Invalidate map size to ensure correct rendering
                  setTimeout(() => {
                    map.invalidateSize();
                    console.log('Map size invalidated');
                  }, 100);
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <ZoomControl position="bottomright" />
                
                {/* Render venue markers */}
                {venuesWithCoords.map((venue) => {
                  const isSelected = selectedVenue && venue._id === selectedVenue._id;
                  const venueTypeColors = {
                    milonga: 'red',
                    practica: 'blue',
                    class: 'green',
                    default: 'purple'
                  };
                  const color = isSelected 
                    ? 'orange' 
                    : venueTypeColors[venue.venueType] || venueTypeColors.default;
                  
                  return (
                    <CircleMarker
                      key={venue._id}
                      center={[venue.latitude, venue.longitude]}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 2,
                      }}
                      radius={isSelected ? 12 : 8}
                      eventHandlers={{
                        click: () => {
                          console.log('Venue clicked:', venue.name || venue.shortName);
                          handleVenueClick(venue);
                        },
                      }}
                    >
                      <Tooltip>
                        {venue.name || venue.shortName}
                      </Tooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="body2">
          {selectedVenue 
            ? `Selected: ${selectedVenue.name || selectedVenue.shortName}` 
            : 'Click a venue to select it'}
        </Typography>
        <Box>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={onClose} 
            color="primary" 
            variant="contained" 
            disabled={!selectedVenue}
            sx={{ ml: 1 }}
          >
            Select Venue
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

VenueSelectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VenueSelectionModal;