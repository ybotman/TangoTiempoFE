
export function transformEvents(events) {
    return events.map(event => ({
        title: event.title,           // Use the 'title' field from the API
        start: event.startDate,       // Map 'startDate' to 'start'
        end: event.endDate,           // Map 'endDate' to 'end'
        extendedProps: {              // Any additional data you want to pass along
            description: event.eventDescription,
            standardsTitle: event.standardsTitle,
            categoryFirst: event.categoryFirst,
            categorySecond: event.categorySecond,
            categoryThird: event.categoryThird,
            eventImage: event.eventImage,
            location: event.locationID,
            cost: event.cost,
            calcuatedRegion: event.calcuatedRegion,
            active: event.active,
            recurrence: event.recurrenceRule,
            ownerOrganizerID: event.ownerOrganizerID,
            grantedOrganizerID: event.grantedOrganizerID,
            alternateOrganizerID: event.alternateOrganizerID,
        }
    }));
}