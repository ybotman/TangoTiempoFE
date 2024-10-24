import { useState, useContext, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePostFilter } from '@/hooks/usePostFilter';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import { RegionsContext } from '@/contexts/RegionsContext';
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

  const {
    regions,
    selectedRegion,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
  } = useContext(RegionsContext);

  const { selectedRole } = useContext(RoleContext);

  const [datesSet, setDatesSet] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const calendarRef = useRef(null);
  const handleRegionChange = (event) => {
    const selectedValue = event.target.value;

    if (!selectedValue) {
      console.error('No region selected');
      return;
    }

    const selectedRegion = regions.find(
      (region) => region._id === selectedValue
    );

    if (selectedRegion) {
      console.log('Region Selected:', selectedRegion);

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
  const { activeCategories, filteredEvents, handleCategoryChange } =
    usePostFilter(transformedEvents, categories); // no tags or orgs for now
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

    // Add other role-based conditions as needed...
  };
  const handleEventClick = (arg) => {
    console.log('1 Event clicked:', arg.event.title);

    // Setting the raw event data as a fallback
    setSelectedEventDetails(arg.event);

    // Default menu option available for all roles
    let menuOptions = [{ label: 'View Event', action: 'viewDetails' }];

    // For Regional Organizer, add additional event-related options
    if (selectedRole === listOfAllRoles.REGIONAL_ORGANIZER) {
      menuOptions = [
        ...menuOptions, // Add the common 'View Event' option
        { label: 'Edit Event', action: 'editEvent' },
        { label: 'Delete Event', action: 'deleteEvent' },
        { label: 'Add Photos', action: 'addPhotos' },
      ];
    }

    // For Named User, add additional user-related options
    if (selectedRole === listOfAllRoles.NAMED_USER) {
      menuOptions = [
        ...menuOptions, // Add the common 'View Event' option
        { label: 'View Details', action: 'viewDetails' },
        { label: 'Add Comment/Photo', action: 'addCommentPhoto' },
      ];
    }

    // Update the menu items and anchor position based on where the user clicked
    setMenuItems(menuOptions);
    setMenuAnchor({
      mouseX: arg.jsEvent.clientX,
      mouseY: arg.jsEvent.clientY,
    });
  };

  const handleMenuAction = (action) => {
    console.log(`Action selected: ${action}`);
    setMenuAnchor(null); // Close the menu

    if (action === 'viewDetails') {
      console.log('setViewDetailModalOpen');
      setViewDetailModalOpen(true);
    }

    if (action === 'addSingleEvent') {
      console.log('Opening Create Event Modal'); // Add this for debugging
      setCreateModalOpen(true); // Ensure this is properly called
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
