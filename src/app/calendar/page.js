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
  const organizers = useOrganizers(); // Fetch the organizers
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  const events = useEvents(selectedRegion, dateRange);

  // Define the selectedEvent state
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleOrganizerChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedOrganizers(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // Function to reset organizer filter
  const resetOrganizerFilter = () => {
    setSelectedOrganizers([]);
  };

  // Filter events by selected organizers
  const filteredEvents = events.filter(event =>
    selectedOrganizers.length === 0 || selectedOrganizers.includes(event.organizerName)
  );

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
            displayEmpty
            style={{ color: 'white', marginLeft: '10px' }}
            renderValue={(selected) =>
              selected.length === 0 ? <em>All Organizers</em> : selected.join(', ')
            }
          >
            <MenuItem value={[]}>
              <em>All Organizers</em>
            </MenuItem>
            {organizers.map((organizer) => (
              <MenuItem key={organizer._id} value={organizer._id}>
                <Checkbox checked={selectedOrganizers.indexOf(organizer._id) > -1} />
                <ListItemText primary={organizer.name} />
              </MenuItem>
            ))}
          </Select>

          <Button onClick={resetOrganizerFilter} color="inherit" sx={{ marginLeft: '10px' }}>
            Reset Organizers
          </Button>
          <UserStateRole />
        </Toolbar>
      </AppBar>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}  // Use filtered events here
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