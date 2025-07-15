'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Link,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useOrganizers } from '@/hooks/useOrganizers';

const ViewEventDetailsOrganizer = ({ eventDetails }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { organizer, fetchOrganizerById, fetchLoading } = useOrganizers();

  // Handle various ways organizer might be provided
  // 1. Check if organizer is directly populated
  const populatedOrganizer = eventDetails?.extendedProps?.ownerOrganizer || eventDetails?.extendedProps?.organizer;
  
  // 2. Check for organizer ID
  const organizerIdRaw = eventDetails?.extendedProps?.ownerOrganizerID;
  
  // 3. Extract ID if organizerID is an object
  const organizerId = typeof organizerIdRaw === 'object' ? organizerIdRaw?._id || organizerIdRaw?.id : organizerIdRaw;
  
  // 4. Get organizer name
  const organizerName = eventDetails?.extendedProps?.ownerOrganizerName;
  
  // 5. Determine if we have a populated organizer object
  const organizerObject = populatedOrganizer || (typeof organizerIdRaw === 'object' && organizerIdRaw !== null ? organizerIdRaw : null);

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      // Debug logging
      console.log('Organizer data debug:', {
        populatedOrganizer,
        organizerIdRaw: eventDetails?.extendedProps?.ownerOrganizerID,
        ownerOrganizer: eventDetails?.extendedProps?.ownerOrganizer,
        organizer: eventDetails?.extendedProps?.organizer,
        organizerId,
        organizerName,
        organizerObject,
        extendedProps: eventDetails?.extendedProps
      });

      // If organizer is already populated as an object, use it directly
      if (organizerObject && organizerObject._id) {
        // Since we're not using the hook's setOrganizer, we need to handle this differently
        return;
      }

      if (!organizerId || organizerId === '[object Object]' || typeof organizerId !== 'string') {
        setError('No organizer information available for this event');
        return;
      }

      setError(null);
      try {
        await fetchOrganizerById(organizerId);
      } catch (err) {
        console.error('Error fetching organizer details:', err);
        setError('Failed to load organizer details');
      }
    };

    fetchOrganizerDetails();
  }, [organizerId, fetchOrganizerById, eventDetails, organizerObject]);

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || (!organizerId && !organizerObject)) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info">
          {error || 'No organizer information available for this event'}
        </Alert>
      </Box>
    );
  }

  // Use the populated object if available, otherwise use the fetched organizer
  const displayOrganizer = organizerObject || organizer;

  // If we don't have detailed displayOrganizer data, show basic info
  if (!displayOrganizer) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Organizer: {organizerName || 'Unknown Organizer'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Detailed organizer information is being loaded...
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Organizer Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={displayOrganizer.profileImageUrl}
            alt={displayOrganizer.name}
            sx={{ width: 80, height: 80 }}
          >
            {!displayOrganizer.profileImageUrl && <PersonIcon fontSize="large" />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" component="h2">
                {displayOrganizer.name || organizerName || 'Unknown Organizer'}
              </Typography>
              {displayOrganizer.isActive === false && (
                <Chip label="Inactive" size="small" color="warning" />
              )}
            </Box>
            {displayOrganizer.displayOrganizerType && (
              <Chip 
                label={displayOrganizer.displayOrganizerType} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Contact Information */}
        <List dense>
          {displayOrganizer.email && (
            <ListItem>
              <EmailIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link href={`mailto:${displayOrganizer.email}`} underline="hover">
                    {displayOrganizer.email}
                  </Link>
                }
              />
            </ListItem>
          )}

          {displayOrganizer.phoneNumber && (
            <ListItem>
              <PhoneIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link href={`tel:${displayOrganizer.phoneNumber}`} underline="hover">
                    {displayOrganizer.phoneNumber}
                  </Link>
                }
              />
            </ListItem>
          )}

          {displayOrganizer.website && (
            <ListItem>
              <LanguageIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link 
                    href={displayOrganizer.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover"
                  >
                    Visit Website
                  </Link>
                }
              />
            </ListItem>
          )}

          {displayOrganizer.facebookUrl && (
            <ListItem>
              <FacebookIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link 
                    href={displayOrganizer.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover"
                  >
                    Facebook Page
                  </Link>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Location Information */}
      {(displayOrganizer.city || displayOrganizer.state || displayOrganizer.country) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon color="action" />
            <Typography variant="h6">Location</Typography>
          </Box>
          <Typography variant="body2">
            {[displayOrganizer.city, displayOrganizer.state, displayOrganizer.country].filter(Boolean).join(', ')}
          </Typography>
        </Paper>
      )}

      {/* Organizer Details */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Organizer Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List dense>
          <ListItem>
            <ListItemText
              primary="Organizer Since"
              secondary={formatDate(displayOrganizer.createdAt)}
            />
          </ListItem>

          {displayOrganizer.eventCount !== undefined && (
            <ListItem>
              <ListItemText
                primary="Total Events"
                secondary={displayOrganizer.eventCount}
              />
            </ListItem>
          )}

          {displayOrganizer.primaryLocationIds && displayOrganizer.primaryLocationIds.length > 0 && (
            <ListItem>
              <ListItemText
                primary="Primary Locations"
                secondary={`${displayOrganizer.primaryLocationIds.length} location(s)`}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Bio/Description */}
      {displayOrganizer.bio && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            About the Organizer
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {displayOrganizer.bio}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

ViewEventDetailsOrganizer.propTypes = {
  eventDetails: PropTypes.shape({
    extendedProps: PropTypes.shape({
      ownerOrganizerID: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
    }),
  }),
};

export default ViewEventDetailsOrganizer;