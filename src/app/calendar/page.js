"use client";

import React from 'react';
//import { useEffect } from 'react';
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
import NoRegionSelectedModal from '@/components/Modals/NoRegionSelectedModal';
import RegionalOrgDateClickModal from '@/components/Modals/RegionalOrgDateClickModal';
import { useCalendarPage } from '@/hooks/useCalendarPage';  // Make sure this hook is import
//import { useAuth } from '@/hooks/useAuth';


const CalendarPage = () => {
  const {
    regions,
    categories,
    activeCategories,
    selectedOrganizers,
    selectedEvent,
    isCreateModalOpen,
    isRegionalOrganizer,
    isNoRegionSelectedModalOpen,
    isRegionalOrgDateClickModalOpen,  // Ensure this is correctly referenced
    setRegionalOrgDateClickModalOpen,
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
    setNoRegionSelectedModalOpen,
    handleDatesSet,
    handleEventCreated,
    handleCategoryChange,
    handlePrev,
    handleNext,
    handleToday,
    handleDateClick,
    handleEventClick,
    handleOrganizerChange,
    coloredFilteredEvents,
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
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}  // Use role-aware event click from useCalendarPage
        dateClick={handleDateClick}  // Use role-aware date click from useCalendarPage
        ref={calendarRef}
        headerToolbar={false}
        scrollTime="17:00:00"
      />

      {/* Conditionally render modals based on role */}
      {isRegionalOrganizer ? (
        isCreateModalOpen && (
          <EventCRUDModal
            open={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            selectedDate={selectedDate}
            selectedRegion={selectedRegion}
            onCreate={handleEventCreated}
          />
        )
      ) : (
        selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            open={Boolean(selectedEvent)}
            onClose={() => setSelectedEvent(null)}
          />
        )
      )}

      {/* RegionalOrgDateClickModal */}
      {isRegionalOrgDateClickModalOpen && (
        <RegionalOrgDateClickModal
          open={isRegionalOrgDateClickModalOpen}
          onClose={() => setRegionalOrgDateClickModalOpen(false)}  // Close modal
          selectedDate={selectedDate}
        />
      )}

      {/* NoRegionSelectedModal */}
      {isNoRegionSelectedModalOpen && (
        <NoRegionSelectedModal
          open={isNoRegionSelectedModalOpen}
          onClose={() => setNoRegionSelectedModalOpen(false)}  // Close modal
        />
      )}
    </div>
  );
};

export default CalendarPage;