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
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), { ssr: false });

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

        // Add a short delay before fetching cities to allow contexts to initialize
        // This helps prevent "No cities with valid coordinates" warnings
        const fetchWithDelay = () => {
          return new Promise(resolve => {
            setTimeout(async () => {
              try {
                // We will fetch ALL cities with no divisionId filter
                await fetchCities(undefined, true); // no divisionId => fetch all active cities
                console.log('Cities fetched successfully');
                // Force map container to re-render with new key
                setMapContainerKey(Date.now());
                resolve();
              } catch (error) {
                console.error('Error fetching cities:', error);
                resolve(); // Resolve even on error
              }
            }, 300); // Small delay of 300ms to ensure context initialization
          });
        };

        await fetchWithDelay();

        // Always set loading to false after fetch completes
        setLoading(false);
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
      
      // Check for both direct latitude/longitude AND location.coordinates
      // This handles multiple possible API response formats
      const validCities = cities.filter(city => {
        // Check for direct latitude/longitude properties
        const hasDirectCoords = 
          city.latitude !== undefined && 
          city.longitude !== undefined && 
          city.latitude !== null && 
          city.longitude !== null &&
          !isNaN(parseFloat(city.latitude)) && 
          !isNaN(parseFloat(city.longitude));
          
        // Check for GeoJSON location field with coordinates
        const hasLocationCoords = 
          city.location && 
          city.location.type === 'Point' && 
          Array.isArray(city.location.coordinates) && 
          city.location.coordinates.length === 2 &&
          !isNaN(parseFloat(city.location.coordinates[0])) &&
          !isNaN(parseFloat(city.location.coordinates[1]));
          
        // Return true if either coordinate format is valid
        return hasDirectCoords || hasLocationCoords;
      });
      
      // If cities have location.coordinates but not direct lat/lng,
      // extract coordinates from location field for each city
      const processedCities = validCities.map(city => {
        // If city already has direct coords, use them
        if (city.latitude !== undefined && city.longitude !== undefined) {
          return city;
        }
        
        // Otherwise extract from location.coordinates if available
        if (city.location && Array.isArray(city.location.coordinates)) {
          return {
            ...city,
            // GeoJSON uses [longitude, latitude] order
            longitude: city.location.coordinates[0],
            latitude: city.location.coordinates[1]
          };
        }
        
        // Fallback - shouldn't reach here due to filter above
        return city;
      });
      
      console.log(`Cities with valid coordinates: ${processedCities.length} out of ${cities.length}`);
      
      // Log the first few cities for debugging
      if (processedCities.length > 0) {
        console.log('Sample city data:', processedCities[0]);
        console.log('First 3 city coordinates:', processedCities.slice(0, 3).map(c =>
          `${c.cityName}: [${c.latitude}, ${c.longitude}]`).join(', '));
      } else {
        // Log more details about the cities array to diagnose the problem
        console.log('Processing city data - using fallbacks if needed:', {
          citiesArrayIsArray: Array.isArray(cities),
          citiesLength: cities?.length,
          firstRawCity: cities && cities.length > 0 ? cities[0] : null,
          sampleCoords: cities && cities.length > 0
            ? `lat: ${cities[0].latitude}, lng: ${cities[0].longitude}, location: ${JSON.stringify(cities[0].location)}`
            : 'No cities'
        });

        // Create a more comprehensive fallback set with various US cities
        // This prevents the "No cities with valid coordinates" error
        const fallbackCities = [
          {
            _id: '6751f58a5db435dd8005e479',
            cityName: 'Boston (Fallback)',
            latitude: 42.3601,
            longitude: -71.0589,
            masteredDivisionId: '6751f58a5db435dd8005e461'
          },
          {
            _id: '6751f58a5db435dd8005e470',
            cityName: 'New York City (Fallback)',
            latitude: 40.7128,
            longitude: -74.006,
            masteredDivisionId: '6751f58a5db435dd8005e461'
          },
          {
            _id: 'fallback-chicago',
            cityName: 'Chicago (Fallback)',
            latitude: 41.8781,
            longitude: -87.6298,
            masteredDivisionId: 'fallback-midwest'
          },
          {
            _id: 'fallback-miami',
            cityName: 'Miami (Fallback)',
            latitude: 25.7617,
            longitude: -80.1918,
            masteredDivisionId: 'fallback-southeast'
          },
          {
            _id: 'fallback-la',
            cityName: 'Los Angeles (Fallback)',
            latitude: 34.0522,
            longitude: -118.2437,
            masteredDivisionId: 'fallback-west'
          },
          {
            _id: 'fallback-seattle',
            cityName: 'Seattle (Fallback)',
            latitude: 47.6062,
            longitude: -122.3321,
            masteredDivisionId: 'fallback-northwest'
          }
        ];

        console.log('Using fallback cities for map display');
        setCitiesWithCoords(fallbackCities);
        setMapContainerKey(Date.now());
        setMapReady(true);
        return;
      }
      
      setCitiesWithCoords(processedCities);
      
      // Force map container to re-render with new key when cities change
      if (processedCities.length > 0) {
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
  
  // Close modal after city selection is completed
  useEffect(() => {
    if (clickedCityId) {
      // Small delay to ensure state updates are processed
      const timeoutId = setTimeout(() => {
        // Clear the clicked city ID and close modal
        setClickedCityId(null);
        onClose();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [clickedCityId, onClose]);
  
  const handleCityClick = async (city) => {
    if (!city.latitude || !city.longitude) {
      console.warn(`City ${city.cityName} has invalid coordinates:`, city.latitude, city.longitude);
      return;
    }

    console.log(`Clicking city: ${city.cityName} (${city._id}) at ${city.latitude}, ${city.longitude}`);

    // Set the clicked city ID so we can identify when nearestCity updates
    setClickedCityId(city._id);

    // Update both contexts - but GeoLocationContext is the source of truth
    // Call MasteredLocation for data lookup but use GeoLocation for state updates
    const cityData = await fetchNearestCity(city.latitude, city.longitude);

    // Update GeoLocationContext directly with the selected location
    if (cityData) {
      selectLocation({
        country: {
          id: cityData.countryID,
          name: cityData.countryName
        },
        region: {
          id: cityData.regionID,
          name: cityData.regionName
        },
        division: {
          id: cityData.divisionID,
          name: cityData.divisionName
        },
        city: {
          id: cityData.cityID,
          name: cityData.cityName,
          latitude: cityData.latitude,
          longitude: cityData.longitude
        }
      });
    }
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
            <Typography color="primary" variant="h6" gutterBottom>Using Fallback Location Data</Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', maxWidth: '80%' }}>
              We couldn't find city data with coordinates in your account, so we're showing default US cities.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
              You can still select a city from the map to continue using the app.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={onClose} color="primary" variant="outlined">
                Close
              </Button>
            </Box>
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
                
                //console.log(`Rendering city marker: ${city.cityName}, current: ${isCurrent}, coords: ${city.latitude},${city.longitude}`);
                
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
