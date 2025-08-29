// app/calendar/boston/page.js
// Boston Legacy Route for bostontangocalendar.com iframe compatibility

'use client';
import Head from 'next/head';
import React, { useEffect, useState, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListIcon from '@mui/icons-material/List';
import Image from 'next/image';

import SiteMenuBar from '@/components/UI/SiteMenuBar';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import CalendarSubMenu from '@/components/UI/CalendarSubMenu';
import CreateEventDetailModal from '@/components/Modals/CreateEvents/CreateEventDetailModal';
import ViewEventDetailModal from '@/components/Modals/ViewEvents/ViewEventDetailModal.js';
import ViewAIEventDetails from '@/components/Modals/ViewEvents/ViewAIEventDetails';
import CategoryCircles from '@/components/UI/CategoryCircles';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';

// Boston configuration - locked coordinates
const BOSTON_CONFIG = {
  lat: 42.3601,
  lng: -71.0589,
  zoomRange: 30, // 30 mile radius around Boston
  source: 'legacy-boston',
  locked: true
};

const BostonCalendarPage = () => {
  <Head>
    <title>Boston Tango Calendar - Tango Events in Boston Area</title>
    <meta
      name="description"
      content="Browse and find upcoming tango events in the Boston area. Updated regularly with new listings."
    />
    <meta name="keywords" content="boston tango, tango events, boston tango calendar, tango festivals" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Boston Tango Calendar - Find Boston Area Tango Events" />
    <meta property="og:description" content="Browse and find upcoming tango events in the Boston area." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.tangotiempo.com/calendar/boston" />
  </Head>;

  // Get GeoLocation context but we'll override it
  const { 
    setCurrentLocation, 
    setSavedLocation,
    currentLocation 
  } = useGeoLocation();

  // Auth and Role contexts
  const { user } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);

  // Force Boston location on mount
  useEffect(() => {
    // Only set if not already set to Boston
    if (currentLocation?.source !== 'legacy-boston') {
      setCurrentLocation(BOSTON_CONFIG);
      setSavedLocation(BOSTON_CONFIG);
    }
  }, []); // Run once on mount

  // Get all the calendar functionality from the hook
  const {
    events = [],
    categories = [],
    activeCategories = [],
    handleCategoryChange,
    searchTerm,
    setSearchTerm,
    calendarRef,
    currentViewType,
    setCurrentViewType,
    today,
    handlePrev,
    handleNext,
    handleTodayClick,
    selectedEvent,
    handleEventClick,
    isViewEventModalOpen,
    handleModalClose,
    loading,
    error,
    calendarApi,
    noLocationSelected,
    includeAIEvents,
    setIncludeAIEvents,
    selectedAIEvent,
    isViewAIEventModalOpen,
    handleAIModalClose,
    isCreateEventModalOpen,
    selectedDateInfo,
    handleDateClick,
    handleCreateEventModalClose,
  } = useCalendarPage();

  // Handle month view rendering
  const handleDayCellDidMount = (info) => {
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.start).toDateString();
      const cellDate = new Date(info.date).toDateString();
      return eventDate === cellDate;
    });

    const uniqueCategories = [...new Set(dayEvents.map((e) => e.category))];
    const maxCircles = 3;
    const visibleCategories = uniqueCategories.slice(0, maxCircles);
    const remainingCount = uniqueCategories.length - maxCircles;

    if (visibleCategories.length > 0) {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.gap = '2px';
      container.style.position = 'absolute';
      container.style.bottom = '2px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';

      visibleCategories.forEach((cat) => {
        const circle = document.createElement('div');
        const category = categories.find((c) => c.id === cat);
        if (category) {
          circle.style.width = '8px';
          circle.style.height = '8px';
          circle.style.borderRadius = '50%';
          circle.style.backgroundColor = category.color;
          container.appendChild(circle);
        }
      });

      if (remainingCount > 0) {
        const moreText = document.createElement('span');
        moreText.textContent = `+${remainingCount}`;
        moreText.style.fontSize = '8px';
        moreText.style.marginLeft = '2px';
        container.appendChild(moreText);
      }

      info.el.style.position = 'relative';
      info.el.appendChild(container);
    }
  };

  // Handle view changes based on window width
  useEffect(() => {
    const handleWindowResize = () => {
      const width = window.innerWidth;
      const calendarApi = calendarRef.current?.getApi();
      
      if (width < 768 && calendarApi && currentViewType === 'dayGridMonth') {
        calendarApi.changeView('list21Days');
        setCurrentViewType('list21Days');
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calendarRef]);

  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Boston Header Image */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'auto',
        maxHeight: '200px',
        overflow: 'hidden'
      }}>
        <img 
          src="/defaults/BTCHeader.jpg" 
          alt="Boston Tango Calendar"
          style={{ 
            width: '100%', 
            height: 'auto',
            display: 'block'
          }}
        />
      </div>

      {/* Optional: Soft auth encouragement banner for non-logged users */}
      {!user && (
        <div style={{
          background: 'linear-gradient(to right, #f0f0f0, #e0e0e0)',
          padding: '10px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #ccc'
        }}>
          <span style={{ marginRight: '10px' }}>
            Sign in to save your favorite events and get personalized recommendations!
          </span>
          <a 
            href="/login" 
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Sign In
          </a>
        </div>
      )}

      <SiteMenuBar
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showDiscovered={includeAIEvents}
        onDiscoveredToggle={() => setIncludeAIEvents(!includeAIEvents)}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          margin: '20px',
        }}
      >
        {/* Calendar Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <ButtonGroup variant="outlined" size="small">
            <IconButton onClick={handlePrev} title="Previous">
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleTodayClick} title="Today">
              <TodayIcon />
            </IconButton>
            <IconButton onClick={handleNext} title="Next">
              <ArrowForwardIcon />
            </IconButton>
          </ButtonGroup>

          <ButtonGroup variant="outlined" size="small">
            <IconButton
              onClick={() => {
                calendarApi?.changeView('dayGridMonth');
                setCurrentViewType('dayGridMonth');
              }}
              color={currentViewType === 'dayGridMonth' ? 'primary' : 'default'}
              title="Month View"
            >
              <CalendarMonthIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                calendarApi?.changeView('list21Days');
                setCurrentViewType('list21Days');
              }}
              color={currentViewType === 'list21Days' ? 'primary' : 'default'}
              title="List View"
            >
              <ListIcon />
            </IconButton>
          </ButtonGroup>
        </div>

        {/* Calendar Sub Menu - but hide location-specific items */}
        <CalendarSubMenu />

        {/* Category Circles Legend */}
        {categories && categories.length > 0 && (
          <CategoryCircles
            categories={categories}
            activeCategories={activeCategories}
            handleCategoryChange={handleCategoryChange}
          />
        )}

        {/* Main Calendar */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
            initialView={currentViewType}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            headerToolbar={false}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            dayCellDidMount={handleDayCellDidMount}
            views={{
              list21Days: {
                type: 'list',
                duration: { days: 21 },
                buttonText: '21 days',
                titleFormat: { month: 'long', day: 'numeric', year: 'numeric' },
              },
            }}
            eventClassNames={(arg) => {
              const category = categories.find((cat) => cat.id === arg.event.extendedProps.category);
              return category ? [`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`] : [];
            }}
            eventDidMount={(info) => {
              const category = categories.find((cat) => cat.id === info.event.extendedProps.category);
              if (category) {
                info.el.style.backgroundColor = category.color;
                info.el.style.borderColor = category.color;
                
                const dotEl = info.el.querySelector('.fc-list-event-dot');
                if (dotEl) {
                  dotEl.style.borderColor = category.color;
                }
              }
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {isViewEventModalOpen && selectedEvent && (
        <ViewEventDetailModal
          open={isViewEventModalOpen}
          onClose={handleModalClose}
          eventDetails={selectedEvent}
        />
      )}

      {isViewAIEventModalOpen && selectedAIEvent && (
        <ViewAIEventDetails
          open={isViewAIEventModalOpen}
          onClose={handleAIModalClose}
          aiEventDetails={selectedAIEvent}
        />
      )}

      {isCreateEventModalOpen && (
        <CreateEventDetailModal
          open={isCreateEventModalOpen}
          onClose={handleCreateEventModalClose}
          selectedDate={selectedDateInfo?.dateStr}
        />
      )}
    </div>
  );
};

export default BostonCalendarPage;