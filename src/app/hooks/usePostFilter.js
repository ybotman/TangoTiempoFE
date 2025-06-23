//app/hooks/usePostFilter.js

import { useState, useEffect, useMemo } from 'react';

export const usePostFilter = (events, categories, selectedOrganizers = [], selectedTags = [], searchTerm = '', showDiscovered = false) => {
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
    const organizers = Array.isArray(selectedOrganizers) ? selectedOrganizers : [];
    const tags = Array.isArray(selectedTags) ? selectedTags : [];

    // Apply filters only if there are values present
    const filtered = events.filter((event) => {
      const { categoryFirst, categorySecond, categoryThird, organizerId, tags: eventTags, isActive, isDiscovered } = event.extendedProps || {};

      // First ensure the event is active
      if (isActive === false) {
        return false;
      }

      // Filter based on isDiscovered flag
      if (showDiscovered) {
        // When showDiscovered is ON, only show events with isDiscovered === true
        if (isDiscovered !== true) {
          return false;
        }
      } else {
        // When showDiscovered is OFF, only show events with isDiscovered !== true
        if (isDiscovered === true) {
          return false;
        }
      }

      // Text search filter - search in title, shortTitle, venue, organizer name, and description
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(searchLower);
        const shortTitleMatch = event.extendedProps?.shortTitle?.toLowerCase().includes(searchLower);
        const venueMatch = event.extendedProps?.venueName?.toLowerCase().includes(searchLower);
        const organizerNameMatch = event.extendedProps?.ownerOrganizerName?.toLowerCase().includes(searchLower);
        const descriptionMatch = event.extendedProps?.eventDescription?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !shortTitleMatch && !venueMatch && !organizerNameMatch && !descriptionMatch) {
          return false;
        }
      }

      // Category filter
      const matchesCategory =
        !activeCategories ||
        activeCategories.length === 0 ||
        activeCategories.includes(categoryFirst) ||
        activeCategories.includes(categorySecond) ||
        activeCategories.includes(categoryThird);

      // Organizer filter
      const matchesOrganizer = organizers.length === 0 || organizerId === undefined || organizers.includes(organizerId);

      // Tags filter
      const matchesTags = tags.length === 0 || (eventTags && tags.some((tag) => eventTags.includes(tag)));

      return matchesCategory && matchesOrganizer && matchesTags;
    });

    return filtered;
  }, [events, activeCategories, selectedOrganizers, selectedTags, searchTerm, showDiscovered]);

  return {
    activeCategories,
    filteredEvents,
    handleCategoryChange,
  };
};
