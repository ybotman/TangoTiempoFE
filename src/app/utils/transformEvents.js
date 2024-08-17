
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
            region: event.region,
            active: event.active,
            recurrence: event.recurrenceRule,
            ownerOrganizerID: event.ownerOrganizerID,
            eventOrganizerID: event.eventOrganizerID,
            altOrganizerID: event.altOrganizerID,
        }
    }));
}