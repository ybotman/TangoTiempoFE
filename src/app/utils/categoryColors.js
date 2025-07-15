// Define category colors
export const categoryColors = {
  // AppId 1 Categories (Tango)
  Festival: 'Red',
  Milonga: 'DodgerBlue',
  Practica: 'cyan',
  Marathon: 'Orange',
  Class: 'yellow',
  Workshop: 'HotPink',
  DayWorkshop: 'PaleGreen',
  Trip: 'yellowGreen',
  Unknown: 'lightGrey',

  // AppId 2 Categories (Barbershop)
  'Chapter Show': 'MediumPurple',
  Convention: 'Crimson',
  'International Contest': 'Gold',
  'Public Gathering': 'CornflowerBlue',
  'Quartet Show': 'MediumOrchid',
  'Regional Contest': 'Tomato',
  'Schools & University': 'MediumSeaGreen',
  'Private Gathering': 'RosyBrown',
};

export const coloredFilteredEvents = (events, activeCategories) => {
  if (!Array.isArray(events)) return [];

  // Filter events based on active categories
  const filteredEvents =
    activeCategories.length === 0
      ? events // If no active categories, return all events
      : events.filter((event) => activeCategories.includes(event.categoryFirst));

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
