// src/utils/filterEvents.js

export const filterEvents = (events, selectedOrganizers, activeCategories) => {
    if (!Array.isArray(events)) return [];

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