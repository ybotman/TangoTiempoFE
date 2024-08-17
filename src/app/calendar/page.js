"use client"; // Add this line at the top

import { useState } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
import { useFullCalenderDateRange } from '@/hooks/useFullCalendarDateRange';
import useOrganizers from '@/hooks/useOrganizers';
import { filterEvents } from '@/utils/filterEvents';
import EventDetailsModal from '@/components/Modals/EventDetailsModal';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import SiteHeader from '@/components/UI/SiteHeader';


import '@/styles/calendarStyles.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';


const CalendarPage = () => {
  const regions = useRegions();
  const organizers = useOrganizers();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  //const [currentRole, setCurrentRole] = useState('anonomous');
  const events = useEvents(selectedRegion);


  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleOrganizerChange = (event) => {
    setSelectedOrganizers(event.target.value);
  };

  const filteredEvents = filterEvents(events, selectedOrganizers);

  return (
    <div>
      <SiteHeader />
      <SiteMenuBar
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        regions={regions}
        selectedOrganizers={selectedOrganizers}
        handleOrganizerChange={handleOrganizerChange}
        organizers={organizers}
      />

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
          right: 'dayGridMonth,timeGridWeek,listWeek',
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

/*

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
        <Select
          multiple
          value={selectedOrganizers}
          onChange={handleOrganizerChange}
          renderValue={() => 'Select Organizers'}  // Always show placeholder text
          style={{ color: 'white' }}
          displayEmpty
        >
          {organizers.map((organizer) => (
            <MenuItem key={organizer._id} value={organizer._id}>
              <Checkbox checked={selectedOrganizers.includes(organizer._id)} />
              <ListItemText primary={organizer.organizerName} />
            </MenuItem>
          ))}
        </Select>

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
*/