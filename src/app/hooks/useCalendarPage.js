//FE/src/app/hooks/useCalendarPage.js
import { useState, useRef } from "react";
import { useEvents } from "@/hooks/useEvents";
import { usePostFilter } from "@/hooks/usePostFilter";
import { transformEvents } from "@/utils/transformEvents";
import { categoryColors } from "@/utils/categoryColors";
import useCategories from "@/hooks/useCategories";
import { useRegions } from "@/hooks/useRegions";  // Import useRegions

export const useCalendarPage = () => {
  const regions = useRegions();  // Now it will be defined
  const categories = useCategories();
  const [selectedOrganizers, setSelectedOrganizers] = useState([]); // Initialized as empty array
  const [selectedTags, setSelectedTags] = useState([]); // Initialized as empty array
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [calendarStart, setCalendarStart] = useState(null);
  const [calendarEnd, setCalendarEnd] = useState(null);

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
  const { activeCategories, filteredEvents, handleCategoryChange } = usePostFilter(
    transformedEvents,
    categories,
    selectedOrganizers,
    selectedTags
  );

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

  // Handle other logic (e.g., region, division, city, etc.)
  const handleRegionChange = (value) => {
    setSelectedRegion(value);
    setSelectedDivision("");
    setSelectedCity("");
  };

  // Other handlers...

  return {
    regions,
    categories,
    selectedOrganizers, // Now an array
    setSelectedOrganizers,
    selectedTags,
    activeCategories,
    handleCategoryChange,
    selectedRegion,
    setSelectedRegion,
    selectedDivision,
    setSelectedDivision,
    selectedCity,
    setSelectedCity,
    calendarStart,
    calendarEnd,
    events,
    coloredFilteredEvents,
    refreshEvents,
    // Other handlers...
  };
};