// app/calendar/page.js

'use client';
import Head from 'next/head';
import React, { useContext } from 'react';
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
import { RegionsContext } from '@/contexts/RegionsContext';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import CalendarSubMenu from '@/components/UI/CalendarSubMenu';
import CreateEventModal from '@/components/Modals/CreateEventModal';
import ViewEventDetailModal from "@/components/Modals/ViewEventDetailModal.js";

const CalendarPage = () => {
  <Head>
    <title>Tango Tiempo - A national Tango Events Calendar </title>
    <meta
      name="description"
      content="Browse and find upcoming tango events in your region. Updated regularly with new listings."
    />
    <meta
      name="keywords"
      content="tango, tango events, local tango calendar, tango festivals"
    />
    <meta name="robots" content="index, follow" />
    <meta
      property="og:title"
      content="Tango Tiempo - Find Local Tango Events"
    />
    <meta
      property="og:description"
      content="Browse and find upcoming tango events in your region."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.tangotiempo.com" />
  </Head>;

  const { regions } = useContext(RegionsContext);
  //  const { selectedOrganizers, selectedCategories } = now where??
  //const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const {
    menuAnchor,
    menuItems,
    categories,
    clickedDate,
    handleMenuAction,
    handleMenuClose,
    activeCategories,
    handleCategoryChange,
    selectedRegion,
    selectedDivision,
    selectedCity,
    organizers,
    calendarRef,
    setSelectedRegion,
    setSelectedDivision,
    setSelectedCity,
    isCreateModalOpen,
    setCreateModalOpen,
    isViewDetailModalOpen,
    setViewDetailModalOpen,
    selectedEventDetails,
    handleDatesSet,
    handleRegionChange,
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
      {/* A lot of unnecessary arguments */}
      <SiteMenuBar
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        regions={regions}
        handleRegionChange={handleRegionChange}
        organizers={organizers}
        handleOrganizerChange={handleOrganizerChange}
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '20px',
        }}
      >
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

        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <IconButton
            onClick={() =>
              calendarRef.current.getApi().changeView('dayGridMonth')
            }
          >
            <CalendarMonthIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              calendarRef.current.getApi().changeView('timeGridWeek')
            }
          >
            <ViewWeekIcon />
          </IconButton>
          <IconButton
            onClick={() => calendarRef.current.getApi().changeView('listWeek')}
          >
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
      {/* SubMenu */}
      <CalendarSubMenu
        menuAnchor={menuAnchor}
        handleClose={handleMenuClose}
        menuItems={menuItems}
        onActionSelected={handleMenuAction}
      />

      <CreateEventModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        selectedDate={clickedDate}
        selectedRegion={selectedRegion}
      />

      <ViewEventDetailModal
        open={isViewDetailModalOpen}
        onClose={() => setViewDetailModalOpen(false)}
        selectedDate={clickedDate}
        eventDetails={selectedEventDetails}
       // selectedRegion={selectedRegion}
      />
    </div>
  );
};

export default CalendarPage;
