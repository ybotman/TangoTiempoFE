import axios from 'axios';

// Define the API URL
const apiUrl = 'https://bostontangocalendar.com/wp-json/tribe/events/v1/events';

// Fetch the data
axios.get(apiUrl)
    .then(response => {
        const events = response.data.events;

        // Transform the events to fit your calendar's required format
        const transformedEvents = events.map(event => ({
            title: event.title,
            start: event.utc_start_date,
            end: event.utc_end_date,
            description: event.description,
            url: event.url,
            image: event.image.url,
            //            category: event.categories.map(cat => cat.name).join(', '),
            //            location: `${event.venue.venue}, ${event.venue.address}, ${event.venue.city}`,
            region: 'Boston' // Map all events to the Boston region
        }));

        // Log the transformed data or use it in your application
        //console.log('Transformed Events:', transformedEvents);

        // Example: Insert into your calendar or database
        transformedEvents.forEach(event => {
            // Insert event into your calendar
            // calendar.addEvent(event); // Assuming you have a method to add events to the calendar
        });
    })
    .catch(error => {
        console.error('Error fetching events:', error);
    });