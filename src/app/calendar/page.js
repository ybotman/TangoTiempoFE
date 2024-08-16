"use client";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import { transformEvents } from '@/utils/transformEvents';
import UserStateRole from '@/components/UI/UserStateRole';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';



export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_TANGO_API_URL);

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/eventsAll`);

        if (response.ok) {
          const events = await response.json();
          console.log("Fetched Data:", events);

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
      {/* Toolbar with menu items */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Calendar
          </Typography>
          <Button color="inherit">Organizer</Button>
          <Button color="inherit">2</Button>
          <Button color="inherit">3</Button>
          <UserStateRole />  {/* User state role icon */}
        </Toolbar>
      </AppBar>

      {/* Calendar component */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
    </div>
  );
  //End of Return
}
