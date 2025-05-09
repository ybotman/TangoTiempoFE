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
  Slider
} from '@mui/material';
// Removed unused import: categoryColors
import { useVenueSelection } from '@/hooks/useVenueSelection';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const VenueSelectionModal = ({ open, onClose }) => {
  const { selectedLocation, isInitialized } = useGeoLocation();
  const {
    filteredVenues,
    selectedVenue,
    radiusMiles,
    loading: venuesLoading,
    error: venuesError,
    selectVenue,
    refreshVenues,
    handleRadiusChange: setRadiusMiles,
    hasSelectedCity
  } = useVenueSelection();

  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapContainerKey, setMapContainerKey] = useState(Date.now()); // Force re-render key
  const mapRef = useRef(null); // Direct map instance reference
  
  // Fetch venues when modal opens
  useEffect(() => {
    const loadVenues = async () => {
      // Only attempt to load venues if GeoLocation context is initialized
      // and we have a selected city
      if (open && hasSelectedCity && isInitialized) {
        setLoading(true);
        try {
          console.log('VenueSelectionModal: Loading venues for city', selectedLocation?.city?.name);
          refreshVenues();
          console.log('Venues fetched successfully');
          // Force map container to re-render with new key
          setMapContainerKey(Date.now());
        } catch (error) {
          console.error('Error fetching venues:', error);
        } finally {
          setLoading(false);
        }
      } else if (open) {
        console.log('VenueSelectionModal: Not ready to load venues yet', {
          hasSelectedCity,
          isInitialized,
          cityName: selectedLocation?.city?.name
        });
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
  }, [open, refreshVenues, hasSelectedCity, loading, isInitialized, selectedLocation?.city?.name]);

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

  // Add a useEffect for radius changes that will adjust the map zoom
  useEffect(() => {
    // Only attempt to adjust the map when everything is ready
    if (mapReady && mapRef.current) {
      // Use a timeout to ensure the map is fully initialized
      const timeoutId = setTimeout(() => {
        try {
          const map = mapRef.current;
          console.log('Attempting to adjust map zoom for radius change');

          // Check if the map instance has the methods we need
          if (typeof map.flyToBounds === 'function') {
            console.log('Using flyToBounds method');

            // Set initial zoom level based on radius
            const zoomLevel = Math.max(6, Math.min(13, 14 - Math.log2(radiusMiles / 10)));
            map.setZoom(zoomLevel);

            console.log(`Set map zoom to ${zoomLevel} for radius of ${radiusMiles} miles`);
          } else {
            console.log('Map does not have flyToBounds method');
          }
        } catch (error) {
          console.error('Error in radius change effect:', error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [radiusMiles, mapReady]);

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

  // Handle radius slider change
  const handleRadiusChange = (event, newValue) => {
    setRadiusMiles(newValue);
    // We'll let the useEffect handle map updates instead of calling adjustMapToRadius directly
  };

  // Add effect to handle map zoom changes when radius changes
  useEffect(() => {
    // Since we can't reliably access Leaflet map methods directly through refs in this component,
    // we'll use a simpler approach - just update the key to force a full re-render of the MapContainer
    // when the radius changes or selected location changes
    if (selectedLocation?.city?.latitude && selectedLocation?.city?.longitude) {
      // Force re-render on radius changes by updating the map key
      // This is more reliable than trying to call methods on the map instance directly
      setMapContainerKey(Date.now());
      console.log(`Set new map container key for radius ${radiusMiles} miles`);
    }
  }, [radiusMiles, selectedLocation?.city?.latitude, selectedLocation?.city?.longitude]);
  
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
      <DialogContent style={{ height: '550px', position: 'relative' }}>
        {!isInitialized ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing location system...
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              Please wait while we set up the venue selection system.
            </Typography>
          </Box>
        ) : !hasSelectedCity ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="primary" variant="h6" gutterBottom>Please select a city first</Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', maxWidth: '80%' }}>
              You need to select a city before you can choose a venue.
              Use the &quot;Select Nearest City&quot; option in the main menu.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              This is needed even if location detection is enabled,
              as we need to know which city&apos;s venues to display.
            </Typography>
            <Button onClick={onClose} color="primary" variant="contained">
              Go Back to Menu
            </Button>
          </Box>
        ) : isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading venues near {selectedLocation?.city?.name || 'selected city'}...
            </Typography>
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
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', maxWidth: '80%' }}>
              Try expanding the search to the division level using the switch above, or increasing the radius if in city view.
            </Typography>
            <Typography variant="caption" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              If you still don&apos;t see any venues, your administrator may need to add venues in this region.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setRadiusMiles(300)} color="primary" variant="contained">
                Increase Search Radius
              </Button>
              <Button onClick={onClose} color="primary" variant="outlined">
                Close
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Filter controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, gap: 2 }}>
              {/* Enhanced Radius Filter */}
              <Box sx={{ px: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Search Radius: {radiusMiles} miles
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Shows venues within {radiusMiles} miles of {selectedLocation?.city?.name || 'selected city'}
                </Typography>
                <Slider
                  value={radiusMiles}
                  onChange={handleRadiusChange}
                  min={5}
                  max={300}
                  step={5}
                  marks={[
                    { value: 10, label: '10mi' },
                    { value: 25, label: '25mi' },
                    { value: 50, label: '50mi' },
                    { value: 100, label: '100mi' },
                    { value: 200, label: '200mi' }
                  ]}
                  valueLabelDisplay="auto"
                  aria-labelledby="radius-slider"
                  sx={{
                    "&amp; .MuiSlider-markLabel": {
                      fontSize: "0.75rem"
                    }
                  }}
                />
              </Box>
            </Box>
            
            {/* Map container */}
            <Box 
              sx={{
                flexGrow: 1,
                position: "relative",
                overflow: "hidden",
                border: "1px solid #ccc",
                borderRadius: "4px",
                "&amp; .leaflet-container": {
                  height: "100%",
                  width: "100%",
                  zIndex: 1
                },
                "&amp; .leaflet-marker-icon": {
                  zIndex: 500
                },
                "&amp; .leaflet-tooltip": {
                  zIndex: 600
                }
              }}
              ref={mapRef}
            >
              <MapContainer
                center={center}
                zoom={Math.max(5, Math.min(12, 13 - Math.log2(radiusMiles / 20)))}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                key={`map-${mapContainerKey}`}
                whenCreated={(map) => {
                  console.log('Map created successfully', map);
                  // Store the map instance in the ref
                  mapRef.current = map;

                  // Invalidate map size to ensure correct rendering
                  setTimeout(() => {
                    map.invalidateSize();
                    console.log('Map size invalidated');

                    // Calculate an appropriate initial zoom level based on radius using logarithmic scale
                    // This is a simpler approach that doesn't rely on Leaflet's bounds methods
                    const zoomLevel = Math.max(5, Math.min(12, 13 - Math.log2(radiusMiles / 20)));

                    // Get center point from selected location or default center
                    const centerLat = parseFloat(selectedLocation?.city?.latitude || center[0]);
                    const centerLng = parseFloat(selectedLocation?.city?.longitude || center[1]);

                    try {
                      // Set the initial view directly - this is a core method available in all Leaflet maps
                      map.setView([centerLat, centerLng], zoomLevel);
                      console.log(`Initial map view set to zoom level ${zoomLevel}`);
                    } catch (error) {
                      console.error('Error setting initial map view:', error);
                    }
                  }, 100);
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <ZoomControl position="bottomright" />

                {/* Visual radius indicator */}
                {selectedLocation?.city?.latitude && selectedLocation?.city?.longitude && (
                  <Circle
                    center={[
                      parseFloat(selectedLocation.city.latitude),
                      parseFloat(selectedLocation.city.longitude)
                    ]}
                    pathOptions={{
                      color: '#3f51b5',
                      fillColor: '#3f51b5',
                      fillOpacity: 0.05,
                      weight: 1,
                      dashArray: '5, 5',
                      opacity: 0.6
                    }}
                    // Convert miles to meters for the circle radius (1 mile = 1609.34 meters)
                    radius={radiusMiles * 1609.34}
                  />
                )}

                {/* Render venue markers */}
                {filteredVenues.map((venue) => {
                  const isSelected = selectedVenue && venue._id === selectedVenue._id;
                  // Use a simple color scheme - orange for selected, blue for others
                  let color = isSelected ? 'orange' : 'DodgerBlue';

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