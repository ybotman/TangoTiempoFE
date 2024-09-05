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

import { transformEvents } from '@/utils/transformEvents';

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

import { ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ListIcon from '@mui/icons-material/List';


const CalendarPage = () => {

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
  const { events, refreshEvents } =
    useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);

  const calendarRef = useRef(null);
  const organizers = useOrganizers(selectedRegion);


  const handleEventCreated = async () => {
    try {
      await refreshEvents(); // Manually trigger a refresh of the events
    } catch (error) {
      console.error('Error refreshing events after creation:', error);
    }
  };

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

  const handleOrganizerChange = (value) => {
    if (value === "none") {
      setSelectedOrganizers([]);  // No organizer filter applied
    } else {
      setSelectedOrganizers([value]);  // Filter by selected organizer
    }
    console.log('OrgChange:', value);
  };

  const tranformedEvents = transformEvents(events);
  const filteredEvents = filterEvents(tranformedEvents, activeCategories, selectedOrganizers);

  const coloredFilteredEvents = filteredEvents.map(event => {
    console.log('Event categoryFirst:', event.extendedProps.categoryFirst); // Check if categoryFirst exists
    const categoryColor = categoryColors[event.extendedProps.categoryFirst] || 'lightGrey';

    return {
      ...event,
      backgroundColor: categoryColor,
      textColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
      displayEventTime: true,
      borderColor: categoryColor,
      eventBackgroundColor: categoryColor,
      eventTextColor: event.extendedProps.categoryFirst === 'Milonga' ? 'grey' : 'black',
    };
  });
  useEffect(() => {
  }, [filteredEvents], [calendarStart, calendarEnd], activeCategories);


  useEffect(() => {
    console.log('CalendarPage re-rendered due to selectedRegion or related state change', {
      selectedRegion,
      selectedDivision,
      selectedCity,
      calendarStart,
      calendarEnd
    });
  }, [selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd]);

  useEffect(() => {
    console.log('Events changed:', events);
  }, [events]);


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
        scrollTime="17:00:00"
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
