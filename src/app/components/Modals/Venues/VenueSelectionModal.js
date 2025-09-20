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
  Paper
} from '@mui/material';
// Removed unused import: categoryColors
import { useVenueSelection } from '@/hooks/useVenueSelection';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useUsers } from '@/hooks/useUsers';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Import the upcoming events component
import VenueUpcomingEvents from './VenueUpcomingEvents';

const VenueSelectionModal = ({ open, onClose }) => {
  const { selectedLocation, isInitialized } = useGeoLocation();
  const { userData } = useUsers();
  const {
    filteredVenues,
    selectedVenue,
    loading: venuesLoading,
    error: venuesError,
    selectVenue,
    refreshVenues,
    hasSelectedCity,
    radiusMiles
  } = useVenueSelection();

  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapContainerKey, setMapContainerKey] = useState(Date.now()); // Force re-render key
  const mapRef = useRef(null); // Direct map instance reference
  
  // Use user's saved map center location preferences if available
  const userDefaults = userData?.localUserInfo?.userDefaults;
  const defaultCenter = userDefaults?.defaultCenterLocation;
  
  // Fetch venues when modal opens
  useEffect(() => {
    const loadVenues = async () => {
      // Only attempt to load venues if GeoLocation context is initialized
      // and we have either a map center location or selected city
      const hasMapCenter = defaultCenter?.latitude && defaultCenter?.longitude;
      const hasLocationToUse = hasMapCenter || hasSelectedCity;
      
      if (open && hasLocationToUse && isInitialized) {
        setLoading(true);
        try {
// TIEMPO-276: Security cleanup - removed logging
          refreshVenues();
// TIEMPO-276: Security cleanup - removed logging
          // Force map container to re-render with new key
          setMapContainerKey(Date.now());
        } catch (error) {
          console.error('Error fetching venues:', error);
        } finally {
          setLoading(false);
        }
      } else if (open) {
        // TIEMPO-276: Security cleanup - removed logging
      }
    };
    loadVenues();
    
    // Add a safeguard timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
// TIEMPO-276: Security cleanup - removed logging
        setLoading(false);
        setMapReady(true);
        // Force map container to re-render with new key when timeout occurs
        setMapContainerKey(Date.now());
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [open, refreshVenues, hasSelectedCity, loading, isInitialized, selectedLocation?.city?.name, defaultCenter]);

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
// TIEMPO-276: Security cleanup - removed logging
  };

  let center;
  if (defaultCenter?.latitude && defaultCenter?.longitude) {
    // Use saved map center location
    center = [defaultCenter.latitude, defaultCenter.longitude];
  } else if (selectedLocation?.city?.latitude && selectedLocation?.city?.longitude) {
    // Fallback to selected city if no saved preferences
    center = [selectedLocation.city.latitude, selectedLocation.city.longitude];
  } else {
    // Default fallback center (USA approx)
    center = [39.8283, -98.5795];
  }

  const isLoading = loading || venuesLoading || !mapReady;
  const hasError = venuesError;
  const hasVenues = filteredVenues && filteredVenues.length > 0;


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
        ) : !hasSelectedCity && !(defaultCenter?.latitude && defaultCenter?.longitude) ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="primary" variant="h6" gutterBottom>Please set your location preferences</Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', maxWidth: '80%' }}>
              You need to set your map center location in User Settings before you can choose a venue.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              Go to User Settings → Location Prefs and click on the map to set your center location.
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
              <Button onClick={onClose} color="primary" variant="outlined">
                Close
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
            {/* Map container */}
            <Box 
              sx={{
                flex: selectedVenue ? '0 0 60%' : '1',
                position: "relative",
                overflow: "hidden",
                border: "1px solid #ccc",
                borderRadius: "4px",
                transition: 'flex 0.3s ease',
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
                zoom={10} // Fixed zoom level
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                key={`map-${mapContainerKey}`}
                whenCreated={(map) => {
// TIEMPO-276: Security cleanup - removed logging
                  // Store the map instance in the ref
                  mapRef.current = map;

                  // Invalidate map size to ensure correct rendering
                  setTimeout(() => {
                    map.invalidateSize();
// TIEMPO-276: Security cleanup - removed logging

                    // Use a fixed zoom level
                    const zoomLevel = 10;

                    // Get center point from selected location or default center
                    const centerLat = parseFloat(selectedLocation?.city?.latitude || center[0]);
                    const centerLng = parseFloat(selectedLocation?.city?.longitude || center[1]);

                    try {
                      // Set the initial view directly - this is a core method available in all Leaflet maps
                      map.setView([centerLat, centerLng], zoomLevel);
// TIEMPO-276: Security cleanup - removed logging
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

                {/* Radius circle showing the search area - read only */}
                {selectedLocation?.city?.latitude && selectedLocation?.city?.longitude && radiusMiles && (
                  <Circle
                    center={[selectedLocation.city.latitude, selectedLocation.city.longitude]}
                    radius={radiusMiles * 1609.34} // Convert miles to meters
                    pathOptions={{
                      color: 'blue',
                      fillColor: 'lightblue',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '5, 10'
                    }}
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
// TIEMPO-276: Security cleanup - removed logging
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
            
            {/* Events panel */}
            {selectedVenue && (
              <Paper 
                sx={{ 
                  flex: '0 0 40%',
                  overflow: 'auto',
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}
                elevation={2}
              >
                <VenueUpcomingEvents venue={selectedVenue} />
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="body2">
          {selectedVenue 
            ? `Selected: ${selectedVenue.name || selectedVenue.shortName}` 
            : hasVenues ? 'Click a venue to see its upcoming events' : ''}
        </Typography>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

VenueSelectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VenueSelectionModal;