import React from 'react';
import Image from 'next/image';
import { Box, Typography, Grid, Paper, Divider, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import PropTypes from 'prop-types';

const ViewEventDetailsVenueOther = ({ eventDetails }) => {
  // Extract venue details from eventDetails, supporting both venue and legacy location fields
  const venueName = eventDetails?.extendedProps?.venueName ||
                    eventDetails?.extendedProps?.locationName ||
                    'Venue not specified';

  const venueID = eventDetails?.extendedProps?.venueID ||
                  eventDetails?.extendedProps?.locationID ||
                  null;

  // Extract address components
  const address1 = eventDetails?.extendedProps?.venue?.address1 ||
                   eventDetails?.extendedProps?.venue?.address ||
                   eventDetails?.extendedProps?.address1 ||
                   eventDetails?.extendedProps?.address ||
                   '';

  const address2 = eventDetails?.extendedProps?.venue?.address2 ||
                   eventDetails?.extendedProps?.address2 ||
                   '';

  const city = eventDetails?.extendedProps?.venue?.city ||
               eventDetails?.extendedProps?.city ||
               '';

  const state = eventDetails?.extendedProps?.venue?.state ||
                eventDetails?.extendedProps?.state ||
                '';

  const zip = eventDetails?.extendedProps?.venue?.zip ||
              eventDetails?.extendedProps?.zip ||
              '';

  const phone = eventDetails?.extendedProps?.venue?.phone ||
                eventDetails?.extendedProps?.phone ||
                '';

  const comments = eventDetails?.extendedProps?.venue?.comments ||
                   eventDetails?.extendedProps?.venueDescription ||
                   eventDetails?.extendedProps?.locationDescription ||
                   '';

  // Get coordinates if available for map link
  const latitude = eventDetails?.extendedProps?.venue?.latitude ||
                   eventDetails?.extendedProps?.latitude ||
                   null;

  const longitude = eventDetails?.extendedProps?.venue?.longitude ||
                    eventDetails?.extendedProps?.longitude ||
                    null;

  // Check if we have any venue image
  const venueImage = eventDetails?.extendedProps?.venue?.image ||
                    eventDetails?.extendedProps?.venueImage ||
                    null;

  // Format full address
  const fullAddress = [
    address1,
    address2,
    `${city}${state ? `, ${state}` : ''}${zip ? ` ${zip}` : ''}`
  ].filter(Boolean).join(', ');

  // Generate Google Maps link if coordinates are available
  const mapLink = latitude && longitude ?
    `https://www.google.com/maps?q=${latitude},${longitude}` :
    fullAddress ?
      `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}` :
      null;

  // Check if we have any venue data at all to determine what to display
  const hasVenueData = venueID || venueName !== 'Venue not specified' || fullAddress;

  if (!hasVenueData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No venue information available
        </Typography>
        <Typography variant="body2" color="textSecondary">
          This event doesn't have any specified venue details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Venue Name Header */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
        {venueName}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        {/* Venue Image - if available */}
        {venueImage && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                  overflow: 'hidden',
                  borderRadius: '4px'
                }}
              >
                <Image
                  src={venueImage}
                  alt={venueName}
                  width={300}
                  height={200}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.src = '/TangoQuestion.jpg'; // Fallback image
                    e.target.style.objectFit = 'contain';
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Venue Address and Details */}
        <Grid item xs={12} md={venueImage ? 6 : 12}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              Address & Contact
            </Typography>

            {fullAddress && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  {address1}
                </Typography>
                {address2 && (
                  <Typography variant="body1" gutterBottom>
                    {address2}
                  </Typography>
                )}
                <Typography variant="body1" gutterBottom>
                  {city}{state ? `, ${state}` : ''}{zip ? ` ${zip}` : ''}
                </Typography>

                {mapLink && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3f51b5',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                      }}
                    >
                      <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                      View on Map
                    </a>
                  </Typography>
                )}
              </Box>
            )}

            {phone && (
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {phone}
              </Typography>
            )}

            {venueID && typeof venueID !== 'undefined' && (
              <Chip
                label={`Venue ID: ${String(venueID || '').substring(0, 8)}...`}
                size="small"
                sx={{ mt: 2, bgcolor: 'rgba(63, 81, 181, 0.1)' }}
              />
            )}
          </Paper>
        </Grid>

        {/* Venue Description - if available */}
        {comments && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                About this Venue
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {comments}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

ViewEventDetailsVenueOther.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      // Support both venue and legacy location fields
      venueID: PropTypes.string,
      venueName: PropTypes.string,
      locationID: PropTypes.string,
      locationName: PropTypes.string,
      venue: PropTypes.shape({
        address1: PropTypes.string,
        address2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        phone: PropTypes.string,
        comments: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        image: PropTypes.string,
      }),
      // Legacy or flattened fields
      address: PropTypes.string,
      address1: PropTypes.string,
      address2: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
      phone: PropTypes.string,
      venueDescription: PropTypes.string,
      locationDescription: PropTypes.string,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      venueImage: PropTypes.string,
    }),
  }),
};

export default ViewEventDetailsVenueOther;
