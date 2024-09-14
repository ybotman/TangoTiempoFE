//FE/src/app/hooks/useCalendarPage.js
import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { usePostFilter } from "@/hooks/usePostFilter";
import { transformEvents } from "@/utils/transformEvents";
import { categoryColors } from "@/utils/categoryColors";
import useCategories from "@/hooks/useCategories";

export const useCalendarPage = (
  selectedRegion,
  selectedDivision,
  selectedCity
) => {
  const categories = useCategories();
  const [selectedOrganizers, setSelectedOrganizers] = useState([]); // Initialized as empty array
  const [selectedTags, setSelectedTags] = useState([]); // Initialized as empty array
  const [calendarStart, setCalendarStart] = useState(null);
  const [calendarEnd, setCalendarEnd] = useState(null);

  // Move handleDatesSet and date range state here
  const handleDatesSet = (dateInfo) => {
    console.log("useCalendarPage.handleDatesSet");
    console.log("--> Calendar earliest Date:", dateInfo.startStr);
    console.log("--> Calendar latest Date:", dateInfo.endStr);

    setCalendarStart(dateInfo.startStr);
    setCalendarEnd(dateInfo.endStr);
  };

  const { events, refreshEvents } = useEvents(
    selectedRegion,
    selectedDivision,
    selectedCity,
    calendarStart,
    calendarEnd
  );

  // Transform the fetched events
  const transformedEvents = transformEvents(events);

  // Use the post filter to filter based on active categories (and future organizers/tags)
  const { activeCategories, filteredEvents, handleCategoryChange } =
    usePostFilter(
      transformedEvents,
      categories,
      selectedOrganizers,
      selectedTags
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

  return {
    categories,
    activeCategories,
    handleCategoryChange,
    handleDatesSet, // Return handleDatesSet
    selectedOrganizers,
    setSelectedOrganizers,
    selectedTags,
    calendarStart,
    calendarEnd,
    events,
    coloredFilteredEvents,
    refreshEvents,
  };
};