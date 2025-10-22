//app/hooks/usePostFilter.js

import { useState, useEffect, useMemo } from 'react';

export const usePostFilter = (events, categories, selectedOrganizers = [], selectedTags = [], searchTerm = '', includeAIEvents = false, user = null, selectedRole = null) => {
  const [activeCategories, setActiveCategories] = useState([]);

  // Initialize activeCategories with all categories when categories change
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories.map((cat) => cat.categoryName));
    }
  }, [categories]);

  // TIEMPO-327: Two-stage toggle behavior
  // Stage 1: When all categories are ON, clicking one turns OFF all others
  // Stage 2: Normal toggle behavior after that
  const handleCategoryChange = (categoryName) => {
    setActiveCategories((prevCategories) => {
      // Safety check: ensure categories exist and have data
      if (!categories || categories.length === 0) {
        // Fallback to normal toggle if categories not loaded
        if (prevCategories.includes(categoryName)) {
          return prevCategories.filter((cat) => cat !== categoryName);
        } else {
          return [...prevCategories, categoryName];
        }
      }

      // Get all valid category names (excluding filtered ones like DayWorkshop, Trip, Unknown)
      const allCategoryNames = categories.map((cat) => cat.categoryName);

      // Stage 1: "Select Only This" - When ALL categories are active
      const allCategoriesActive = allCategoryNames.every((catName) =>
        prevCategories.includes(catName)
      );

      if (allCategoriesActive) {
        // Turn off all others, keep only the clicked category
        return [categoryName];
      }

      // Stage 2: Normal Toggle
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
      // When AI button is OFF (includeAIEvents=false), exclude AI-discovered events
      // When AI button is ON (includeAIEvents=true), include all events (ignore isDiscovered)
      if (!includeAIEvents && isDiscovered === true) {
        return false;
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

      // RO (Regional Organizer) role filter
      let matchesROFilter = true;
      if (selectedRole === 'RegionalOrganizer') {
        // Check if user and organizerId exist
        const userOrganizerId = user?.backendInfo?.regionalOrganizerInfo?.organizerId;
        if (userOrganizerId) {
          const { ownerOrganizerID, grantedOrganizerID, alternateOrganizerID } = event.extendedProps || {};
          
          // Event must match one of the three organizer fields
          matchesROFilter = (
            ownerOrganizerID === userOrganizerId ||
            grantedOrganizerID === userOrganizerId ||
            alternateOrganizerID === userOrganizerId
          );
        } else {
          // If RO role is selected but no organizerId, don't show any events
          matchesROFilter = false;
        }
      }

      return matchesCategory && matchesOrganizer && matchesTags && matchesROFilter;
    });

    return filtered;
  }, [events, activeCategories, selectedOrganizers, selectedTags, searchTerm, includeAIEvents, user, selectedRole]);

  return {
    activeCategories,
    filteredEvents,
    handleCategoryChange,
  };
};
