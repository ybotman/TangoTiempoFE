import { useState, useRef } from "react";
import { useEvents } from "@/hooks/useEvents";
import { usePostFilter } from "@/hooks/usePostFilter";
import { transformEvents } from "@/utils/transformEvents";
import { categoryColors } from "@/utils/categoryColors";

import useCategories from "@/hooks/useCategories";
import { useRegions } from "@/hooks/useRegions";

export const useCalendarPage = () => {
  const regions = useRegions();
  const categories = useCategories();
  const [selectedOrganizer, setSelectedOrganizer] = useState(null); // Placeholder for future filtering
  const [selectedTags, setSelectedTags] = useState([]); // Placeholder for future filtering
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [calendarStart, setCalendarStart] = useState(null);
  const [calendarEnd, setCalendarEnd] = useState(null);

<<<<<<< HEAD
  const calendarRef = useRef(null);

  const {
    user,
    availibleRoles,
    isAnonymous,
    isRegionalOrganizer,
    isRegionalAdmin,
    isSystemOwner,
    isNamedUser,
    selectedRole,
    setSelectedRole,
  } = useAuth();

  const handleDatesSet = (rangeInfo) => {
    setCalendarStart(rangeInfo.start);
    setCalendarEnd(rangeInfo.end);
    console.log("Dates Set: ", rangeInfo.start, rangeInfo.end);
  };

  //  const organizers = useOrganizers(selectedRegion);

  const handleEventCreated = async () => {
    try {
      await refreshEvents(); // Manually trigger a refresh of the events
    } catch (error) {
      console.error("Error refreshing events after creation:", error);
    }
  };

  const handleCategoryChange = (newCategories) => {
    console.log("handleCategoryChange called with:", newCategories);
    setActiveCategories(newCategories);
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };

  const handleDateClick = (clickInfo) => {
    setSelectedDate(clickInfo.date);
    setCreateModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleOrganizerChange = (value) => {
    if (value === "none") {
      setSelectedOrganizers([]);
    } else {
      setSelectedOrganizers([value]);
    }
  };

      console.log('events Data', selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd)
=======
>>>>>>> 4a899778630e7618aaeba60279f7e754de6bc869
  const { events, refreshEvents } = useEvents(
    selectedRegion,
    selectedDivision,
    selectedCity,
    calendarStart,
    calendarEnd
  );
<<<<<<< HEAD
      console.log('events', events)
  const transformedEvents = transformEvents(events);
     console.log('transformEvents', transformedEvents)
     console.log('enteringfitlerEvent', transformedEvents, activeCategories)
=======

  // Transform the fetched events
  const transformedEvents = transformEvents(events);
>>>>>>> 4a899778630e7618aaeba60279f7e754de6bc869

  // Use the post filter to filter based on active categories (and future organizers/tags)
  const { filteredEvents, handleCategoryChange } = usePostFilter(
    transformedEvents,
    categories,
    selectedOrganizer,
    selectedTags
  );
<<<<<<< HEAD
   console.log('filteredEvents', filteredEvents)
=======
>>>>>>> 4a899778630e7618aaeba60279f7e754de6bc869

  // Ensure postFilteredEvents is always an array before mapping
  const coloredFilteredEvents = (filteredEvents || []).map((event) => {
    const categoryColor =
      categoryColors[event.extendedProps.categoryFirst] || "lightGrey";
    return {
      ...event,
      backgroundColor: categoryColor,
      textColor:
        event.extendedProps.categoryFirst === "Milonga" ? "white" : "black",
      borderColor: categoryColor,
    };
  });

<<<<<<< HEAD
=======
  // Handle other logic (e.g., region, division, city, etc.)
  const handleRegionChange = (value) => {
    setSelectedRegion(value);
    setSelectedDivision("");
    setSelectedCity("");
  };
>>>>>>> 4a899778630e7618aaeba60279f7e754de6bc869

  return {
    regions,
    categories,
    selectedOrganizer, // Add to future filtering
    selectedTags, // Add to future filtering
    selectedRegion,
    selectedDivision,
    selectedCity,
    calendarStart,
    calendarEnd,
    events,
    coloredFilteredEvents,
    refreshEvents,
    handleCategoryChange,
    handleRegionChange,
  };
};
