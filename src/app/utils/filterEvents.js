export const filterEvents = (events, activeCategories) => {
    if (!Array.isArray(events)) return [];

    console.log('filterEvents received events:', events);
    console.log('filterEvents received activeCategories:', activeCategories);

    if (activeCategories.length === 0) {
        console.log('No active categories selected. Returning all post-api events:', events);
        return events;
    }

    // Filter events based on any matching category (categoryFirst, categorySecond, or categoryThird)
    const filteredEvents = events.filter(event => {
        const { categoryFirst, categorySecond, categoryThird } = event.extendedProps || {};

        return (
            activeCategories.includes(categoryFirst) ||
            activeCategories.includes(categorySecond) ||
            activeCategories.includes(categoryThird)
        );
    });

    console.log('Filtered events to be returned:', filteredEvents);
    return filteredEvents;
};