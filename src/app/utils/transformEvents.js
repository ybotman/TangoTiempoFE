export function transformEvents(events) {
    console.log('TransformEvent received:', events)

    return events.map(event => ({
        title: event.title,           // Use the 'title' field from the API
        start: event.startDate,       // Map 'startDate' to 'start'
        end: event.endDate,           // Map 'endDate' to 'end'
        extendedProps: {              // Any additional data
            description: event.description,
            standardsTitle: event.standardsTitle,
            categoryFirst: event.categoryFirst,
            categorySecond: event.categorySecond,
            categoryThird: event.categoryThird,
            eventImage: event.eventImage,
            locationID: event.locationID,
            locationName: event.locationName,
            cost: event.cost,
            calculatedRegionName: event.calculatedRegionName,
            calculatedDivisionName: event.calculatedDivisionName,
            calculatedCityName: event.calculatedCityName,
            active: event.active,
            recurrenceRule: event.recurrenceRule,
            ownerOrganizerID: event.ownerOrganizerID,
            grantedOrganizerID: event.grantedOrganizerID,
            alternateOrganizerID: event.alternateOrganizerID,
            ownerOrganizerName: event.ownerOrganizerName,
            featured: event.featured,
        }
    }));

}