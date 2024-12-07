// src/hooks/useCalendarPage.js
import { useState, useContext, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePostFilter } from '@/hooks/usePostFilter';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import { RegionsContext } from '@/contexts/RegionsContext';
import { trackEvent } from '@/hooks/useGoogleAnalytics'; // Import the tracking function
import useMenuItems from '@/hooks/useMenuItems';

export const useCalendarPage = () => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [clickedDate, setClickedDate] = useState(null);
  const [isViewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const categories = useCategories();
  const { getMenuItems } = useMenuItems();

  const {
    regions,
    selectedRegion,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
  } = useContext(RegionsContext);

  const [datesSet, setDatesSet] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const calendarRef = useRef(null);

  const handleRegionChange = (event) => {
    const selectedValue = event.target.value;

    if (!selectedValue) {
      console.error('No region selected');
      return;
    }

    const selectedRegion = regions.find((region) => region._id === selectedValue);

    if (selectedRegion) {
      setSelectedRegion(selectedRegion);
      setSelectedDivision('');
      setSelectedCity('');
      refreshEvents();
    } else {
      console.error('Region not found for selected value:', selectedValue);
    }
  };

  const handleDatesSet = (dateInfo) => {
    setDatesSet({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
    });
  };

  const { events, refreshEvents } = useEvents(
    selectedRegion,
    selectedDivision,
    selectedCity,
    datesSet?.start,
    datesSet?.end
  );
  const transformedEvents = transformEvents(events);
  const { activeCategories, filteredEvents, handleCategoryChange } = usePostFilter(transformedEvents, categories);

  const coloredFilteredEvents = (filteredEvents || []).map((event) => {
    const categoryColor = categoryColors[event.extendedProps.categoryFirst] || 'lightGrey';
    return {
      ...event,
      backgroundColor: categoryColor,
      borderColor: categoryColor,
    };
  });

  // Tracking-integrated handlers
  const handleEventCreated = (newEvent) => {
    console.log('New event created:', newEvent);
    refreshEvents();

    // Track event creation
    trackEvent({
      action: 'create_event',
      category: 'Event Management',
      label: newEvent.title || 'New Event',
      value: newEvent.id,
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

    const menuItems = getMenuItems('dateClick'); // Correctly call getMenuItems
    setMenuItems(menuItems);
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

    const menuItems = getMenuItems('eventClick');
    setMenuItems(menuItems);
    setMenuAnchor({ mouseX: arg.jsEvent.clientX, mouseY: arg.jsEvent.clientY });
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
    setCreateModalOpen,
    isViewDetailModalOpen,
    setViewDetailModalOpen,
    handleEventCreated,
    handleRegionChange,
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
  };
};
