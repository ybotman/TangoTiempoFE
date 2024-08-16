"use client"; // Add this line at the top

import { useState } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
import { useFullCalenderDateRange } from '@/hooks/useFullCalendarDateRange';
import UserStateRole from '@/components/UI/UserStateRole';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { AppBar, Toolbar, Typography, Button, Select, MenuItem } from '@mui/material';
import EventDetailsModal from '@/components/Modals/EventDetailsModal';

const CalendarPage = () => {
  const regions = useRegions();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  const events = useEvents(selectedRegion, dateRange);

  // Define the selectedEvent state
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  return (
    <div>
      <img
        src="/TangoTiempo4.jpg"
        alt="Tango Tiempo"
        style={{ width: '100%', height: 'auto' }}
      />

      <AppBar position="static" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Calendar
          </Typography>
          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{ color: 'white' }}
            displayEmpty
          >
            <MenuItem value="">
              <em>Select a Region</em>
            </MenuItem>
            {regions.map((region) => (
              <MenuItem key={region._id} value={region.regionName}>
                {region.regionName}
              </MenuItem>
            ))}
          </Select>
          <Button color="inherit">Menu Item 1</Button>
          <Button color="inherit">Menu Item 2</Button>
          <UserStateRole />
        </Toolbar>
      </AppBar>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}  // Handle event clicks
      />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default CalendarPage;