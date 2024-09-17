// Define category colors
export const categoryColors = {
  Festival: 'green',
  Milonga: 'blue',
  Practica: 'cyan',
  Class: 'lightPink',
  Workshop: 'lightgreen',
  Trip: 'yellow',
  Virtual: 'lightGray',
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
      backgroundColor: categoryColor, // Set background to the category color
      textColor: categoryColor, // Set text color to match the background (for debugging, you can change this)
    };
  });

  //  console.log('Colored events:', coloredEvents); // Debugging log to check colored events
  return coloredEvents;
};
