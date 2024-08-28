// Define category colors
export const categoryColors = {
    Festival: 'green',
    Milonga: 'blue',
    Practica: 'cyan',
    Class: 'lightPink',
    Workshop: 'lightgreen',
    Trip: 'yellow',
    Virtual: 'lightGray'
};

// Function to filter events based on active categories and apply colors
export const coloredFilteredEvents = (events, activeCategories) => {
    if (!Array.isArray(events)) return [];

    // If no active categories are selected, return all events
    if (activeCategories.length === 0) {
        return events;
    }

    // Filter events based on active categories and apply colors
    return events.map(event => ({
        ...event,
        backgroundColor: categoryColors[event.categoryFirst] || 'defaultColor',
    })).filter(event => activeCategories.includes(event.categoryFirst));
};
