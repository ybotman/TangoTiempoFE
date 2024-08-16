"use client"; // Add this line at the top

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_TANGO_API_URL);

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/eventsAll`);

        // Check if the response is okay and parse JSON
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Data:", data);  // Log the fetched data
          setEvents(data);
        } else {
          console.error('Failed to fetch events:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  return (
    <div>
      <h1>My Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
    </div>
  );
}