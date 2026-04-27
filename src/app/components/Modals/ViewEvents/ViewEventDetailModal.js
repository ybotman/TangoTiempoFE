import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Box, Typography, Tabs, Tab, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, useTheme, useMediaQuery, Snackbar, IconButton } from '@mui/material';
import NextImage from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import RepeatIcon from '@mui/icons-material/Repeat';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { useEventOperations } from '@/hooks/useEvents';
// TIEMPO-239: Import venue timezone utilities
import { formatVenueTimeRange, formatVenueDate } from '@/utils/venueTimezone';
import ViewEventDetailsBasic from './ViewEventDetailsBasic';
import ViewEventDetailsImage from './ViewEventDetailsImage';
import ViewEventDetailsOrganizer from './ViewEventDetailsOrganizer';
import ViewEventDetailsVenue from './ViewEventDetailsVenue';
// TIEMPO-362: Instance override components (OccurrenceActionMenu removed - now in calendar submenu)
import CancelOccurrenceDialog from './CancelOccurrenceDialog';
import EditOccurrenceModal from './EditOccurrenceModal';
import OccurrenceDatePicker from './OccurrenceDatePicker';
import { cancelOccurrence, createOverride, addExcludedDate } from '@/services/eventOverrides';
import { uploadEventImage } from '@/utils/uploadEventImages';
import PropTypes from 'prop-types';
import { categoryColors } from '@/utils/categoryColors';
import ModalHeader from '@/components/UI/ModalHeader';
import { format, addMonths, startOfDay } from 'date-fns';
import { RRule } from 'rrule';

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

const ViewEventDetailModal = ({ open, onClose, eventDetails, onEventUpdated, initialAction }) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [imageSrc, setImageSrc] = useState(null);
  const [showImageTab, setShowImageTab] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // TIEMPO-256: Share functionality state
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);

  // TIEMPO-362: Instance override state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editOccurrenceOpen, setEditOccurrenceOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState(null);
  const [isOverrideLoading, setIsOverrideLoading] = useState(false);
  // Track if we've handled the initial action to prevent re-triggering
  const [initialActionHandled, setInitialActionHandled] = useState(false);
  // Track current date index for navigation arrows
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  // Track if user has navigated via arrows (to know when to use index vs clicked date)
  const [hasNavigatedDates, setHasNavigatedDates] = useState(false);
  
  // Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get user context to check permissions and get auth token
  const { user, getIdToken } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);
  const { deleteEvent } = useEventOperations();

  // TIEMPO-362: Extract recurrence info for navigation (must be before early return)
  const recurrenceRule = eventDetails?.extendedProps?.recurrenceRule;
  // Use displayStartTime (venue local time, no Z) to match how FullCalendar renders events
  // This ensures instanceKeys match between save and display
  const venueDisplayStartTime = eventDetails?.extendedProps?.displayStartTime;
  const eventStartDate = eventDetails?.extendedProps?.originalStartDate || eventDetails?.start;

  // Calculate all upcoming occurrence dates for navigation (must be before early return)
  const occurrenceDates = useMemo(() => {
    if (!recurrenceRule) return [];
    // Prefer venue display time (same format FullCalendar uses), fallback to eventStartDate
    const dtstartSource = venueDisplayStartTime || eventStartDate;
    if (!dtstartSource) return [];

    try {
      // TIEMPO-362: Use the same DTSTART format as transformEvents.js
      // If venueDisplayStartTime is available, it's already in "YYYY-MM-DDTHH:mm:ss" format (no Z)
      // This matches how FullCalendar's rrule plugin generates occurrences
      let rruleStr;
      if (venueDisplayStartTime && typeof venueDisplayStartTime === 'string' && !venueDisplayStartTime.endsWith('Z')) {
        // Use venue time directly - already in correct format
        const dtStartFormatted = venueDisplayStartTime.replace(/[-:]/g, '').replace('T', 'T').substring(0, 15);
        rruleStr = `DTSTART:${dtStartFormatted}\nRRULE:${recurrenceRule}`;
      } else {
        // Fallback: parse as Date and format
        const dtstart = new Date(dtstartSource);
        rruleStr = `DTSTART:${format(dtstart, "yyyyMMdd'T'HHmmss")}\nRRULE:${recurrenceRule}`;
      }
      const rule = RRule.fromString(rruleStr);

      // Get occurrences: from event's original start to 6 months from now
      // TIEMPO-388: Use dtstart (not today) to include past dates for navigation
      const now = new Date();
      const dtstart = new Date(dtstartSource);
      const endRange = addMonths(now, 6);

      return rule.between(dtstart, endRange, true).slice(0, 52); // Max 52 weeks
    } catch {
      return [];
    }
  }, [recurrenceRule, venueDisplayStartTime, eventStartDate]);

  // TIEMPO-362: Look up override for the currently navigated date
  // Must be before early return to satisfy Rules of Hooks
  const currentOverrideValues = useMemo(() => {
    // When user hasn't navigated via arrows, use clicked date; otherwise use index
    const navDate = hasNavigatedDates
      ? (occurrenceDates[currentDateIndex] || selectedOccurrenceDate || eventDetails?._instance?.range?.start || eventDetails?.start)
      : (selectedOccurrenceDate || eventDetails?._instance?.range?.start || eventDetails?.start);

    if (!navDate) return { _hasOverride: false, _overridePatch: null };

    const overrides = eventDetails?.extendedProps?.instanceOverrides || [];
    if (overrides.length === 0) return { _hasOverride: false, _overridePatch: null };

    // Find override matching the current navigated date
    const navDateStr = format(new Date(navDate), 'yyyy-MM-dd');
    const matchingOverride = overrides.find(ov => {
      if (!ov.instanceKey) return false;
      const ovDateStr = format(new Date(ov.instanceKey), 'yyyy-MM-dd');
      return ovDateStr === navDateStr;
    });

    if (matchingOverride) {
      return {
        _hasOverride: true,
        _overrideType: matchingOverride.overrideType,
        _overridePatch: matchingOverride.patch || {}
      };
    }

    return { _hasOverride: false, _overridePatch: null };
  }, [hasNavigatedDates, currentDateIndex, occurrenceDates, selectedOccurrenceDate, eventDetails]);

  // TIEMPO-362: Define occurrenceDate early (before useEffects that depend on it)
  // Get the specific occurrence date from FullCalendar's instance data or selected date
  const occurrenceDate = selectedOccurrenceDate ||
                        eventDetails?._instance?.range?.start ||
                        eventDetails?.start;

  useEffect(() => {
    if (open) {
      setCurrentTab('Basic');
      setInitialActionHandled(false); // Reset when modal opens
      // TIEMPO-388: Reset occurrence state to prevent stale date from previous edits
      setSelectedOccurrenceDate(null);
      setHasNavigatedDates(false);
      setCurrentDateIndex(0);
    }
  }, [open]);

  // TIEMPO-362: Handle initial action from calendar submenu
  useEffect(() => {
    if (open && initialAction && !initialActionHandled && eventDetails) {
      setInitialActionHandled(true);
      setHasNavigatedDates(false); // Reset navigation state
      // Trigger the appropriate action based on what was selected in the submenu
      // TIEMPO-438: 'spotlightOccurrence' (SL recurring) reuses the same modal
      // as 'editOccurrence'; the role prop on EditOccurrenceModal gates image
      // upload + non-spotlight surfaces.
      if (initialAction === 'editOccurrence' || initialAction === 'spotlightOccurrence') {
        setEditOccurrenceOpen(true);
      } else if (initialAction === 'cancelOccurrence') {
        setCancelDialogOpen(true);
      } else if (initialAction === 'seeAllDates') {
        setDatePickerOpen(true);
      }
    }
  }, [open, initialAction, initialActionHandled, eventDetails]);

  // TIEMPO-362: Set current date index when modal opens with occurrence dates
  useEffect(() => {
    if (occurrenceDates.length > 0 && occurrenceDate) {
      const clickedDateStr = format(new Date(occurrenceDate), 'yyyy-MM-dd');
      const index = occurrenceDates.findIndex(d =>
        format(d, 'yyyy-MM-dd') === clickedDateStr
      );
      setCurrentDateIndex(index >= 0 ? index : 0);
    }
  }, [occurrenceDates, occurrenceDate]);

  useEffect(() => {
    // TIEMPO-264: Clear image state when event changes to prevent carryover
    setImageSrc(null);
    setShowImageTab(false);

    // TIEMPO-388: Also reset occurrence state when switching events
    // This handles cases where user clicks different dates of same recurring series
    setSelectedOccurrenceDate(null);
    setHasNavigatedDates(false);

    // Try to use the event image if available
    if (eventDetails?.extendedProps?.eventImage) {
      const img = new Image();
      img.src = eventDetails.extendedProps.eventImage;

      img.onload = function () {
        setImageSrc(eventDetails.extendedProps.eventImage);
        setShowImageTab(true);
      };

      img.onerror = function() {
        // Try fallback if available
        if (eventDetails?.extendedProps?.fallbackImageUrl) {
          const fallbackImg = new Image();
          fallbackImg.src = eventDetails.extendedProps.fallbackImageUrl;

          fallbackImg.onload = function() {
            setImageSrc(eventDetails.extendedProps.fallbackImageUrl);
            setShowImageTab(true);
          };

          fallbackImg.onerror = function() {
            setImageSrc(null);
            setShowImageTab(false);
          };
        } else {
          setImageSrc(null);
          setShowImageTab(false);
        }
      };
    } else {
      setImageSrc(null);
      setShowImageTab(false);
    }
  }, [eventDetails]);

  if (!eventDetails) {
    return null;
  }

  const eventTitle = eventDetails?.title || 'Event Details';
  const eventShortTitle = eventDetails?.extendedProps?.shortTitle || eventTitle;
  
  // TIEMPO-239: Get venue timezone display information
  const hasVenueTimezone = eventDetails?.extendedProps?.hasVenueTimezone;
  const venueStartDisplay = eventDetails?.extendedProps?.venueStartDisplay;
  const venueEndDisplay = eventDetails?.extendedProps?.venueEndDisplay;
  const timezoneAbbr = eventDetails?.extendedProps?.timezoneAbbr || '';

  // Use display times if available, otherwise fallback to event dates
  // For now, use venueStartDisplay directly if available, regardless of hasVenueTimezone flag
  const startDate = venueStartDisplay
    ? venueStartDisplay
    : (eventDetails?.start || eventDetails?._instance?.range?.start || null);
  const endDate = venueEndDisplay
    ? venueEndDisplay
    : (eventDetails?.end || eventDetails?._instance?.range?.end || null);
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
  
  // Extract city ID from event - handle both object and string formats
  const eventCityId = eventDetails?.extendedProps?.masteredCityId?._id || 
                     eventDetails?.extendedProps?.masteredCityId ||
                     eventDetails?.extendedProps?.venueMasteredCityID ||  // TIEMPO-195: Add missing field
                     eventDetails?.extendedProps?.venueMasteredCityId;
  
  const isRegionalAdmin = user &&
                          selectedRole === 'RegionalAdmin' &&
                          raAllowedCities.length > 0 &&
                          eventCityId &&
                          raAllowedCities.some(city => {
                            if (typeof city === 'string') {
                              return city === eventCityId;
                            } else if (city && typeof city === 'object') {
                              return city._id === eventCityId || city.id === eventCityId;
                            }
                            return false;
                          });
  
  // RA permission logging removed - was too noisy
  
  const canEditEvent = isRegionalOrganizer || isRegionalAdmin;

  // TIEMPO-362: Detect recurring event and capture occurrence date
  const isRecurringEvent = eventDetails?.extendedProps?.isRecurring ||
                          eventDetails?.extendedProps?.recurrenceRule;

  // Note: occurrenceDate is defined earlier (before useEffects that depend on it)

  // Format occurrence date for display
  const formattedOccurrenceDate = occurrenceDate
    ? format(new Date(occurrenceDate), 'EEEE, MMMM d, yyyy')
    : null;
  
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

      // Refresh the events list BEFORE closing modal
      // (onClose unmounts this component, so refresh must fire first)
      if (onEventUpdated) {
        onEventUpdated();
      }

      // Close both dialog and modal
      setDeleteDialogOpen(false);
      onClose();
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

  // TIEMPO-362: Handle date selection from picker (occurrence handlers removed - now triggered via initialAction)
  const handleDateSelected = (date) => {
    setSelectedOccurrenceDate(date);
    setDatePickerOpen(false);
    // After selecting a date, user can choose action from menu
  };

  // TIEMPO-362: Navigation handlers for EditOccurrenceModal arrows
  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      const newIndex = currentDateIndex - 1;
      setCurrentDateIndex(newIndex);
      setSelectedOccurrenceDate(occurrenceDates[newIndex]);
      setHasNavigatedDates(true);
    }
  };

  const handleNextDate = () => {
    if (currentDateIndex < occurrenceDates.length - 1) {
      const newIndex = currentDateIndex + 1;
      setCurrentDateIndex(newIndex);
      setSelectedOccurrenceDate(occurrenceDates[newIndex]);
      setHasNavigatedDates(true);
    }
  };

  // Get the current navigated date (for EditOccurrenceModal)
  // When user hasn't navigated via arrows, use the clicked date directly
  // This fixes the issue where the first render shows wrong date
  const currentNavigatedDate = hasNavigatedDates
    ? (occurrenceDates[currentDateIndex] || occurrenceDate)
    : (selectedOccurrenceDate || occurrenceDate);

  const handleConfirmCancel = async (reason) => {
    if (!eventDetails?.extendedProps?._id || !occurrenceDate) return;

    try {
      setIsOverrideLoading(true);
      // Get Firebase auth token
      const token = await getIdToken(true);
      await cancelOccurrence(
        eventDetails.extendedProps._id,
        occurrenceDate,
        token,
        reason
      );

      // Refresh events and close
      if (onEventUpdated) {
        onEventUpdated('refresh');
      }
      setCancelDialogOpen(false);
      onClose();
    } catch (error) {
      console.error('Failed to cancel occurrence:', error);
      alert('Failed to cancel this date: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsOverrideLoading(false);
    }
  };

  const handleSaveOccurrenceEdit = async (overrideData) => {
    if (!eventDetails?.extendedProps?._id) return;

    try {
      setIsOverrideLoading(true);
      // Get Firebase auth token
      const token = await getIdToken(true);

      // TIEMPO-362: Handle 'exclude' differently - add to excludedDates (RRULE EXDATE)
      if (overrideData.overrideType === 'exclude') {
        await addExcludedDate(
          eventDetails.extendedProps._id,
          overrideData.instanceKey,
          token
        );
      } else {
        // TIEMPO-362: Upload override image first if present (two-step KISS flow)
        let patchToSave = { ...overrideData.patch };
        if (patchToSave.overrideImageFile) {
          const { imageUrl } = await uploadEventImage(patchToSave.overrideImageFile, token);
          patchToSave.overrideImage = imageUrl;
          delete patchToSave.overrideImageFile;
        }

        // Use createOverride for modify/cancel types
        await createOverride(
          eventDetails.extendedProps._id,
          {
            instanceKey: overrideData.instanceKey,
            overrideType: overrideData.overrideType,
            patch: patchToSave
          },
          token
        );
      }

      // Close edit modal first, then trigger refresh
      setEditOccurrenceOpen(false);

      // Refresh events - slight delay to ensure backend has committed
      setTimeout(() => {
        if (onEventUpdated) {
          onEventUpdated('refresh');
        }
        onClose();
      }, 300);
    } catch (error) {
      console.error('Failed to save occurrence edit:', error);
      alert('Failed to save changes: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsOverrideLoading(false);
    }
  };

  // TIEMPO-256: Handle share button click
  const handleShareClick = async () => {
    const eventId = eventDetails?.extendedProps?._id;
    if (!eventId) return;

    // Use current domain for share URL (supports multiple domains)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tangotiempo.com';
    const shareUrl = `${baseUrl}/event/${eventId}`;
    const shareTitle = eventDetails?.extendedProps?.shortTitle || eventDetails?.title || 'Tango Event';
    const shareText = `Check out this tango event: ${shareTitle}`;

    // Check if truly mobile (not just navigator.share support)
    // Desktop Safari has navigator.share but gives poor UX
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );

    // Use native share only on mobile devices
    if (isMobileDevice && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return; // Success - don't show snackbar
      } catch (err) {
        // User cancelled or error - fall through to clipboard
        if (err.name === 'AbortError') return; // User cancelled
      }
    }

    // Desktop and fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSnackbarOpen(true);
    } catch {
      // Final fallback - show URL in alert
      alert(`Share this link:\n${shareUrl}`);
    }
  };

  // No longer needed - editMode is handled by parent component

  // Create header actions - Share button for everyone, Edit/Delete for organizers
  // TIEMPO-362: Show OccurrenceActionMenu for recurring events
  const headerActions = (
    <>
      {/* TIEMPO-256: Share button - visible to all users */}
      <Button
        onClick={handleShareClick}
        size="small"
        startIcon={<ShareIcon fontSize="small" />}
        sx={{ fontSize: '0.875rem' }}
      >
        Share
      </Button>

      {/* TIEMPO-362: Actions removed from modal - now in calendar submenu */}
      {/* Edit/Delete buttons for users with permissions (non-recurring only) */}
      {canEditEvent && (
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
      )}

      {/* Message for Regional Admins viewing events outside their cities */}
      {!canEditEvent && selectedRole === 'RegionalAdmin' && (
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
      )}
    </>
  );

  return (
    <>
      <Modal open={open} onClose={onClose} data-testid="event-modal">
        <Box sx={getModalStyle(isMobile)} data-testid="event-modal-content">
          {/* Modal Header */}
          <ModalHeader
            title={eventShortTitle}
            onClose={onClose}
            actions={headerActions}
          />

          {/* TIEMPO-256: Shareable link display - dynamic domain */}
          {eventDetails?.extendedProps?._id && (
            <Box
              sx={{
                px: isMobile ? 2 : 3,
                py: 0.5,
                bgcolor: 'grey.100',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Share: {typeof window !== 'undefined' ? window.location.host : 'tangotiempo.com'}/event/{eventDetails.extendedProps._id}
              </Typography>
            </Box>
          )}

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
            
            {/* Date Display - only for non-recurring events (recurring shows date in the repeating bar) */}
            {!isRecurringEvent && (
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {startDate && (hasVenueTimezone
                  ? formatVenueDate(startDate)
                  : (() => {
                      // TIEMPO-246: String-based fallback without Date() conversion
                      // TIEMPO-239: Handle both Date objects and strings
                      const dateString = typeof startDate === 'string'
                        ? startDate
                        : startDate?.toISOString?.() || '';
                      const [datePart] = dateString.split('T');
                      if (!datePart) return '';
                      const [year, month, day] = datePart.split('-');
                      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'];
                      return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
                    })()
                )}
              </Typography>
            )}

          {/* Category Display */}
          {renderCategoryChips()}

          {/* Time Range */}
          {!allDay && startDate && endDate && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" color="textSecondary">
                  <strong>
                    {venueStartDisplay
                      ? formatVenueTimeRange(startDate, endDate, timezoneAbbr)
                      : (() => {
                          // TIEMPO-246: String-based time formatting without Date() conversion
                          const formatTimeString = (timeStr) => {
                            // Handle both Date objects and strings
                            const dateString = typeof timeStr === 'string' 
                              ? timeStr 
                              : timeStr?.toISOString?.() || '';
                            const [, timePart] = dateString.split('T');
                            if (!timePart) return '';
                            const [hour, minute] = timePart.split(':');
                            const hourNum = parseInt(hour, 10);
                            const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                            const suffix = hourNum >= 12 ? 'p' : 'a';
                            return `${displayHour}${parseInt(minute, 10) > 0 ? `:${minute}` : ''}${suffix}`;
                          };
                          return `${formatTimeString(startDate)} - ${formatTimeString(endDate)}`;
                        })()
                    }
                  </strong>
                </Typography>
                <ArrowForwardIcon sx={{ color: 'red', ml: 1, fontSize: '1.2rem' }} />
              </Box>
            </Box>
          )}

          {/* Image - TIEMPO-362: Override image takes priority over event image */}
          {(() => {
            const overrideImg = currentOverrideValues?._overridePatch?.overrideImage;
            const displayImage = overrideImg || imageSrc;
            const shouldShow = displayImage && (overrideImg || showImageTab);

            return shouldShow ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <NextImage
                  src={displayImage}
                  alt="Event"
                  height={300}
                  width={500}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            ) : null;
          })()}

          {/* TIEMPO-362: Recurring event indicator - below image, above tabs */}
          {isRecurringEvent && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.200',
                borderRadius: 1,
                px: { xs: 0.5, sm: 1.5 },
                py: 0.75,
                mb: 1
              }}
            >
              {/* Prev arrow */}
              <IconButton
                onClick={handlePrevDate}
                disabled={currentDateIndex <= 0}
                size="small"
                sx={{
                  color: 'info.main',
                  '&.Mui-disabled': { color: 'grey.300' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              {/* Center content */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center', minWidth: 0 }}>
                <RepeatIcon fontSize="small" color="info" sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Typography
                  variant="body2"
                  color="info.dark"
                  sx={{
                    textAlign: 'center',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {isMobile ? (
                    formattedOccurrenceDate ? format(new Date(currentNavigatedDate), 'EEE, MMM d') : 'Repeating'
                  ) : (
                    <>
                      Repeating Event
                      {formattedOccurrenceDate && (
                        <> &mdash; <strong>{format(new Date(currentNavigatedDate), 'EEE, MMM d, yyyy')}</strong></>
                      )}
                    </>
                  )}
                </Typography>
              </Box>

              {/* Next arrow */}
              <IconButton
                onClick={handleNextDate}
                disabled={currentDateIndex >= occurrenceDates.length - 1}
                size="small"
                sx={{
                  color: 'info.main',
                  '&.Mui-disabled': { color: 'grey.300' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
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
          {currentTab === 'Basic' && <ViewEventDetailsBasic eventDetails={eventDetails} overrideData={currentOverrideValues} />}
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
        <DialogTitle>
          {isRecurringEvent ? 'Delete Entire Series?' : 'Confirm Delete'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {isRecurringEvent ? (
              <>
                <strong style={{ color: '#d32f2f' }}>
                  You are about to permanently delete this ENTIRE RECURRING SERIES.
                </strong>
                <br /><br />
                <strong>Title:</strong> {eventTitle}
                <br />
                <strong>Category:</strong> {eventDetails?.extendedProps?.categoryFirst || 'Not specified'}
                <br /><br />
                <strong style={{ color: '#d32f2f' }}>
                  This will delete ALL past and future dates in this series.
                  You cannot bring it back &mdash; it will be like it never existed.
                </strong>
                <br /><br />
                <em>Tip: To cancel just one date, use &quot;Edit This Date&quot; and select &quot;Tonight: Canceled&quot; instead.</em>
              </>
            ) : (
              <>
                You are about to delete the following event:
                <br /><br />
                <strong>Title:</strong> {eventTitle}
                <br />
                <strong>Date:</strong> {startDate && (hasVenueTimezone
                  ? formatVenueDate(startDate)
                  : (typeof startDate === 'string' ? startDate : startDate?.toISOString?.() || '').split('T')[0])}
                <br />
                <strong>Category:</strong> {eventDetails?.extendedProps?.categoryFirst || 'Not specified'}
                <br />
                <strong>Description:</strong> {truncatedDescription}
                <br /><br />
                This action cannot be undone. Are you sure you want to delete this event?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? 'Deleting...' : (isRecurringEvent ? 'Delete Entire Series' : 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TIEMPO-256: Share link copied snackbar - more visible */}
      <Snackbar
        open={shareSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setShareSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 4,
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          <ShareIcon fontSize="small" />
          Event link copied to clipboard!
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setShareSnackbarOpen(false)}
            sx={{ ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Snackbar>

      {/* TIEMPO-362: Cancel Occurrence Dialog */}
      <CancelOccurrenceDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        eventTitle={eventTitle}
        occurrenceDate={occurrenceDate}
        isLoading={isOverrideLoading}
      />

      {/* TIEMPO-362 + TIEMPO-438: Edit Occurrence Modal — RO sees full edit,
          SL gets the spotlight-only subset (image tab hidden) via role prop */}
      <EditOccurrenceModal
        open={editOccurrenceOpen}
        onClose={() => setEditOccurrenceOpen(false)}
        onSave={handleSaveOccurrenceEdit}
        eventTitle={eventTitle}
        occurrenceDate={currentNavigatedDate}
        currentValues={currentOverrideValues}
        isLoading={isOverrideLoading}
        role={selectedRole}
        // Date navigation props
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        hasPrevDate={currentDateIndex > 0}
        hasNextDate={currentDateIndex < occurrenceDates.length - 1}
      />

      {/* TIEMPO-362: Date Picker for "See All Dates" */}
      <OccurrenceDatePicker
        open={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          // If opened via "See All Dates" from calendar submenu, close entire modal
          if (initialAction === 'seeAllDates') {
            onClose();
          }
        }}
        onSelectDate={handleDateSelected}
        eventTitle={eventTitle}
        recurrenceRule={recurrenceRule}
        startDate={eventDetails?.extendedProps?.originalStartDate || eventDetails?.start}
        instanceOverrides={eventDetails?.extendedProps?.instanceOverrides || []}
        excludedDates={eventDetails?.extendedProps?.excludedDates || []}
      />

    </>
  );
};

ViewEventDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEventUpdated: PropTypes.func,
  // TIEMPO-362: Initial action from calendar submenu (editOccurrence, cancelOccurrence, seeAllDates)
  initialAction: PropTypes.oneOf(['editOccurrence', 'cancelOccurrence', 'seeAllDates', null]),
  eventDetails: PropTypes.shape({
    title: PropTypes.string,
    allDay: PropTypes.bool,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    extendedProps: PropTypes.shape({
      _id: PropTypes.string,
      eventImage: PropTypes.string,
      fallbackImageUrl: PropTypes.string,
      description: PropTypes.string,
      shortTitle: PropTypes.string,
      categoryFirst: PropTypes.string,
      categorySecond: PropTypes.string,
      categoryThird: PropTypes.string,
      hasVenueTimezone: PropTypes.bool,
      displayStartTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      displayEndTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      venueStartDisplay: PropTypes.string,
      venueEndDisplay: PropTypes.string,
      timezoneAbbr: PropTypes.string,
      ownerOrganizerID: PropTypes.string,
      ownerOrganizerName: PropTypes.string,
      masteredCityId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, id: PropTypes.string })
      ]),
      venueMasteredCityID: PropTypes.string,
      venueMasteredCityId: PropTypes.string,
      masteredCityName: PropTypes.string,
      // TIEMPO-362: Recurring event props
      isRecurring: PropTypes.bool,
      recurrenceRule: PropTypes.string,
      excludedDates: PropTypes.array,
      instanceOverrides: PropTypes.array,
      originalStartDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      _hasOverride: PropTypes.bool,
      _overrideType: PropTypes.string,
      _overridePatch: PropTypes.object,
      djName: PropTypes.string,
    }),
    _instance: PropTypes.shape({
      range: PropTypes.shape({
        start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      }),
    }),
  }),
};

export default ViewEventDetailModal;
