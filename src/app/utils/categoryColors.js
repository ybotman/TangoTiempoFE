// Define category colors
export const categoryColors = {
  Festival: 'Red',
  Milonga: 'DodgerBlue',
  Practica: 'cyan',
  Class: 'yellow',
  Workshop: 'HotPink',
  Trip: 'yellowGreen',
  Virtual: 'Orange',
  DayWorkshop: 'PaleGreen',
  Unknown: 'lightGrey',
};

export const coloredFilteredEvents = (events, activeCategories) => {
  if (!Array.isArray(events)) return [];

  // Filter events based on active categories
  const filteredEvents =
    activeCategories.length === 0
      ? events // If no active categories, return all events
      : events.filter((event) =>
          activeCategories.includes(event.categoryFirst)
        );

  // Apply colors to the filtered events
  const coloredEvents = filteredEvents.map((event) => {
    const categoryColor = categoryColors[event.categoryFirst] || 'lightGrey'; // Default color
    return {
      ...event,
      backgroundColor: categoryColor,
      textColor: categoryColor,
    };
  });

  //  console.log('Colored events:', coloredEvents); // Debugging log to check colored events
  return coloredEvents;
};
