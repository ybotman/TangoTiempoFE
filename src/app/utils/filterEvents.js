// src/utils/filterEvents.js


export const filterEvents = (events, activeCategories) => {
    if (!Array.isArray(events)) return [];

    console.log('filterEvents received:', events, activeCategories);

    // If no active categories are selected, return all events
    if (activeCategories.length === 0) {
        //       console.log('No active categories selected. Returning all events:', events);
        return events;
    }

    // Filter events based on active categories
    const filteredEvents = events.filter(event => {
        return activeCategories.includes(event.extendedProps.categoryFirst);
    });

    console.log('Filtered events to be returned:', filteredEvents);
    return filteredEvents;
};
/*  old with filters
export const filterEvents = (events, selectedOrganizers, activeCategories) => {
    if (!Array.isArray(events)) return [];

    console.log('filerEvents received:', events)
    return events.filter(event => {
        const isOrganizerMatch = selectedOrganizers.length > 0
            ? selectedOrganizers.includes(event.extendedProps.ownerOrganizerID)
            : true;  // Return all events if no organizers are selected

        const isCategoryMatch = activeCategories.length > 0
            ? activeCategories.includes(event.extendedProps.categoryFirst)
            : true;  // Return all events if no categories are selected

        // Return true if both organizer and category match
        return isOrganizerMatch && isCategoryMatch;
    });
};

*/