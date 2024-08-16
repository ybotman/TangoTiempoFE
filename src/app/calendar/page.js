"use client"; // Add this line at the top

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import { transformEvents } from '@/utils/transformEvents';  // Ensure this path is correct

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_TANGO_API_URL);

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/eventsAll`);

        if (response.ok) {
          const events = await response.json();
          console.log("Fetched Data:", events);  // Log the fetched data

          // Transform the data before setting it in state
          const formattedEvents = transformEvents(events);
          setEvents(formattedEvents);
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