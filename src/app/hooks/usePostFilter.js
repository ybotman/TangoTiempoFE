//app/hooks/usePostFilter.js

import { useState, useEffect, useMemo } from 'react';

export const usePostFilter = (
  events,
  categories,
  selectedOrganizers = [],
  selectedTags = []
) => {
  const [activeCategories, setActiveCategories] = useState([]);

  // Initialize activeCategories with all categories when categories change
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories.map((cat) => cat.categoryName));
    }
  }, [categories]);

  // Update handleCategoryChange to toggle categories
  const handleCategoryChange = (categoryName) => {
    setActiveCategories((prevCategories) => {
      if (prevCategories.includes(categoryName)) {
        // Remove the category
        return prevCategories.filter((cat) => cat !== categoryName);
      } else {
        // Add the category
        return [...prevCategories, categoryName];
      }
    });
  };

  // Memoize filteredEvents to prevent unnecessary computations and infinite loops
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    // Ensure selectedOrganizers and selectedTags are arrays
    const organizers = Array.isArray(selectedOrganizers)
      ? selectedOrganizers
      : [];
    const tags = Array.isArray(selectedTags) ? selectedTags : [];

    // Apply filters only if there are values present
    return events.filter((event) => {
      const {
        categoryFirst,
        categorySecond,
        categoryThird,
        organizerId,
        tags: eventTags,
      } = event.extendedProps || {};

      // Category filter
      const matchesCategory =
        !activeCategories ||
        activeCategories.length === 0 ||
        activeCategories.includes(categoryFirst) ||
        activeCategories.includes(categorySecond) ||
        activeCategories.includes(categoryThird);

      // Organizer filter
      const matchesOrganizer =
        organizers.length === 0 ||
        organizerId === undefined ||
        organizers.includes(organizerId);

      // Tags filter
      const matchesTags =
        tags.length === 0 ||
        (eventTags && tags.some((tag) => eventTags.includes(tag)));

      return matchesCategory && matchesOrganizer && matchesTags;
    });
  }, [events, activeCategories, selectedOrganizers, selectedTags]);

  return {
    activeCategories,
    filteredEvents,
    handleCategoryChange,
  };
};
