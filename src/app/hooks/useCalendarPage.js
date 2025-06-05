// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: src/hooks/useCalendarPage.js
// Explanation:
// Currently, if nearestCity is null (not yet loaded), attempting to access nearestCity.regionName (and others) throws an error.
// We will add safe null checks by using optional chaining and defaults.
// No features are dropped. All existing code is preserved and functional.
// This ensures that if nearestCity is not yet defined, we pass empty strings to useEvents, preventing runtime errors.

import { useState, useRef, useEffect, useContext } from 'react';
import { useEvents, useEventOperations } from '@/hooks/useEvents';
import { usePostFilter } from '@/hooks/usePostFilter';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import { useMasteredLocation } from '@/contexts/MasteredLocationContext';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { trackEvent } from '@/hooks/useGoogleAnalytics';
import useMenuItems from '@/hooks/useMenuItems';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';

export const useCalendarPage = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [clickedDate, setClickedDate] = useState(null);
  const [isViewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const categories = useCategories();
  console.log('useCalendarPage categories:', categories);
  const { getMenuItems } = useMenuItems();
  const { nearestCity } = useMasteredLocation();
  const { selectedLocation } = useGeoLocation();
  const { selectedRole } = useContext(RoleContext);
  const [datesSet, setDatesSet] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const calendarRef = useRef(null);

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

  // Use GeoLocationContext as primary source, with fallback to MasteredLocationContext
  // Ensure we have valid string values to avoid API errors
  const regionName = (selectedLocation.region.name || nearestCity?.regionName || 'Northeast').trim();
  const divisionName = (selectedLocation.division.name || nearestCity?.divisionName || '').trim();
  const cityName = (selectedLocation.city.name || nearestCity?.cityName || '').trim();

  // Use the updated useEvents hook implementation that accepts an options object
  const { events, loading: eventsLoading, error: eventsError, refreshEvents } = useEvents({
    region: regionName, 
    division: divisionName, 
    city: cityName, 
    startDate: datesSet?.start, 
    endDate: datesSet?.end,
    limit: 200 // Increase the limit to ensure we get all events
  });
  
  // Initialize event operations
  const { getEventById } = useEventOperations();

  console.log('uCP GeoLocation: ', regionName, '>>', divisionName, '>>', cityName, '>>', datesSet?.start, datesSet?.end);

  const handleDatesSet = (dateInfo) => {
    setDatesSet({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
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
    selectedOrganizers // Pass selectedOrganizers to usePostFilter
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

  // Tracking-integrated handlers
  // Handle event update actions (create, edit, delete)
  const handleEventUpdated = (action, eventId) => {
    console.log(`Event ${action}:`, eventId);
    refreshEvents();
    
    // Handle edit case specifically
    if (action === 'edit' && eventId) {
      // Reset states
      setIsEditMode(true);
      setEventToEdit(null);
      
      // Fetch the event details and open the edit modal
      getEventById(eventId)
        .then(eventData => {
          console.log('Fetched event details for editing:', eventData);
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
    calendarRef.current.getApi().prev();

    // Track previous navigation
    trackEvent({
      action: 'navigate_prev',
      category: 'Calendar Navigation',
      label: 'Previous Period',
      value: '',
    });
  };

  const handleNext = () => {
    calendarRef.current.getApi().next();

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
    setClickedDate(arg.dateStr);

    // Track date click
    trackEvent({
      action: 'click_date',
      category: 'Calendar Date Navigation',
      label: arg.dateStr,
    });

    const items = getMenuItems('dateClick');
    setMenuItems(items);
    setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
  };

  const handleEventClick = (arg) => {
    setSelectedEventDetails(arg.event);

    // Track event click
    trackEvent({
      action: 'click_event',
      category: 'Event Management',
      label: arg.event.title,
      value: arg.event.id,
    });

    // Feature_3019: For NamedUser (Milongerx) and Anonymous (not logged in) roles, directly open ViewEventDetailModal
    if (selectedRole === listOfAllRoles.NAMED_USER || selectedRole === listOfAllRoles.ANONYMOUS) {
      setViewDetailModalOpen(true);
    } else {
      // For other roles, show the submenu
      const items = getMenuItems('eventClick');
      setMenuItems(items);
      setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
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
    setViewDetailModalOpen,
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
    // Location info
    regionName,
    divisionName,
    cityName,
    // Edit mode properties
    isEditMode,
    eventToEdit,
    // Organizer selection state
    selectedOrganizers,
    setSelectedOrganizers
  };
};
