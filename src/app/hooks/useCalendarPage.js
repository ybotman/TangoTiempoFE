// app/hooks/useCalendarPage.js

import { useState, useContext, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePostFilter } from '@/hooks/usePostFilter';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import { CalendarContext } from '@/contexts/CalendarContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';

export const useCalendarPage = () => {
  const [menuAnchor, setMenuAnchor] = useState(null); // To track submenu position
  const [menuItems, setMenuItems] = useState([]); // Menu items based on the role
  const [clickedDate, setClickedDate] = useState(null); // Date or event clicked
  const categories = useCategories();
  const {
    selectedRegion,
    selectedRegionID,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
  } = useContext(RegionsContext);

  const { selectedRole } = useContext(RoleContext);
  // const {
  //   selectedOrganizers,
  //   setSelectedOrganizers,
  //   selectedCategories,
  //   setSelectedCategories,
  // } =
  //where will  thise come from handles is suppose

  const { datesSet, setDatesSet } = useContext(CalendarContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const calendarRef = useRef(null);
  const handleRegionChange = (event) => {
    const selectedValue = event.target.value; // Extract the selected value (region ID)

    if (!selectedValue) {
      console.error('No region selected');
      return;
    }

    const selectedRegion = regions.find(
      (region) => region._id === selectedValue
    ); // Lookup the region based on ID

    if (selectedRegion) {
      console.log('Region Selected:', selectedRegion);

      // Set the selected region object and its ID in the context
      setSelectedRegion(selectedRegion); // Pass the entire region object to the context
      setSelectedDivision(''); // Reset division
      setSelectedCity(''); // Reset city

      // Optionally refresh events based on the new region
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

  // Transform the fetched events
  const transformedEvents = transformEvents(events);

  // Use the post filter to filter based on active categories (and future organizers/tags)
  const { activeCategories, filteredEvents, handleCategoryChange } =
    usePostFilter(
      transformedEvents,
      categories,
      //     selectedOrganizers,
      [] // Ignoring tags for now
    );

  // Ensure filteredEvents is always an array before mapping
  const coloredFilteredEvents = (filteredEvents || []).map((event) => {
    const categoryColor =
      categoryColors[event.extendedProps.categoryFirst] || 'lightGrey';
    return {
      ...event,
      backgroundColor: categoryColor,
      textColor:
        event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
      borderColor: categoryColor,
    };
  });

  const handleEventCreated = (newEvent) => {
    console.log('New event created:', newEvent);
    refreshEvents();
  };

  const handlePrev = () => {
    // Implement navigation to previous period
    calendarRef.current.getApi().prev();
  };

  const handleNext = () => {
    // Implement navigation to next period
    calendarRef.current.getApi().next();
  };

  const handleToday = () => {
    // Implement navigation to today
    calendarRef.current.getApi().today();
  };

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
    setClickedDate(arg.dateStr); // Store the clicked date

    if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
      // For Regional Organizer, show date-related options
      setMenuItems([
        { label: 'Change Date', action: 'changeDate' },
        { label: 'Add Single Event', action: 'addSingleEvent' },
        { label: 'Add Repeating Event', action: 'addRepeatingEvent' },
      ]);
      setMenuAnchor({
        mouseX: arg.jsEvent.clientX,
        mouseY: arg.jsEvent.clientY,
      });
    }

    if (
      selectedRole === listOfAllRoles.NAMED_USER &&
      new Date(arg.dateStr) < new Date()
    ) {
      // If Named User and date is in the past
      setMenuItems([
        { label: 'View Details', action: 'viewDetails' },
        { label: 'Add Comment/Photo', action: 'addCommentPhoto' },
      ]);
      setMenuAnchor({
        mouseX: arg.jsEvent.clientX,
        mouseY: arg.jsEvent.clientY,
      });
    }

    // Add other role-based conditions as needed...
  };

  const handleEventClick = (arg) => {
    console.log('Event clicked:', arg.event.title);

    if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
      // For Regional Organizer, show event-related options
      setMenuItems([
        { label: 'Edit Event', action: 'editEvent' },
        { label: 'Delete Event', action: 'deleteEvent' },
        { label: 'View Event', action: 'viewEvent' },
        { label: 'Add Photos', action: 'addPhotos' },
      ]);
      setMenuAnchor({
        mouseX: arg.jsEvent.clientX,
        mouseY: arg.jsEvent.clientY,
      });
    }

    if (
      selectedRole === listOfAllRoles.NAMED_USER &&
      new Date(arg.event.start) < new Date()
    ) {
      // For Named User, show limited event-related options if event is in the past
      setMenuItems([
        { label: 'View Details', action: 'viewDetails' },
        { label: 'Add Comment/Photo', action: 'addCommentPhoto' },
      ]);
      setMenuAnchor({
        mouseX: arg.jsEvent.clientX,
        mouseY: arg.jsEvent.clientY,
      });
    }

    if (selectedRole === listOfAllRoles.EVERYONE) {
      // Everyone can only view details
      setMenuItems([{ label: 'View Event Details', action: 'viewDetails' }]);
      setMenuAnchor({
        mouseX: arg.jsEvent.clientX,
        mouseY: arg.jsEvent.clientY,
      });
    }
  };

  const handleMenuAction = (action) => {
    console.log(`Action selected: ${action}`);
    setMenuAnchor(null);

    if (action === 'addSingleEvent') {
      setCreateModalOpen(true); // Open the CreateSingleEvent modal
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return {
    categories,
    activeCategories,
    handleCategoryChange,
    handleDatesSet, // Return handleDatesSet
    //    selectedOrganizers,
    //    setSelectedOrganizers,
    //   selectedCategories,
    //   setSelectedCategories,
    datesSet,
    events,
    coloredFilteredEvents,
    refreshEvents,
    selectedEvent,
    setSelectedEvent,
    isCreateModalOpen,
    setCreateModalOpen,
    handleEventCreated,
    handleRegionChange,
    handlePrev,
    handleNext,
    handleToday,
    handleDateClick,
    handleEventClick,
    calendarRef, // Return calendarRef
    handleMenuAction,
    handleMenuClose,
    menuAnchor,
    menuItems,
  };
};
