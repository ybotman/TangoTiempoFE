import React, { useState, useEffect, useContext } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, useTheme, useMediaQuery } from '@mui/material';
import NextImage from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useEventOperations } from '@/hooks/useEvents';
import ViewEventDetailsBasic from './ViewEventDetailsBasic';
import ViewEventDetailsImage from './ViewEventDetailsImage';
import ViewEventDetailsOrganizer from './ViewEventDetailsOrganizer';
import ViewEventDetailsVenue from './ViewEventDetailsVenue';
// Legacy component removed as part of transition
import PropTypes from 'prop-types';
import { categoryColors } from '@/utils/categoryColors';
import ModalHeader from '@/components/UI/ModalHeader';

const getModalStyle = (isMobile) => ({
  position: isMobile ? 'fixed' : 'absolute',
  top: isMobile ? 0 : '50%',
  left: isMobile ? 0 : '50%',
  transform: isMobile ? 'none' : 'translate(-50%, -50%)',
  width: isMobile ? '100vw' : '90%',
  maxWidth: isMobile ? '100%' : '600px',
  height: isMobile ? '100vh' : 'auto',
  maxHeight: isMobile ? '100vh' : '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 1300,
  ...(isMobile && {
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  }),
});

const ViewEventDetailModal = ({ open, onClose, eventDetails, onEventUpdated }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [imageSrc, setImageSrc] = useState(null);
  const [showImageTab, setShowImageTab] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get user context to check permissions
  const { user } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);
  const { deleteEvent } = useEventOperations();

  useEffect(() => {
    if (open) {
      setCurrentTab('Basic');
    }
  }, [open]);

  useEffect(() => {
    // Try to use the event image if available
    if (eventDetails?.extendedProps?.eventImage) {
      const img = new Image();
      img.src = eventDetails.extendedProps.eventImage;

      img.onload = function () {
        setImageSrc(eventDetails.extendedProps.eventImage);
        setShowImageTab(true);
      };

      // Handle image load error - try fallback image if available
      img.onerror = function() {
        console.log('Primary image failed to load, trying fallback');
        
        // Try event-specific fallback if available
        if (eventDetails?.extendedProps?.fallbackImageUrl) {
          const fallbackImg = new Image();
          fallbackImg.src = eventDetails.extendedProps.fallbackImageUrl;
          
          fallbackImg.onload = function() {
            setImageSrc(eventDetails.extendedProps.fallbackImageUrl);
            setShowImageTab(true);
          };
          
          fallbackImg.onerror = function() {
            // If both primary and fallback fail, use the default question image
            console.log('Fallback image also failed, using default');
            setImageSrc('/TangoQuestion.jpg');
            setShowImageTab(true);
          };
        } else {
          // No fallback provided, use default
          setImageSrc('/TangoQuestion.jpg');
          setShowImageTab(true);
        }
      };
    } else {
      // No image provided at all
      setImageSrc('/TangoQuestion.jpg');
      setShowImageTab(true);
    }
  }, [eventDetails]);

  if (!eventDetails) {
    return null;
  }

  const eventTitle = eventDetails?.title || 'Event Details';
  const eventShortTitle = eventDetails?.extendedProps?.shortTitle || eventTitle;
  
  // Get dates with proper timezone handling
  // Use the direct start/end dates as they have the correct time
  // The _instance.range dates have timezone offset issues
  const startDate = eventDetails?.start || eventDetails?._instance?.range?.start || null;
  const endDate = eventDetails?.end || eventDetails?._instance?.range?.end || null;
  const allDay = eventDetails?.allDay || false;

  // Get category information for display
  const categoryFirst = eventDetails?.extendedProps?.categoryFirst;
  const categorySecond = eventDetails?.extendedProps?.categorySecond;
  const categoryThird = eventDetails?.extendedProps?.categoryThird;

  // Function to render category chips with colors
  const renderCategoryChips = () => {
    const categories = [categoryFirst, categorySecond, categoryThird].filter(Boolean);
    
    if (categories.length === 0) return null;

    return (
      <Box display="flex" gap={1} sx={{ mt: 1, mb: 1 }}>
        {categories.map((category, index) => {
          const color = categoryColors[category] || 'lightGrey';
          return (
            <Chip
              key={index}
              label={category}
              sx={{
                backgroundColor: color,
                color: '#000000', // Black text for better readability
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
              size="small"
            />
          );
        })}
      </Box>
    );
  };

  
  // Check if the user has permissions to edit and delete this event
  // User must be logged in, the event must have an owner ID, and the user must have the RegionalOrganizer role
  // OR be a RegionalAdmin with the event's city in their adminCities
  const isRegionalOrganizer = user &&
                              eventDetails?.extendedProps?.ownerOrganizerID &&
                              selectedRole === 'RegionalOrganizer';
  
  // For Regional Admin, only check localAdminInfo allowed cities
  const raAllowedCities = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || [];
  
  const isRegionalAdmin = user &&
                          selectedRole === 'RegionalAdmin' &&
                          raAllowedCities.length > 0 &&
                          eventDetails?.extendedProps?.venueMasteredCityID &&
                          raAllowedCities.includes(eventDetails.extendedProps.venueMasteredCityID);
  
  // Debug logging for RA permissions
  if (selectedRole === 'RegionalAdmin') {
    console.log('RA Permission Debug:', {
      selectedRole,
      hasUser: !!user,
      raAllowedCities,
      allowedCitiesFromLocalAdmin: user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds,
      eventVenueMasteredCityID: eventDetails?.extendedProps?.venueMasteredCityID,
      isIncluded: raAllowedCities.includes(eventDetails?.extendedProps?.venueMasteredCityID),
      isRegionalAdmin
    });
  }
  
  const canEditEvent = isRegionalOrganizer || isRegionalAdmin;
  
  // Get truncated description for the delete confirmation
  const truncatedDescription = eventDetails?.extendedProps?.description 
    ? eventDetails.extendedProps.description.substring(0, 20) + (eventDetails.extendedProps.description.length > 20 ? '...' : '')
    : 'No description';
    
  // Handle opening the delete confirmation dialog
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  // Handle the actual deletion
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (!eventDetails?.extendedProps?._id) {
        throw new Error('Event ID not found');
      }
      
      await deleteEvent(eventDetails.extendedProps._id);
      
      // Close both dialog and modal
      setDeleteDialogOpen(false);
      onClose();
      
      // Refresh the events list if callback provided
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle edit button click
  const handleEditClick = () => {
    // Close this view modal and open the edit modal in the parent component
    onClose();
    if (onEventUpdated) {
      onEventUpdated('edit', eventDetails.extendedProps._id);
    }

    // Note: We no longer use the internal edit mode since we open the proper edit modal
  };

  // No longer needed - editMode is handled by parent component

  // Create header actions for edit/delete buttons
  const headerActions = canEditEvent ? (
    <>
      <Button
        onClick={handleEditClick}
        size="small"
        startIcon={<EditIcon fontSize="small" />}
        sx={{ fontSize: '0.875rem' }}
      >
        Edit
      </Button>
      <Button
        onClick={handleDeleteClick}
        size="small"
        color="error"
        startIcon={<DeleteIcon fontSize="small" />}
        sx={{ fontSize: '0.875rem' }}
      >
        Delete
      </Button>
    </>
  ) : (selectedRole === 'RegionalAdmin' ? (
    <Typography 
      variant="caption" 
      color="text.secondary"
      sx={{ 
        fontStyle: 'italic',
        fontSize: '0.75rem',
        px: 2
      }}
    >
      {eventDetails?.extendedProps?.masteredCityName || 'City'} - not in your assigned cities
    </Typography>
  ) : null);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={getModalStyle(isMobile)}>
          {/* Modal Header */}
          <ModalHeader 
            title={eventShortTitle} 
            onClose={onClose}
            actions={headerActions}
          />
          
          {/* Modal Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            p: isMobile ? 2 : 3 
          }}>
            {/* Full Title Display (if different from short title) */}
            {eventShortTitle !== eventTitle && (
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
                {eventTitle}
              </Typography>
            )}
            
            {/* Date Display */}
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {startDate && startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>

          {/* Category Display */}
          {renderCategoryChips()}

          {/* Time Range */}
          {!allDay && startDate && endDate && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" color="textSecondary">
                  <strong>
                    {(() => {
                      // Use the already-converted startDate
                      const hours = startDate.getHours();
                      const minutes = startDate.getMinutes();
                      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                      const suffix = hours >= 12 ? 'p' : 'a';
                      return `${displayHours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}${suffix}`;
                    })()}
                  </strong>
                  {'-'}
                  {(() => {
                    // Use the already-converted endDate
                    const hours = endDate.getHours();
                    const minutes = endDate.getMinutes();
                    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                    const suffix = hours >= 12 ? 'p' : 'a';
                    return `${displayHours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}${suffix}`;
                  })()}
                </Typography>
                <ArrowForwardIcon sx={{ color: 'red', ml: 1, fontSize: '1.2rem' }} />
              </Box>
            </Box>
          )}

          {/* Image */}
          {imageSrc && showImageTab && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <NextImage
                src={imageSrc}
                alt="Event"
                height={300}
                width={500} // Adjust as needed
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}

          {/* Tabs */}
          <Tabs 
            value={currentTab} 
            onChange={(_, value) => setCurrentTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTabs-scrollableX': {
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              },
              '& .MuiTabs-scroller': {
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }
            }}
          >
            <Tab label="Basic" value="Basic" />
            <Tab label="Venue" value="Venue" />
            <Tab label="Organizer" value="Organizer" />
            <Tab label="Images" value="Images" />
          </Tabs>

          {/* Tab Content */}
          {currentTab === 'Basic' && <ViewEventDetailsBasic eventDetails={eventDetails} />}
          {currentTab === 'Images' && <ViewEventDetailsImage eventDetails={eventDetails} />}
          {currentTab === 'Organizer' && <ViewEventDetailsOrganizer eventDetails={eventDetails} />}
          {currentTab === 'Venue' && <ViewEventDetailsVenue eventDetails={eventDetails} />}
          </Box>
        </Box>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to delete the following event:
            <br /><br />
            <strong>Title:</strong> {eventTitle}
            <br />
            <strong>Date:</strong> {startDate && new Date(startDate).toLocaleDateString()}
            <br />
            <strong>Category:</strong> {eventDetails?.extendedProps?.categoryFirst || 'Not specified'}
            <br />
            <strong>Description:</strong> {truncatedDescription}
            <br /><br />
            This action cannot be undone. Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ViewEventDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEventUpdated: PropTypes.func,
  eventDetails: PropTypes.shape({
    title: PropTypes.string,
    allDay: PropTypes.bool,
    extendedProps: PropTypes.shape({
      _id: PropTypes.string,
      eventImage: PropTypes.string,
      fallbackImageUrl: PropTypes.string,
      description: PropTypes.string,
      categoryFirst: PropTypes.string,
      categorySecond: PropTypes.string,
      categoryThird: PropTypes.string,
      ownerOrganizerID: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
    }),
    _instance: PropTypes.shape({
      range: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
      }),
    }),
  }),
};

export default ViewEventDetailModal;
