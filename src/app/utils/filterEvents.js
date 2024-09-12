export const filterEvents = (
  events,
  selectedCategories,
  selectedOrganizers
) => {
  // Log the initial parameters being passed
  console.log("filterEvents should be called");

  // Check if events is an array
  if (!Array.isArray(events)) {
    //     console.log('Events is not an array, returning empty array');
    return [];
  }

  // If no categories or organizers are selected, return all events
  if (selectedCategories.length === 0 && selectedOrganizers.length === 0) {
    //     console.log('No categories or organizers selected, returning all events');
    return events;
  }

  // Log each event's categories and organizers before filtering
  events.forEach((event) => {
    const { categoryFirst, categorySecond, categoryThird, organizerId } =
      event.extendedProps || {};
    console.log("Event being evaluated:", {
      categoryFirst,
      categorySecond,
      categoryThird,
      organizerId,
    });
  });

  // Filter events based on any matching category or organizer
  const filteredEvents = events.filter((event) => {
    const { categoryFirst, categorySecond, categoryThird, organizerId } =
      event.extendedProps || {};

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(categoryFirst) ||
      selectedCategories.includes(categorySecond) ||
      selectedCategories.includes(categoryThird);

    // Adjusted logic to include events with undefined organizerId
    const matchesOrganizer =
      selectedOrganizers.length === 0 || // If no organizers are selected, include all
      organizerId === undefined || // Include events with undefined organizerId
      selectedOrganizers.includes(organizerId); // Match organizerId with selectedOrganizers

    // Log the result of each event check
    //      console.log('Event matches category:', matchesCategory, 'Event matches organizer:', matchesOrganizer);

    return matchesCategory && matchesOrganizer;
  });

  // Log the final filtered events
  console.log("Filtered events result:", filteredEvents);

  return filteredEvents;
};
