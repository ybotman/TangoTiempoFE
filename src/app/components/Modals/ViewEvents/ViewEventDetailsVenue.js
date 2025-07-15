'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Link,
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import { useVenues } from '@/hooks/useVenues';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for react-leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Fix for default markers in Leaflet - only run on client
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  });
}

const ViewEventDetailsVenue = ({ eventDetails }) => {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { getVenueById } = useVenues();

  // Handle various ways venue might be provided
  // 1. Check if venue is directly populated
  const populatedVenue = eventDetails?.extendedProps?.venue || eventDetails?.extendedProps?.location;
  
  // 2. Check for venue/location IDs
  const venueIdRaw = eventDetails?.extendedProps?.venueID || eventDetails?.extendedProps?.locationID;
  
  // 3. Extract ID if venueID/locationID is an object
  const venueId = typeof venueIdRaw === 'object' ? venueIdRaw?._id || venueIdRaw?.id : venueIdRaw;
  
  // 4. Get venue name
  const venueName = eventDetails?.extendedProps?.venueName || eventDetails?.extendedProps?.locationName;
  
  // 5. Determine if we have a populated venue object
  const venueObject = populatedVenue || (typeof venueIdRaw === 'object' && venueIdRaw !== null ? venueIdRaw : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchVenueDetails = async () => {
      // Debug logging
      console.log('Venue data debug:', {
        populatedVenue,
        venueIdRaw,
        locationIdRaw: eventDetails?.extendedProps?.locationID,
        venue: eventDetails?.extendedProps?.venue,
        location: eventDetails?.extendedProps?.location,
        venueId,
        venueName,
        venueObject,
        typeOfVenueIdRaw: typeof venueIdRaw,
        venueIdRawKeys: venueIdRaw && typeof venueIdRaw === 'object' ? Object.keys(venueIdRaw) : null,
        extendedProps: eventDetails?.extendedProps
      });

      // If venue is already populated as an object, use it directly
      if (venueObject && venueObject._id) {
        setVenue(venueObject);
        setLoading(false);
        return;
      }

      if (!venueId || venueId === '[object Object]' || typeof venueId !== 'string') {
        setError('No valid venue ID available for this event');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const venueData = await getVenueById(venueId);
        if (venueData) {
          setVenue(venueData);
        } else {
          setError('Venue details not found');
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue details');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venueId, getVenueById, eventDetails, venueObject]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !venueId) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info">
          {error || 'No venue information available for this event'}
        </Alert>
      </Box>
    );
  }

  if (!venue) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Venue: {venueName || 'Unknown Venue'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Detailed venue information is not available
        </Typography>
      </Box>
    );
  }

  const hasValidCoordinates = venue.latitude && venue.longitude && 
    !isNaN(parseFloat(venue.latitude)) && !isNaN(parseFloat(venue.longitude));

  return (
    <Box sx={{ py: 2 }}>
      {/* Venue Name and Status */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h5" component="h2">
            {venue.name || venue.shortName || venueName || 'Unknown Venue'}
          </Typography>
          {venue.isActive === false && (
            <Chip label="Inactive" size="small" color="warning" />
          )}
        </Box>
        
        {venue.shortName && venue.name && venue.shortName !== venue.name && (
          <Typography variant="body2" color="text.secondary">
            Also known as: {venue.shortName}
          </Typography>
        )}
      </Box>

      {/* Contact Information */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        
        {/* Address */}
        {(venue.address || venue.city || venue.state) && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <LocationOnIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
            <Box>
              {venue.address && (
                <Typography variant="body2">{venue.address}</Typography>
              )}
              <Typography variant="body2">
                {[venue.city, venue.state, venue.zip].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Phone */}
        {venue.phoneNumber && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PhoneIcon color="action" fontSize="small" />
            <Link href={`tel:${venue.phoneNumber}`} underline="hover">
              <Typography variant="body2">{venue.phoneNumber}</Typography>
            </Link>
          </Box>
        )}

        {/* Website */}
        {venue.website && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon color="action" fontSize="small" />
            <Link 
              href={venue.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              underline="hover"
            >
              <Typography variant="body2">Visit Website</Typography>
            </Link>
          </Box>
        )}

        {!venue.address && !venue.phoneNumber && !venue.website && (
          <Typography variant="body2" color="text.secondary">
            No contact information available
          </Typography>
        )}
      </Paper>

      {/* Map */}
      {hasValidCoordinates && mounted && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Location Map
          </Typography>
          <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
            <MapContainer
              center={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}>
                <Popup>
                  <Box>
                    <Typography variant="subtitle2">
                      {venue.name || venue.shortName || 'Venue'}
                    </Typography>
                    {venue.address && (
                      <Typography variant="body2">{venue.address}</Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Paper>
      )}

      {/* Additional Information */}
      {venue.notes && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Notes
          </Typography>
          <Typography variant="body2">
            {venue.notes}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

ViewEventDetailsVenue.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      venueID: PropTypes.string,
      locationID: PropTypes.string,
      venueName: PropTypes.string,
      locationName: PropTypes.string,
    }),
  }),
};

export default ViewEventDetailsVenue;