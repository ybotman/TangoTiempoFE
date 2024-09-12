import { useState, useEffect } from "react";

export const usePostFilter = (
  events,
  categories,
  selectedOrganizers,
  selectedTags
) => {
  const [activeCategories, setActiveCategories] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const handleCategoryChange = (newCategories) => {
    setActiveCategories(newCategories);
  };

  const filterEvents = (
    events,
    selectedCategories,
    selectedOrganizers,
    selectedTags
  ) => {
    if (!Array.isArray(events)) return [];

    return events.filter((event) => {
      const { categoryFirst, organizerId, tags } = event.extendedProps || {};

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoryFirst);

      const matchesOrganizer =
        selectedOrganizers.length === 0 ||
        organizerId === undefined ||
        selectedOrganizers.includes(organizerId);

      const matchesTags =
        selectedTags.length === 0 ||
        (tags && selectedTags.some((tag) => tags.includes(tag)));

      return matchesCategory && matchesOrganizer && matchesTags;
    });
  };

  useEffect(() => {
    const filtered = filterEvents(
      events,
      activeCategories,
      selectedOrganizers,
      selectedTags
    );
    setFilteredEvents(filtered);
    //}, [activeCategories, selectedOrganizers, selectedTags, events]);
  }, [activeCategories]);

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
