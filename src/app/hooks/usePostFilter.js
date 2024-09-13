//FE/src/app/hooks/usePostFilter.js

import { useState, useEffect, useMemo } from "react";

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

/*
import { useState, useEffect } from "react";

//import { categoryColors } from "@/utils/categoryColors";

export const usePostFilter = (
  categories,
  selectedOrganizer,
  handleCategoryChange
) => {
  const categoryOrder = [
    "Milonga",
    "Practica",
    "Festival",
    "Workshop",
    "Class",
    "Virtual",
    "Trip",
  ];
  const defaultactiveCategories = [
    "Milonga",
    "Practica",
    "Workshop",
    "Festival",
  ];
  const [activeCategories, setActiveCategories] = useState([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      // Filter categories based on selected organizer if provided
      const filteredCategories = categories.filter((category) =>
        selectedOrganizer ? category.organizerId === selectedOrganizer : true
      );

      // Sort the categories based on pre-defined order
      const sortedCategories = filteredCategories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.categoryName);
        const indexB = categoryOrder.indexOf(b.categoryName);
        // If the category is not found in categoryOrder, place it at the end
        return (
          (indexA === -1 ? categoryOrder.length : indexA) -
          (indexB === -1 ? categoryOrder.length : indexB)
        );
      });

      // Set initial categories based on default selections
      const initialCategories = sortedCategories
        .filter((category) =>
          defaultactiveCategories.includes(category.categoryName)
        )
        .map((category) => category.categoryName);

      setActiveCategories(initialCategories);
      handleCategoryChange(initialCategories);
    }
  }, [categories, selectedOrganizer]); // Run effect when categories or organizer changes

  const handleCategoryButtonClick = (categoryName) => {
    let newActiveCategories;

    if (activeCategories.includes(categoryName)) {
      newActiveCategories = activeCategories.filter(
        (cat) => cat !== categoryName
      );
    } else {
      newActiveCategories = [...activeCategories, categoryName];
    }

    setActiveCategories(newActiveCategories);
    handleCategoryChange(newActiveCategories);
  };

  return {
    activeCategories,
    handleCategoryButtonClick,
  };
};
*/
