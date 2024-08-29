"use client"; // Add this line at the top

import { useState } from 'react';
import { useEffect } from 'react';
import React from 'react';

import { useFullCalendarDateRange } from '@/hooks/useFullCalendarDateRange';
import { useRegions } from '@/hooks/useRegions';
import { useEvents, setEvents } from '@/hooks/useEvents';
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
  //const events = useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);
  const { events, refreshEvents } = useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);

  console.log("***--->>  page.js NEXT_PUBLIC_TangoTiempoBE_URL:", process.env.NEXT_PUBLIC_TangoTiempoBE_URL);
  console.log("***--->>  page.js NEXT_PUBLIC_POC_MESSAGE:", process.env.NEXT_PUBLIC_POC_MESSAGE);
  console.log("***--->>  page.js NEXT_PUBLIC_BUILD_VERSION:", process.env.NEXT_PUBLIC_BUILD_VERSION);
  console.log("***--->>  page.js ABC:", process.env.ABC);



  const handleEventCreated = async () => {
    try {
      await refreshEvents(); // Manually trigger a refresh of the events
    } catch (error) {
      console.error('Error refreshing events after creation:', error);
    }
  }; const organizers = useOrganizers(selectedRegion);

  const handleCategoryChange = (activeCategories) => {
    console.log("handleCategoryChange: Updated Categories:", activeCategories);
    setActiveCategories(activeCategories);
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

  useEffect(() => {
    //console.log('Filtered Events:', filteredEvents, activeCategories);
  }, [filteredEvents], activeCategories);

  useEffect(() => {
    //console.log("Calendar Start Date:", calendarStart);
    //console.log("Calendar End Date:", calendarEnd);
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

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={coloredFilteredEvents}
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}
        dateClick={handleDateClick}
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
