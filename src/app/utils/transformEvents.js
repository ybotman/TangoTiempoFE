
export function transformEvents(events) {
    return events.map(event => ({
        title: event.title,           // Use the 'title' field from the API
        start: event.startDate,       // Map 'startDate' to 'start'
        end: event.endDate,           // Map 'endDate' to 'end'
        extendedProps: {              // Any additional data you want to pass along
            description: event.eventDescription,
            category: event.categoryFirst,
            image: event.eventImage,
            location: event.locationID,
            cost: event.cost,
            region: event.region,
            active: event.active,
            recurrence: event.recurrenceRule,
        }
    }));
}