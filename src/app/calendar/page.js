// app/calendar/page.js

"use client";
import Head from 'next/head';
import React, {useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { ButtonGroup, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ListIcon from "@mui/icons-material/List";

import SiteHeader from "@/components/UI/SiteHeader";
import SiteMenuBar from "@/components/UI/SiteMenuBar";
//import { CalendarContext } from '@/contexts/CalendarContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { PostFilterContext } from '@/contexts/PostFilterContext';
import { useCalendarPage } from "@/hooks/useCalendarPage";
import CalendarSubMenu from "@/components/UI/CalendarSubMenu";  
import CreateSingleEventModal from '@/components/Modals/CreateSingleEventModal';
//import EventDetailsModal from "@/components/Modals/EventDetailsModal";
//import EventCRUDModal from "@/components/Modals/EventCRUDModal";

const CalendarPage = () => {
      <Head>
      <title>Tango Tiempo - A national Tango Events Calendar </title>
      <meta name="description" content="Browse and find upcoming tango events in your region. Updated regularly with new listings." />
      <meta name="keywords" content="tango, tango events, local tango calendar, tango festivals" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content="Tango Tiempo - Find Local Tango Events" />
      <meta property="og:description" content="Browse and find upcoming tango events in your region." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.tangotiempo.com" />
      </Head>
  
  //const { datesSet, setDatesSet } = useContext(CalendarContext);
  const { regions } = useContext(RegionsContext);
  const [clickedDate, setClickedDate] = useState(null); // Initialize clickedDate
  const { selectedOrganizers, selectedCategories } = useContext(PostFilterContext);
  //const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const {
        menuAnchor,
    menuItems,
    categories,
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
    setSelectedEvent,
    isCreateModalOpen,
    setCreateModalOpen,
    handleDatesSet,
    handleEventCreated,
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
        selectedOrganizers={selectedOrganizers}
        handleOrganizerChange={handleOrganizerChange}
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px",
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
              calendarRef.current.getApi().changeView("dayGridMonth")
            }
          >
            <CalendarMonthIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              calendarRef.current.getApi().changeView("timeGridWeek")
            }
          >
            <ViewWeekIcon />
          </IconButton>
          <IconButton
            onClick={() => calendarRef.current.getApi().changeView("listWeek")}
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

      <CreateSingleEventModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        selectedDate={clickedDate}
        selectedRegion={selectedRegion}
      />

    </div>
  );
};

export default CalendarPage;

