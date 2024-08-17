"use client"; // Add this line at the top

import { useState } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
import { useFullCalenderDateRange } from '@/hooks/useFullCalendarDateRange';
import UserStateRole from '@/components/UI/UserStateRole';
import useOrganizers from '@/hooks/useOrganizers'; // Import the organizers hook
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  AppBar, Toolbar, Typography,
  Button, Select, MenuItem,
  Checkbox, ListItemText
} from '@mui/material';

import EventDetailsModal from '@/components/Modals/EventDetailsModal';

const CalendarPage = () => {
  const regions = useRegions();
  const organizers = useOrganizers();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  const events = useEvents(selectedRegion, dateRange);
  // Current Role state
  const [currentRole, setCurrentRole] = useState('anonomous');


  // Filter events based on selected organizers
  const filteredEvents = selectedOrganizers.length
    ? events.filter(event => selectedOrganizers.includes(event.organizerID))
    : events;

  // Define the selectedEvent state
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleOrganizerChange = (event) => {
    setSelectedOrganizers(event.target.value);
  };

  const resetOrganizers = () => {
    setSelectedOrganizers([]);
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
            Welcome:
          </Typography>
          <Select
            value={selectedRegion || ""}
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

          {/* Dropdown for selecting organizers */}
          <Select
            multiple
            value={selectedOrganizers}
            onChange={handleOrganizerChange}
            style={{ color: 'white' }}
            displayEmpty
            renderValue={(selected) => selected.length ? organizers.filter(o => selected.includes(o._id)).map(o => o.organizerName).join(', ') : 'Select Organizers'}
          >
            <MenuItem value="">
              <em>All Organizers</em>
            </MenuItem>
            {organizers.map((organizer) => (
              <MenuItem key={organizer._id} value={organizer._id}>
                {organizer.organizerName}
              </MenuItem>
            ))}
          </Select>

          {selectedOrganizers.length > 0 && (
            <Button onClick={resetOrganizers} color="inherit" sx={{ marginLeft: '10px' }}>
              Reset Organizers
            </Button>
          )}
          <UserStateRole currentRole={currentRole} setCurrentRole={setCurrentRole} />

        </Toolbar>
      </AppBar>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}
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
};

export default CalendarPage;