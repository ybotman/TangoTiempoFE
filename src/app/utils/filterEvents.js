// src/utils/filterEvents.js

export const filterEvents = (events, selectedOrganizers) => {
    if (!Array.isArray(events)) return [];

    return events.filter(event => {
        return selectedOrganizers.length > 0
            ? selectedOrganizers.includes(event.extendedProps.ownerOrganizerID)
            : true;  // Return all events if no organizers are selected
    });
};