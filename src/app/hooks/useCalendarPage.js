// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: src/hooks/useCalendarPage.js
// Explanation:
// Currently, if nearestCity is null (not yet loaded), attempting to access nearestCity.regionName (and others) throws an error.
// We will add safe null checks by using optional chaining and defaults.
// No features are dropped. All existing code is preserved and functional.
// This ensures that if nearestCity is not yet defined, we pass empty strings to useEvents, preventing runtime errors.

import { useState, useRef, useEffect, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEvents, useEventOperations } from '@/hooks/useEvents';
import { usePostFilter } from '@/hooks/usePostFilter';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { trackEvent } from '@/hooks/useGoogleAnalytics';
import useMenuItems from '@/hooks/useMenuItems';
import { RoleContext } from '@/contexts/RoleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { listOfAllRoles } from '@/utils/masterData';
import { regionalOrganizerEvent } from '@/utils/RegionalOrganizerEvent';

export const useCalendarPage = () => {
  // TIEMPO-256: URL params for deep linking
  const searchParams = useSearchParams();
  const router = useRouter();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [clickedDate, setClickedDate] = useState(null);
  const [isViewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  // TIEMPO-362: Track pending action for ViewEventDetailModal (editOccurrence, cancelOccurrence, seeAllDates)
  const [pendingOccurrenceAction, setPendingOccurrenceAction] = useState(null);
  const [isAIDetailModalOpen, setAIDetailModalOpen] = useState(false);
  const [selectedAIEventDetails, setSelectedAIEventDetails] = useState(null);
  // TIEMPO-433: Spotlighter role opens SpotlightOnlyModal directly on event click
  // (skipping ViewEventDetailModal entirely — pure spotlight-add intent)
  const [isSpotlightOnlyModalOpen, setSpotlightOnlyModalOpen] = useState(false);
  const categories = useCategories();
  const { getMenuItems } = useMenuItems();
  // No longer needed - using saved user preferences instead
  // const { nearestCity } = useMasteredLocation();
  // const { selectedLocation } = useGeoLocation();
  const { selectedRole } = useContext(RoleContext);
  const { user } = useContext(AuthContext);
  const [datesSet, setDatesSet] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeAIEvents, setIncludeAIEvents] = useState(false);
  const calendarRef = useRef(null);

  // Track if we've already auto-expanded search (to prevent infinite loops)
  const hasAutoExpandedRef = useRef(false);

  // Add selectedOrganizers state for Feature_3003_RegionalOrganizerSelection
  const [selectedOrganizers, setSelectedOrganizers] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedOrganizers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Effect to save selectedOrganizers to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedOrganizers) {
      localStorage.setItem('selectedOrganizers', JSON.stringify(selectedOrganizers));
    }
  }, [selectedOrganizers]);

  // Get GeoLocation context for auto-expand feature
  const { currentLocation, setSessionLocation } = useGeoLocation();

  // Location names for backward compatibility
  const regionName = '';
  const divisionName = '';
  const cityName = '';

  // Use the updated useEvents hook with location preferences
  // Enable GeoLocationContext to get temporaryLocation for SET operations
  const { events, loading: eventsLoading, error: eventsError, noLocationSelected, refreshEvents } = useEvents({
    startDate: datesSet?.start, 
    endDate: datesSet?.end,
    limit: 500, // Increase the limit to ensure we get all events
    useGeoLocationContext: true, // Enable GeoLocationContext to get temporaryLocation
    useLocationPreferences: true // Enable saved user preferences
  });
  
  // Initialize event operations
  const { getEventById } = useEventOperations();

  // TIEMPO-256: Check for deep-linked event ID from URL query param
  // When user clicks "View on Calendar" from /event/[id], URL has ?event=xxx
  const deepLinkProcessedRef = useRef(false);

  useEffect(() => {
    // Get event ID from URL query param
    const eventIdFromUrl = searchParams?.get('event');

    // Only run once, after initial loading completes
    if (eventIdFromUrl && !eventsLoading && !deepLinkProcessedRef.current) {
      // Mark as processed IMMEDIATELY (sync) to prevent duplicate runs
      deepLinkProcessedRef.current = true;
      console.log('TIEMPO-256: Found deep-linked event ID from URL:', eventIdFromUrl);

      // Clear the URL param to prevent re-triggering on refresh
      router.replace('/calendar', { scroll: false });

      // Find the event in loaded events first (faster)
      const eventInList = events?.find(e => e._id === eventIdFromUrl);
      if (eventInList) {
        console.log('TIEMPO-256: Event found in loaded events, opening modal');
        // Transform to FullCalendar event format and open modal
        const transformedEvent = {
          id: eventInList._id,
          title: eventInList.title,
          start: eventInList.venueStartDisplay || eventInList.startTime,
          end: eventInList.venueEndDisplay || eventInList.endTime,
          extendedProps: {
            ...eventInList,
            _id: eventInList._id,
          },
        };
        setSelectedEventDetails(transformedEvent);
        setViewDetailModalOpen(true);
      } else {
        // Event not in current view - fetch it directly from API
        console.log('TIEMPO-256: Event not in view, fetching from API...');
        getEventById(eventIdFromUrl)
          .then(eventData => {
            if (eventData) {
              console.log('TIEMPO-256: Event fetched, opening modal');
              const transformedEvent = {
                id: eventData._id,
                title: eventData.title,
                start: eventData.venueStartDisplay || eventData.startTime,
                end: eventData.venueEndDisplay || eventData.endTime,
                extendedProps: {
                  ...eventData,
                  _id: eventData._id,
                },
              };
              setSelectedEventDetails(transformedEvent);
              setViewDetailModalOpen(true);
            } else {
              console.error('TIEMPO-256: Event not found:', eventIdFromUrl);
            }
          })
          .catch(err => {
            console.error('TIEMPO-256: Failed to fetch deep-linked event:', err);
          });
      }
    }
  }, [searchParams, events, eventsLoading, getEventById, router]);

  // Note: Role change refresh is handled automatically by useEvents hook
  // which has selectedRole in its dependency array


  const handleDatesSet = (dateInfo) => {
    // BUGFIX: Convert UTC dates to local dates for list views
    // When calendar is in UTC mode (timeZone="UTC"), FullCalendar provides dates in UTC
    // But for list views, we want to show events for local "today", not UTC "today"
    // For example, if it's Oct 22 11pm locally (Oct 23 3am UTC), we want events from Oct 22 local, not Oct 23 UTC

    let startStr = dateInfo.startStr;
    let endStr = dateInfo.endStr;

    // Check if this is a list view by examining the view type
    const viewType = dateInfo.view?.type || '';
    const isListView = viewType.includes('list');

    if (isListView) {
      // Convert UTC dates to local dates
      // Parse the UTC date strings
      const startDate = new Date(dateInfo.start);
      const endDate = new Date(dateInfo.end);

      // Get the local date components
      const localStartYear = startDate.getFullYear();
      const localStartMonth = startDate.getMonth();
      const localStartDay = startDate.getDate();

      const localEndYear = endDate.getFullYear();
      const localEndMonth = endDate.getMonth();
      const localEndDay = endDate.getDate();

      // BUGFIX: Use date-only format (YYYY-MM-DD) for list views
      // This tells backend to match by calendar date, not specific UTC timestamp
      // Format: "2025-10-06" instead of "2025-10-06T04:00:00.000Z"
      const startDateOnly = `${localStartYear}-${String(localStartMonth + 1).padStart(2, '0')}-${String(localStartDay).padStart(2, '0')}`;
      const endDateOnly = `${localEndYear}-${String(localEndMonth + 1).padStart(2, '0')}-${String(localEndDay).padStart(2, '0')}`;

      // Use date-only strings for the API
      startStr = startDateOnly;
      endStr = endDateOnly;
    }

    setDatesSet({
      start: startStr,
      end: endStr,
    });
  };

  // Only transform events when they're actually available and loading is complete
  // This prevents "No events to transform" warnings during initial loading
  const transformedEvents = (!eventsLoading && Array.isArray(events) && events.length > 0) 
    ? transformEvents(events) 
    : [];
    
  const { activeCategories, filteredEvents, handleCategoryChange } = usePostFilter(
    transformedEvents,
    categories,
    selectedOrganizers, // Pass selectedOrganizers to usePostFilter
    [], // selectedTags - not used yet
    searchTerm, // Pass searchTerm for text filtering
    includeAIEvents, // Pass includeAIEvents for AI event filtering
    user, // Pass user for RO filtering
    selectedRole // Pass selectedRole for RO filtering
  );

  const coloredFilteredEvents = (filteredEvents || []).map((event) => {
    const categoryColor = categoryColors[event.extendedProps.categoryFirst] || 'lightGrey';
    return {
      ...event,
      backgroundColor: categoryColor,
      borderColor: categoryColor,
      // Store original color for view-specific handling
      originalCategoryColor: categoryColor,
    };
  });

  // Auto-expand search when no events found:
  // 1. Enable AI Discovered events toggle
  // 2. Zoom out (increase search radius)
  useEffect(() => {
    // Only run when:
    // - Events have finished loading
    // - No events were found
    // - We haven't already auto-expanded this session
    // - AI events aren't already enabled (to avoid loop)
    // - We have a valid location set
    if (
      !eventsLoading &&
      datesSet && // Ensure we've actually searched
      coloredFilteredEvents.length === 0 &&
      !hasAutoExpandedRef.current &&
      !includeAIEvents &&
      currentLocation?.lat &&
      currentLocation?.lng
    ) {
      hasAutoExpandedRef.current = true;

      // 1. Enable AI Discovered events
      setIncludeAIEvents(true);

      // 2. Zoom out - increase search radius (max 200 miles)
      const currentZoomRange = currentLocation.zoomRange || 50;
      const newZoomRange = Math.min(currentZoomRange * 2, 200); // Double the range, cap at 200

      if (newZoomRange > currentZoomRange) {
        setSessionLocation({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          zoomRange: newZoomRange
        });
      }

      // Track this auto-expand action
      trackEvent({
        action: 'auto_expand_search',
        category: 'Calendar Discovery',
        label: `AI enabled, zoom ${currentZoomRange} -> ${newZoomRange}`,
      });
    }
  }, [eventsLoading, coloredFilteredEvents.length, includeAIEvents, currentLocation, datesSet, setSessionLocation]);

  // Reset auto-expand flag when location changes significantly (user manually changes location)
  useEffect(() => {
    // Reset if user manually changes their location
    const handleLocationChange = () => {
      hasAutoExpandedRef.current = false;
    };

    // Listen for manual location changes via session storage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'currentLocation') {
          handleLocationChange();
        }
      });
    }
  }, []);

  // Tracking-integrated handlers
  // Handle event update actions (create, edit, delete)
  const handleEventUpdated = (action, eventId) => {
    refreshEvents();
    
    // Handle edit case specifically
    if (action === 'edit' && eventId) {
      // Reset states
      setIsEditMode(true);
      setEventToEdit(null);
      
      // Fetch the event details and open the edit modal
      getEventById(eventId)
        .then(eventData => {
          setEventToEdit(eventData);
          setCreateModalOpen(true); // Reuse the create modal for editing
        })
        .catch(error => {
          console.error('Error fetching event details for editing:', error);
          setIsEditMode(false); // Reset on error
        });
    } else {
      // For non-edit actions, reset the edit mode
      setIsEditMode(false);
      setEventToEdit(null);
    }

    // Track the event in analytics
    trackEvent({
      action: `${action}_event`,
      category: 'Event Management',
      label: action === 'create' ? 'New Event' : `Event ${eventId}`,
      value: eventId || '',
    });
  };

  const handlePrev = () => {
    const api = calendarRef.current.getApi();
    const viewType = api.view.type;

    // For list views, advance by the view's duration (e.g., 21 days)
    // This prevents gaps/overlaps when navigating in list view
    if (viewType.includes('list')) {
      api.prev();
    } else {
      // For month/grid views, jump to first of previous month
      const currentDate = api.getDate();
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      api.gotoDate(prevMonth);
    }

    // Track previous navigation
    trackEvent({
      action: 'navigate_prev',
      category: 'Calendar Navigation',
      label: 'Previous Period',
      value: '',
    });
  };

  const handleNext = () => {
    const api = calendarRef.current.getApi();
    const viewType = api.view.type;

    // For list views, advance by the view's duration (e.g., 21 days)
    // This prevents gaps/overlaps when navigating in list view
    if (viewType.includes('list')) {
      api.next();
    } else {
      // For month/grid views, jump to first of next month
      const currentDate = api.getDate();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      api.gotoDate(nextMonth);
    }

    // Track next navigation
    trackEvent({
      action: 'navigate_next',
      category: 'Calendar Date Navigation',
      label: 'Next Period',
    });
  };

  const handleToday = () => {
    calendarRef.current.getApi().today();

    // Track navigation to today
    trackEvent({
      action: 'navigate_today',
      category: 'Calendar Date Navigation',
      label: 'Today',
    });
  };

  const handleDateClick = (arg) => {
    // TIEMPO-362: Fix timezone bug - compare dates as strings to avoid UTC conversion issues
    // new Date("2026-03-17") interprets as UTC midnight, causing "today" to appear as "yesterday"
    // in timezones behind UTC (e.g., EST, PST)
    const clickedDateStr = arg.dateStr; // Format: "YYYY-MM-DD"

    // Get today's date in LOCAL timezone as YYYY-MM-DD string
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Compare as strings - this correctly handles "today" regardless of timezone/DST
    if (clickedDateStr < todayStr) {
      // Don't allow creating events in the past
      return;
    }
    
    setClickedDate(arg.dateStr);

    // Track date click
    trackEvent({
      action: 'click_date',
      category: 'Calendar Date Navigation',
      label: arg.dateStr,
    });

    // Feature_3019: For NamedUser (Milongerx) and Anonymous (not logged in) roles, no submenu on date click
    // Issue_1035: Also check for empty string which is set by AuthContext for anonymous users
    if (selectedRole === listOfAllRoles.NAMED_USER || selectedRole === '' || selectedRole === listOfAllRoles.ANONYMOUS) {
      // No action for basic users on date click - they can only view events
      return;
    } else {
      // For other roles, show the submenu for creating events
      const items = getMenuItems('dateClick');
      setMenuItems(items);
      setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
    }
  };

  const handleEventClick = (arg) => {
    // Check if this is a placeholder event (for list views)
    if (arg.event.extendedProps?.isPlaceholder) {
      // Treat placeholder clicks as date clicks for RO users
      if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
        setClickedDate(arg.event.start);
        const items = getMenuItems('dateClick');
        setMenuItems(items);
        setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
        return;
      }
      // For other users, no action on placeholder clicks
      return;
    }

    // Track event click
    trackEvent({
      action: 'click_event',
      category: 'Event Management',
      label: arg.event.title,
      value: arg.event.id,
    });

    // Check if this is an AI-discovered event
    if (arg.event.extendedProps?.isDiscovered === true) {
      setSelectedAIEventDetails(arg.event);
      setAIDetailModalOpen(true);
    } else {
      // Regular event handling
      setSelectedEventDetails(arg.event);

      // TIEMPO-436: Spotlighter mirrors RO process — show context menu so
      // user can choose View Event vs Spotlight. (TIEMPO-433 originally
      // skipped the menu; TIEMPO-436 reverts that for parity with RO UX.)
      // Falls through to the elevated-role context-menu branch below.

      // Feature_3019: For NamedUser (Milongerx) and Anonymous (not logged in) roles, directly open ViewEventDetailModal
      // Issue_1035: Also check for empty string which is set by AuthContext for anonymous users
      if (selectedRole === listOfAllRoles.NAMED_USER || selectedRole === '' || selectedRole === listOfAllRoles.ANONYMOUS) {
        setViewDetailModalOpen(true);
      } else {
        // For other roles, show the submenu
        // TIEMPO-362: Pass event details for recurring event menu options
        const items = getMenuItems('eventClick', arg.event);
        setMenuItems(items);
        setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
      }
    }
  };

  const handleMenuAction = (action) => {
    setMenuAnchor(null);

    // Track menu action
    trackEvent({
      action: `menu_action_${action}`,
      category: 'Event Management',
      label: action,
    });

    if (action === 'viewDetails') {
      setViewDetailModalOpen(true);
    }

    if (action === 'addSingleEvent') {
      setCreateModalOpen(true);
    }
    
    if (action === 'editEvent' && selectedEventDetails) {
      // Handle edit event from context menu
      handleEventUpdated('edit', selectedEventDetails.extendedProps?._id);
    }
    
    if (action === 'deleteEvent' && selectedEventDetails) {
      // Show delete confirmation dialog
      setViewDetailModalOpen(true);
      // The delete button in the modal will handle the actual deletion
    }
    
    // TIEMPO-253: Handle opening organizer settings for incomplete profiles
    if (action === 'openOrganizerSettings') {
      // Use the regional organizer event emitter to open the modal
      regionalOrganizerEvent.openModal();
    }

    // TIEMPO-362: Handle recurring event occurrence actions
    // These open ViewEventDetailModal which has the occurrence-specific UI
    if (action === 'editOccurrence' || action === 'cancelOccurrence' || action === 'seeAllDates') {
      // Store the action for ViewEventDetailModal to handle on open
      setPendingOccurrenceAction(action);
      setViewDetailModalOpen(true);
    }

    // TIEMPO-438: SL routes split per event-type for parity with RO:
    //   spotlightOccurrence (recurring) → ViewEventDetailModal which then opens
    //     EditOccurrenceModal with role='Spotlighter' (image hidden, all 6
    //     spotlight types incl. canceled). Mirrors RO 'editOccurrence' flow.
    //   spotlightEvent (one-off) → simplified SpotlightOnlyModal — 6 types,
    //     no image, no occurrence nav.
    if (action === 'spotlightOccurrence') {
      setPendingOccurrenceAction('spotlightOccurrence');
      setViewDetailModalOpen(true);
    }
    if (action === 'spotlightEvent') {
      setSpotlightOnlyModalOpen(true);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return {
    categories,
    activeCategories,
    clickedDate,
    handleCategoryChange,
    handleDatesSet,
    datesSet,
    events,
    coloredFilteredEvents,
    refreshEvents,
    selectedEvent,
    setSelectedEvent,
    isCreateModalOpen,
    // Enhanced modal control with edit mode reset
    setCreateModalOpen: (isOpen) => {
      // When closing the modal, reset edit mode and event to edit
      if (!isOpen) {
        setIsEditMode(false);
        setEventToEdit(null);
      }
      // Use the original state setter
      setCreateModalOpen(isOpen);
    },
    isViewDetailModalOpen,
    // TIEMPO-362: Enhanced modal control to clear pending action on close
    setViewDetailModalOpen: (isOpen) => {
      if (!isOpen) {
        setPendingOccurrenceAction(null);
      }
      setViewDetailModalOpen(isOpen);
    },
    // TIEMPO-433: Spotlight-only modal for Spotlighter role
    isSpotlightOnlyModalOpen,
    setSpotlightOnlyModalOpen,
    // TIEMPO-362: Pending occurrence action for ViewEventDetailModal
    pendingOccurrenceAction,
    handleEventUpdated,
    handlePrev,
    handleNext,
    handleToday,
    handleDateClick,
    handleEventClick,
    calendarRef,
    handleMenuAction,
    handleMenuClose,
    menuAnchor,
    menuItems,
    selectedEventDetails,
    // Add loading and error states
    eventsLoading,
    eventsError,
    noLocationSelected,
    // Location info
    regionName,
    divisionName,
    cityName,
    // Edit mode properties
    isEditMode,
    eventToEdit,
    // Organizer selection state
    selectedOrganizers,
    setSelectedOrganizers,
    // Search state
    searchTerm,
    setSearchTerm,
    // AI events inclusion state
    includeAIEvents,
    setIncludeAIEvents,
    // AI event detail modal state
    isAIDetailModalOpen,
    setAIDetailModalOpen,
    selectedAIEventDetails
  };
};
