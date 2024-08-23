"use client"; // Add this line at the top

import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import React from 'react';

import { useFullCalenderDateRange } from '@/hooks/useFullCalendarDateRange';
import { useRegions } from '@/hooks/useRegions';
import { useEvents } from '@/hooks/useEvents';
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
  //const { currentRole, setCurrentRole } = useRole();
  const regions = useRegions();
  const organizers = useOrganizers();
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { handleDatesSet } = useFullCalenderDateRange();
  const events = useEvents(selectedRegion);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  //        const response = await axios.get('https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/regions');

  const forcedAPI = 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/categories'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("fetchCategories axios request: ", forcedAPI)

        const response = await axios.get(forcedAPI);

        //const response = await axios.get(`${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/categories`);

        console.log("fetchCategories axios.get response:", response)
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

  }, []);


  const handleCategoryChange = (updatedCategories) => {
    setActiveCategories(updatedCategories);
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

  const filteredEvents = filterEvents(events, selectedOrganizers, activeCategories);
  const coloredFilteredEvents = filteredEvents.map(event => ({
    ...event,
    backgroundColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    textColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
    displayEventTime: true,
    borderColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    eventBackgroundColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey',
    eventTextColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
  }));

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
        //onCreate={handleEventCreated}
        />
      )}
    </div>
  );
  //end of return

};

export default CalendarPage;
