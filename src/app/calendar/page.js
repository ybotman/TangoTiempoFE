"use client"; // Add this line at the top

import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

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
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { dateRange, handleDatesSet } = useFullCalenderDateRange();
  const events = useEvents(selectedRegion);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
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

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setSelectedDate(null);
  };

  const handleOrganizerChange = (event) => {
    setSelectedOrganizers(event.target.value);
    console.log('OrgChange:', event.target.value);
  };

  const filteredEvents = filterEvents(events, selectedOrganizers);
  const coloredFilteredEvents = filteredEvents.map(event => ({
    ...event,
    backgroundColor: categoryColors[event.extendedProps.categoryFirst] || 'lightGrey', // Default to lightGrey if no match
    textColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black', // Example logic for text color
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
        selectedCategories={selectedCategories}
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
