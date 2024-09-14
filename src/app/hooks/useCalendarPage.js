//app/hooks/useCalendarPage.js
// app/hooks/useCalendarPage.js

import { useState, useContext } from "react";
import { useEvents } from "@/hooks/useEvents";
import { usePostFilter } from "@/hooks/usePostFilter";
import { transformEvents } from "@/utils/transformEvents";
import { categoryColors } from "@/utils/categoryColors";
import useCategories from "@/hooks/useCategories";
import { CalendarContext } from '@/contexts/CalendarContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { PostFilterContext } from '@/contexts/PostFilterContext';

export const useCalendarPage = () => {
  const categories = useCategories();
  const { selectedRegion, selectedDivision, selectedCity } = useContext(RegionsContext);
  const { selectedOrganizers, setSelectedOrganizers, selectedCategories, setSelectedCategories } = useContext(PostFilterContext);
  const { datesSet, setDatesSet } = useContext(CalendarContext);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handleDatesSet = (dateInfo) => {
    console.log("useCalendarPage.handleDatesSet");
    console.log("--> Calendar earliest Date:", dateInfo.startStr);
    console.log("--> Calendar latest Date:", dateInfo.endStr);

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
      selectedOrganizers,
      [] // Ignoring tags for now
    );

  // Ensure filteredEvents is always an array before mapping
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

  const handleEventCreated = (newEvent) => {
    console.log("New event created:", newEvent);
    refreshEvents();
  };

  const handleRegionChange = (value) => {
    console.log("handleRegionChange:", value);
    // Assume setSelectedRegion is available from context
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
    console.log("Date clicked:", arg.dateStr);
    setCreateModalOpen(true);
    // Set selectedDate in context or state if needed
  };

  const handleEventClick = (clickInfo) => {
    console.log("Event clicked:", clickInfo.event);
    setSelectedEvent(clickInfo.event);
  };

  return {
    categories,
    activeCategories,
    handleCategoryChange,
    handleDatesSet, // Return handleDatesSet
    selectedOrganizers,
    setSelectedOrganizers,
    selectedCategories,
    setSelectedCategories,
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
  };
};