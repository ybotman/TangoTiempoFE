"use client";

import React from 'react';
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

import SiteHeader from '@/components/UI/SiteHeader';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import EventDetailsModal from '@/components/Modals/EventDetailsModal';
import EventCRUDModal from '@/components/Modals/EventCRUDModal';
import { useCalendarPage } from '@/hooks/useCalendarPage';

const CalendarPage = () => {
  console.log('CalendarPage cont:')
  const {
    regions,
    categories,
    activeCategories,
    selectedOrganizers,
    selectedEvent,
    isCreateModalOpen,
    selectedRegion,
    selectedDivision,
    selectedCity,
    selectedDate,
    organizers,
    calendarRef,
    setSelectedRegion,
    setSelectedDivision,
    setSelectedCity,
    setCreateModalOpen,
    setSelectedEvent,
    handleDatesSet,
    handleEventCreated,
    handleCategoryChange,
    handlePrev,
    handleNext,
    handleToday,
    handleDateClick,
    handleEventClick,
    handleOrganizerChange,
    coloredFilteredEvents
  } = useCalendarPage();

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
        {/* Navigation buttons */}
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

        {/* View switching buttons */}
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
        datesSet={handleDatesSet}  // Pass the handleDatesSet here
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
};

export default CalendarPage;