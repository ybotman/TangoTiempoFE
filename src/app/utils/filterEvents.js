export const filterEvents = (events, activeCategories, selectedOrganizers) => {
    if (!Array.isArray(events)) return [];

    // If no categories or organizers are selected, return all events
    if (activeCategories.length === 0 && selectedOrganizers.length === 0) {
        return events;
    }

    // Filter events based on any matching category or organizer
    const filteredEvents = events.filter(event => {
        const { categoryFirst, categorySecond, categoryThird, organizerId } = event.extendedProps || {};

        const matchesCategory = (
            activeCategories.length === 0 ||
            activeCategories.includes(categoryFirst) ||
            activeCategories.includes(categorySecond) ||
            activeCategories.includes(categoryThird)
        );

        const matchesOrganizer = (
            selectedOrganizers.length === 0 ||
            selectedOrganizers.includes(organizerId)
        );

        return matchesCategory && matchesOrganizer;
    });

    return filteredEvents;
};