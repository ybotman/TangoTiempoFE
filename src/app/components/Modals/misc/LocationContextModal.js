// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/components/Modals/misc/LocationContextModal.js
// Explanation: New file. Displays Leaflet map centered on nearestCity.
// Fetches all cities from backend (modified route) and shows circle markers.
// Current city: green, others: blue. Clicking another city calls fetchNearestCity() and closes modal.
// Uses dynamic imports for Leaflet components. Ensures PropTypes. Runs in 'use client'.

'use client';

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Box } from '@mui/material';
import { useMasteredLocations } from '@/hooks/useMasteredLocations';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((mod) => mod.Tooltip), { ssr: false });

const LocationContextModal = ({ open, onClose }) => {
  const { cities, fetchCities, loading: citiesLoading, error: citiesError } = useMasteredLocations();
  const { nearestCity, fetchNearestCity, loading: nearestCityLoading } = useMasteredLocation();
  const { selectLocation } = useGeoLocation();
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [citiesWithCoords, setCitiesWithCoords] = useState([]);
  const [mapContainerKey, setMapContainerKey] = useState(Date.now()); // Force re-render key
  const mapRef = useRef(null); // For potential direct map access

  // Fetch cities when modal opens
  useEffect(() => {
    const loadCities = async () => {
      console.log('LCM uE: loadCities Start');
      if (open) {
        setLoading(true);
        try {
          // We will fetch ALL cities with no divisionId filter
          await fetchCities(undefined, true); // no divisionId => fetch all active cities
          console.log('Cities fetched successfully');
          // Force map container to re-render with new key
          setMapContainerKey(Date.now());
        } catch (error) {
          console.error('Error fetching cities:', error);
        } finally {
          // Always set loading to false, even if there was an error
          setLoading(false);
        }
      }
    };
    loadCities();
    
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
  }, [open, fetchCities]);

  // Process cities to ensure they have coordinates and log the results
  useEffect(() => {
    if (cities && Array.isArray(cities)) {
      console.log(`Processing cities array with ${cities.length} items`);
      
      const validCities = cities.filter(city => 
        city.latitude !== undefined && 
        city.longitude !== undefined && 
        city.latitude !== null && 
        city.longitude !== null &&
        !isNaN(parseFloat(city.latitude)) && 
        !isNaN(parseFloat(city.longitude))
      );
      
      console.log(`Cities with valid coordinates: ${validCities.length} out of ${cities.length}`);
      
      // Log the first few cities for debugging
      if (validCities.length > 0) {
        console.log('Sample city data:', validCities[0]);
        console.log('First 3 city coordinates:', validCities.slice(0, 3).map(c => 
          `${c.cityName}: [${c.latitude}, ${c.longitude}]`).join(', '));
      } else {
        console.warn('No cities with valid coordinates found');
      }
      
      setCitiesWithCoords(validCities);
      
      // Force map container to re-render with new key when cities change
      if (validCities.length > 0) {
        setMapContainerKey(Date.now());
      }
    } else {
      console.log('Cities array is null, undefined, or not an array');
      setCitiesWithCoords([]);
    }
    
    // Always set mapReady to true after processing, even if there are no valid cities
    // This prevents the loading spinner from being stuck indefinitely
    setMapReady(true);
  }, [cities]);

  // Log to debug when component renders
  console.log('LocationContextModal - Cities available:', cities?.length || 0);
  console.log('LocationContextModal - Current city:', nearestCity);

  // Keep track of the city we clicked for updating GeoLocationContext
  const [clickedCityId, setClickedCityId] = useState(null);
  
  // When nearestCity changes and there's a clickedCityId, update GeoLocationContext
  useEffect(() => {
    if (clickedCityId && nearestCity && nearestCity.cityID === clickedCityId) {
      // Update GeoLocationContext with the data from nearestCity
      selectLocation({
        country: {
          id: nearestCity.countryID,
          name: nearestCity.countryName
        },
        region: {
          id: nearestCity.regionID,
          name: nearestCity.regionName
        },
        division: {
          id: nearestCity.divisionID,
          name: nearestCity.divisionName
        },
        city: {
          id: nearestCity.cityID,
          name: nearestCity.cityName,
          latitude: nearestCity.latitude,
          longitude: nearestCity.longitude
        }
      });
      
      // Clear the clicked city ID
      setClickedCityId(null);
      
      // Close the modal
      onClose();
    }
  }, [nearestCity, clickedCityId, selectLocation, onClose]);
  
  const handleCityClick = async (city) => {
    if (!city.latitude || !city.longitude) {
      console.warn(`City ${city.cityName} has invalid coordinates:`, city.latitude, city.longitude);
      return;
    }
    
    console.log(`Clicking city: ${city.cityName} (${city._id}) at ${city.latitude}, ${city.longitude}`);
    
    // Set the clicked city ID so we can identify when nearestCity updates
    setClickedCityId(city._id);
    
    // Update the MasteredLocationContext (for backward compatibility)
    await fetchNearestCity(city.latitude, city.longitude);
  };

  // Ensure we have a valid center
  const center =
    nearestCity && nearestCity.latitude && nearestCity.longitude
      ? [nearestCity.latitude, nearestCity.longitude]
      : [39.8283, -98.5795]; // Default fallback center (USA approx)

  const isLoading = loading || citiesLoading || nearestCityLoading || !mapReady;
  const hasError = citiesError;
  const hasCities = citiesWithCoords && citiesWithCoords.length > 0;

  // For debugging
  console.log('Render state:', {
    isLoading,
    hasError: hasError ? citiesError : null,
    hasCities,
    hasNearestCity: !!nearestCity,
    cityCount: citiesWithCoords?.length || 0,
    loadingState: {
      componentLoading: loading,
      citiesLoading,
      nearestCityLoading,
      mapReady
    },
    nearestCityInfo: nearestCity ? {
      id: nearestCity.cityID,
      name: nearestCity.cityName,
      coordinates: [nearestCity.latitude, nearestCity.longitude]
    } : 'missing'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Nearest City</DialogTitle>
      <DialogContent style={{ height: '400px', position: 'relative' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading cities...</Typography>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              {loading ? 'Fetching city data...' : 
               citiesLoading ? 'Processing city data...' : 
               nearestCityLoading ? 'Loading nearest city...' : 
               !mapReady ? 'Preparing map...' : 'Initializing...'}
            </Typography>
          </Box>
        ) : hasError ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="error" gutterBottom>Error loading cities: {citiesError}</Typography>
            <Typography variant="body2">Try again later or contact administrator</Typography>
            <Button onClick={onClose} color="primary" variant="outlined" sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        ) : !hasCities ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography color="error" gutterBottom>No cities with coordinates available</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The system couldn't find any cities with valid location coordinates.
            </Typography>
            <Typography variant="caption" sx={{ mb: 2 }}>
              Please contact your administrator to ensure city data includes latitude and longitude.
            </Typography>
            <Button onClick={onClose} color="primary" variant="outlined">
              Close
            </Button>
          </Box>
        ) : !nearestCity ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography gutterBottom>Missing current city information</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Unable to determine your nearest city.
            </Typography>
            <Button onClick={onClose} color="primary" variant="outlined">
              Close
            </Button>
          </Box>
        ) : (
          // Map container with explicit styling and key for re-rendering
          <Box 
            sx={{ 
              height: '100%', 
              width: '100%',
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
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              // Use both keys to ensure proper rendering
              key={`map-${mapContainerKey}-${nearestCity?.cityID || 'default'}`}
              // Add whenCreated callback to debug map initialization
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
              
              {/* Render both markers and circle markers for better visibility */}
              {citiesWithCoords.map((city) => {
                const isCurrent = city._id === nearestCity.cityID;
                const color = isCurrent ? 'green' : 'blue';
                
                console.log(`Rendering city marker: ${city.cityName}, current: ${isCurrent}, coords: ${city.latitude},${city.longitude}`);
                
                // Return both a Marker and CircleMarker for each city
                return (
                  <React.Fragment key={`fragment-${city._id}`}>
                    {/* Use only CircleMarker since it doesn't need icon */}
                    <CircleMarker
                      key={`circle-${city._id}`}
                      center={[city.latitude, city.longitude]}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 2,
                      }}
                      radius={isCurrent ? 12 : 8}
                      eventHandlers={{
                        click: () => {
                          console.log('City clicked:', city.cityName);
                          if (!isCurrent) handleCityClick(city);
                        },
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LocationContextModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LocationContextModal;
