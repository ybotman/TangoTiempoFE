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
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useOrganizers } from '@/hooks/useOrganizers';
import axios from 'axios';

const ViewEventDetailsOrganizer = ({ eventDetails }) => {
  const [error, setError] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
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

  // Function to fetch upcoming events for the organizer
  const fetchUpcomingEvents = async (orgId) => {
    if (!orgId || orgId === '[object Object]') return;
    
    try {
      setEventsLoading(true);
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Look 6 months ahead
      
      const params = {
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
        organizerId: orgId,
        start: now.toISOString(),
        end: endDate.toISOString(),
        limit: 10 // Get up to 10 upcoming events
      };
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events`, {
        params,
        timeout: 15000
      });
      
      if (response.data && response.data.events) {
        console.log('Upcoming events data:', response.data.events);
        setUpcomingEvents(response.data.events);
      }
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      // Don't set error state for events - just log it
    } finally {
      setEventsLoading(false);
    }
  };

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
        // Fetch upcoming events for this organizer
        fetchUpcomingEvents(organizerObject._id);
        return;
      }

      if (!organizerId || organizerId === '[object Object]' || typeof organizerId !== 'string') {
        setError('No organizer information available for this event');
        return;
      }

      setError(null);
      try {
        await fetchOrganizerById(organizerId);
        // Fetch upcoming events after we have the organizer
        fetchUpcomingEvents(organizerId);
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
            src={displayOrganizer.organizerProfileImage || displayOrganizer.profileImageUrl}
            alt={displayOrganizer.fullName || displayOrganizer.name}
            sx={{ width: 80, height: 80 }}
          >
            {!displayOrganizer.organizerProfileImage && !displayOrganizer.profileImageUrl && <PersonIcon fontSize="large" />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" component="h2">
                {displayOrganizer.fullName || displayOrganizer.name || organizerName || 'Unknown Organizer'}
              </Typography>
              {displayOrganizer.isActive === false && (
                <Chip label="Inactive" size="small" color="warning" />
              )}
            </Box>
            {displayOrganizer.shortName && displayOrganizer.shortName !== displayOrganizer.fullName && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {displayOrganizer.shortName}
              </Typography>
            )}
            {displayOrganizer.organizerTypes && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {displayOrganizer.organizerTypes.isEventOrganizer && (
                  <Chip label="Event Organizer" size="small" color="primary" variant="outlined" />
                )}
                {displayOrganizer.organizerTypes.isVenue && (
                  <Chip label="Venue" size="small" color="secondary" variant="outlined" />
                )}
                {displayOrganizer.organizerTypes.isTeacher && (
                  <Chip label="Teacher" size="small" color="info" variant="outlined" />
                )}
                {displayOrganizer.organizerTypes.isDJ && (
                  <Chip label="DJ" size="small" color="success" variant="outlined" />
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Contact Information */}
        <List dense>
          {(displayOrganizer.publicContactInfo?.Email || displayOrganizer.email) && (
            <ListItem>
              <EmailIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link href={`mailto:${displayOrganizer.publicContactInfo?.Email || displayOrganizer.email}`} underline="hover">
                    {displayOrganizer.publicContactInfo?.Email || displayOrganizer.email}
                  </Link>
                }
              />
            </ListItem>
          )}

          {(displayOrganizer.publicContactInfo?.phone || displayOrganizer.phoneNumber) && (
            <ListItem>
              <PhoneIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link href={`tel:${displayOrganizer.publicContactInfo?.phone || displayOrganizer.phoneNumber}`} underline="hover">
                    {displayOrganizer.publicContactInfo?.phone || displayOrganizer.phoneNumber}
                  </Link>
                }
              />
            </ListItem>
          )}

          {(displayOrganizer.publicContactInfo?.url || displayOrganizer.website) && (
            <ListItem>
              <LanguageIcon color="action" sx={{ mr: 2 }} />
              <ListItemText
                primary={
                  <Link 
                    href={displayOrganizer.publicContactInfo?.url || displayOrganizer.website} 
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

      {/* Address Information */}
      {(displayOrganizer.publicContactInfo?.address || displayOrganizer.city || displayOrganizer.state) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon color="action" />
            <Typography variant="h6">Address</Typography>
          </Box>
          {displayOrganizer.publicContactInfo?.address ? (
            <Box>
              {displayOrganizer.publicContactInfo.address.street1 && (
                <Typography variant="body2">
                  {displayOrganizer.publicContactInfo.address.street1}
                </Typography>
              )}
              {displayOrganizer.publicContactInfo.address.street2 && (
                <Typography variant="body2">
                  {displayOrganizer.publicContactInfo.address.street2}
                </Typography>
              )}
              <Typography variant="body2">
                {[
                  displayOrganizer.publicContactInfo.address.city,
                  displayOrganizer.publicContactInfo.address.state,
                  displayOrganizer.publicContactInfo.address.postalCode
                ].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              {[displayOrganizer.city, displayOrganizer.state, displayOrganizer.country].filter(Boolean).join(', ')}
            </Typography>
          )}
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

      {/* Description */}
      {(displayOrganizer.description || displayOrganizer.bio) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            About the Organizer
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ 
              __html: (displayOrganizer.description || displayOrganizer.bio).replace(/\n/g, '<br>') 
            }}
          />
        </Paper>
      )}

      {/* Upcoming Events */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonthIcon color="action" />
          <Typography variant="h6">Upcoming Events</Typography>
        </Box>
        
        {eventsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : upcomingEvents.length > 0 ? (
          <List>
            {upcomingEvents.map((event, index) => {
              // Debug first event to see structure
              if (index === 0) {
                console.log('Event structure:', event);
              }
              return (
              <React.Fragment key={event._id || index}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2">
                          {event.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {(() => {
                              // API returns dates as 'startDate' field
                              const eventDate = event.startDate || event.start || event.date;
                              if (!eventDate) {
                                console.warn('No date field found for event:', event.title, {
                                  startDate: event.startDate,
                                  start: event.start,
                                  date: event.date
                                });
                                return 'Date not available';
                              }
                              
                              // TIEMPO-246: Format date and time without timezone conversion
                              const [datePart, timePart] = (eventDate || '').split('T');
                              if (!datePart) {
                                console.warn('Invalid date for event:', event.title, eventDate);
                                return 'Date not available';
                              }
                              
                              const [year, month, day] = datePart.split('-');
                              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              const dateStr = `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                              
                              if (timePart) {
                                const [hour, minute] = timePart.split(':');
                                const hourNum = parseInt(hour, 10);
                                const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                                const suffix = hourNum >= 12 ? 'PM' : 'AM';
                                return `${dateStr} at ${displayHour}:${minute} ${suffix}`;
                              }
                              return dateStr;
                            })()}
                          </Typography>
                        </Box>
                        {event.extendedProps?.venueName && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <LocationOnIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.extendedProps.venueName}
                            </Typography>
                          </Box>
                        )}
                        {event.extendedProps?.categoryFirst && (
                          <Chip 
                            label={event.extendedProps.categoryFirst} 
                            size="small" 
                            sx={{ mt: 0.5, height: 20 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < upcomingEvents.length - 1 && <Divider component="li" />}
              </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No upcoming events scheduled
          </Typography>
        )}
      </Paper>
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