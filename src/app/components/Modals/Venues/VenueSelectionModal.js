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
import { categoryColors } from '@/utils/categoryColors';
import { useVenueSelection } from '@/hooks/useVenueSelection';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const VenueSelectionModal = ({ open, onClose }) => {
  const { selectedLocation } = useGeoLocation();
  const {
    filteredVenues,
    selectedVenue,
    venueCategory,
    useDivisionScope,
    loading: venuesLoading,
    error: venuesError,
    selectVenue,
    refreshVenues,
    handleVenueCategoryChange: setVenueCategory,
    handleScopeChange: setUseDivisionScope,
    hasSelectedCity
  } = useVenueSelection();

  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapContainerKey, setMapContainerKey] = useState(Date.now()); // Force re-render key
  const mapRef = useRef(null); // For potential direct map access
  
  // Define venue categories based on the event categories system
  const venueCategories = [
    { id: 'all', name: 'All Types' },
    { id: 'Milonga', name: 'Milonga', color: categoryColors.Milonga },
    { id: 'Practica', name: 'Practica', color: categoryColors.Practica },
    { id: 'Class', name: 'Class', color: categoryColors.Class },
    { id: 'Workshop', name: 'Workshop', color: categoryColors.Workshop },
    { id: 'Festival', name: 'Festival', color: categoryColors.Festival }
  ];
  
  // Fetch venues when modal opens
  useEffect(() => {
    const loadVenues = async () => {
      if (open && hasSelectedCity) {
        setLoading(true);
        try {
          refreshVenues();
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
  }, [open, refreshVenues, hasSelectedCity, loading]);

  // Set map ready when filtered venues change
  useEffect(() => {
    if (filteredVenues && filteredVenues.length > 0) {
      // Force map container to re-render with new key when venues change
      setMapContainerKey(Date.now());
    }
    
    // Always set mapReady to true after processing, even if there are no valid venues
    // This prevents the loading spinner from being stuck indefinitely
    setMapReady(true);
  }, [filteredVenues]);

  // Handle venue selection
  const handleVenueClick = (venue) => {
    selectVenue(venue);
    console.log(`Selected venue: ${venue.name || venue.shortName}`);
  };

  // Ensure we have a valid center based on the selected city
  const center =
    selectedLocation?.city?.latitude && selectedLocation?.city?.longitude
      ? [selectedLocation.city.latitude, selectedLocation.city.longitude]
      : [39.8283, -98.5795]; // Default fallback center (USA approx)

  const isLoading = loading || venuesLoading || !mapReady;
  const hasError = venuesError;
  const hasVenues = filteredVenues && filteredVenues.length > 0;

  // Handle venue category change
  const handleVenueCategoryChange = (event) => {
    setVenueCategory(event.target.value);
  };

  // Handle scope switch change
  const handleScopeChange = (event) => {
    setUseDivisionScope(event.target.checked);
  };
  
  // Function to select a venue and close the modal
  const handleSelectVenue = () => {
    if (selectedVenue) {
      // Using the selectVenue from our hook already handles the context update
      console.log(`Selecting venue: ${selectedVenue.name || selectedVenue.shortName}`);
      // Close the modal
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Venue</DialogTitle>
      <DialogContent style={{ height: '500px', position: 'relative' }}>
        {!hasSelectedCity ? (
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
                <InputLabel id="venue-category-label">Event Type</InputLabel>
                <Select
                  labelId="venue-category-label"
                  id="venue-category"
                  value={venueCategory}
                  label="Event Type"
                  onChange={handleVenueCategoryChange}
                >
                  {venueCategories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.id !== 'all' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              bgcolor: category.color, 
                              mr: 1 
                            }} 
                          />
                          {category.name}
                        </Box>
                      ) : category.name}
                    </MenuItem>
                  ))}
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
                {filteredVenues.map((venue) => {
                  const isSelected = selectedVenue && venue._id === selectedVenue._id;
                  // Use categoryColors from the utility for consistent color scheme
                  let color;
                  if (isSelected) {
                    color = 'orange';
                  } else if (venue.venueCategory && categoryColors[venue.venueCategory]) {
                    color = categoryColors[venue.venueCategory];
                  } else if (venue.eventCategory && categoryColors[venue.eventCategory]) {
                    color = categoryColors[venue.eventCategory];
                  } else if (venue.primaryEventType && categoryColors[venue.primaryEventType]) {
                    color = categoryColors[venue.primaryEventType];
                  } else {
                    color = categoryColors.Unknown || 'purple';
                  }
                  
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
            onClick={handleSelectVenue} 
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