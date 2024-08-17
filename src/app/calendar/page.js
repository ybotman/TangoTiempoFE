"use client"; // Add this line at the top

import { useState, useEffect } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
import { useFullCalenderDateRange } from '@/hooks/useFullCalendarDateRange';
import UserStateRole from '@/components/UI/UserStateRole';
import useOrganizers from '@/hooks/useOrganizers'; // Import the organizers hook
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import {
  AppBar, Toolbar, Typography,
  Button, Select, MenuItem,
  Checkbox, ListItemText
} from '@mui/material';

import EventDetailsModal from '@/components/Modals/EventDetailsModal';
//import '@/styles/calendarStyles.css';

const CalendarPage = () => {
  const regions = useRegions();
  const organizers = useOrganizers();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  const [currentRole, setCurrentRole] = useState('anonomous');
  const events = useEvents(selectedRegion, dateRange);


  // Filter events post API pull

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

  const applyFilter = true; // Set this to true to enable filtering
  console.log('Prep filteredEvents:', events); // Check the value of events
  console.log('Prep filteredEvents, Is events an array?', Array.isArray(events));

  const filteredEvents = events;
  console.log('')
  /*
  ?
    (applyFilter ? events.filter(event => {
      const isOrganizerMatch = selectedOrganizers.length
        ? selectedOrganizers.includes(event.ownerOrganizerID)
        : true;

      const isCategoryMatch = selectedCategories.length
        ? selectedCategories.includes(event.categoryFirst)
        : true;
      console.log(`Array.isArray(events)`, Array.isArray(events))
      console.log(`Event: ${event.title}`);
      console.log(`Organizer Match: ${isOrganizerMatch}`);
      console.log(`Category Match: ${isCategoryMatch}`);

      return isOrganizerMatch && isCategoryMatch;
    }) : events)
    : [];
*/

  console.log('About to return Filtered Events:', events);
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
            style={{ color: 'lightGrey' }}
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
            {organizers && organizers.length > 0 ? (
              organizers.map((organizer) => (
                <MenuItem key={organizer._id} value={organizer._id}>
                  {organizer.organizerName}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No Organizers Available</MenuItem>
            )}
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
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}
        height="auto"
        contentHeight="auto"
        headerToolbar={{
          left: 'prev,today,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }}
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