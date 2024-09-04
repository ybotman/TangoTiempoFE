"use client"; // Add this line at the top

import { useState, useRef } from 'react';
import { useEffect } from 'react';
import React from 'react';

import { useFullCalendarDateRange } from '@/hooks/useFullCalendarDateRange';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
import useCategories from '@/hooks/useCategories'
import useOrganizers from '@/hooks/useOrganizers';
import { filterEvents } from '@/utils/filterEvents';
import EventDetailsModal from '@/components/Modals/EventDetailsModal';
import EventCRUDModal from '@/components/Modals/EventCRUDModal';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import SiteHeader from '@/components/UI/SiteHeader';
import { categoryColors } from '@/utils/categoryColors';

import '@/styles/calendarStyles2.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import { Button, ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ListIcon from '@mui/icons-material/List';


const CalendarPage = () => {
  console.log('**CalendarPage Functions and useStates');
  const regions = useRegions();
  const categories = useCategories();
  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const { dateRange, handleDatesSet } = useFullCalendarDateRange();
  const calendarStart = dateRange.firstCalDt;
  const calendarEnd = dateRange.lastCalDt;

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const { events, refreshEvents } = useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);
  const calendarRef = useRef(null);  // Define calendarRef


  const handleEventCreated = async () => {
    try {
      await refreshEvents(); // Manually trigger a refresh of the events
    } catch (error) {
      console.error('Error refreshing events after creation:', error);
    }
  }; const organizers = useOrganizers(selectedRegion);

  const handleCategoryChange = (activeCategories) => {
    setActiveCategories(activeCategories);
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };

  const handleDateClick = (clickInfo) => {
    setSelectedDate(clickInfo.date); // Set the selected date from the clicked date
    console.log('Date clicked:', clickInfo.date)//, 'By Role: ', currentRole);
    setCreateModalOpen(true); // Open the create event modal
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    console.log('Event clicked:', clickInfo.event.title);
  };

  const handleOrganizerChange = (event) => {
    setSelectedOrganizers(event.target.value);
    console.log('OrgChange:', event.target.value);
  };


  const filteredEvents = filterEvents(events, activeCategories);

  const coloredFilteredEvents = filteredEvents.map(event => ({
    ...event,
    backgroundColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    textColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
    displayEventTime: true,
    borderColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    eventBackgroundColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    eventTextColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
  }));

  const renderToolbarButtons = () => {
    return (
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={() => calendarRef.current.getApi().prev()}>Prev</Button>
        <Button onClick={() => calendarRef.current.getApi().today()}>Today</Button>
        <Button onClick={() => calendarRef.current.getApi().next()}>Next</Button>
      </ButtonGroup>
    );
  };

  useEffect(() => {
    console.log('UseEffect Filtered Events:', filteredEvents, activeCategories);
  }, [filteredEvents], activeCategories);

  useEffect(() => {
    console.log("UseEffect Calendar start/end startate:", calendarStart);
  }, [calendarStart, calendarEnd]);

  return (
    <div>
      <SiteHeader />

      <SiteMenuBar
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        regions={regions}
        organizers={organizers}
        selectedOrganizers={selectedOrganizers}
        handleOrganizerChange={handleOrganizerChange}
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
        {/* Navigation buttons with icons */}
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <IconButton onClick={handlePrev}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={handleToday}>
            <TodayIcon />
          </IconButton>
          <IconButton onClick={handleNext}>
            <ArrowForwardIcon />
          </IconButton>
        </ButtonGroup>

        {/* View switching buttons with icons */}
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <IconButton onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}>
            <CalendarMonthIcon />
          </IconButton>
          <IconButton onClick={() => calendarRef.current.getApi().changeView('timeGridWeek')}>
            <ViewWeekIcon />
          </IconButton>
          <IconButton onClick={() => calendarRef.current.getApi().changeView('listWeek')}>
            <ListIcon />
          </IconButton>
        </ButtonGroup>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={coloredFilteredEvents}
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        ref={calendarRef}
        headerToolbar={false}
      />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          open={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {isCreateModalOpen && (
        <EventCRUDModal
          open={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          selectedDate={selectedDate}
          selectedRegion={selectedRegion}
          onCreate={handleEventCreated}
        />
      )}
    </div>
  );
  //end of return

};

export default CalendarPage;
