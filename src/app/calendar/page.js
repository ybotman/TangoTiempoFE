// app/calendar/page.js

'use client'; 
import Head from 'next/head';
import React, {useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { ButtonGroup, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListIcon from '@mui/icons-material/List';

import SiteHeader from '@/components/UI/SiteHeader';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import CalendarSubMenu from '@/components/UI/CalendarSubMenu';
import LocationInfo from '@/components/UI/LocationInfo';
import CreateEventDetailModal from '@/components/Modals/CreateEvents/CreateEventDetailModal';
import ViewEventDetailModal from '@/components/Modals/ViewEvents/ViewEventDetailModal.js';
import CategoryCircles from '@/components/UI/CategoryCircles';

const CalendarPage = () => {
  <Head>
    <title>Tango Tiempo - A national Tango Events Calendar </title>
    <meta
      name="description"
      content="Browse and find upcoming tango events in your region. Updated regularly with new listings."
    />
    <meta name="keywords" content="tango, tango events, local tango calendar, tango festivals" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Tango Tiempo - Find Local Tango Events" />
    <meta property="og:description" content="Browse and find upcoming tango events in your region." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.tangotiempo.com" />
  </Head>;

  // Regions data is now handled by useCalendarPage
  const {
    menuAnchor,
    menuItems,
    categories,
    clickedDate,
    handleMenuAction,
    handleMenuClose,
    activeCategories,
    handleCategoryChange,
    calendarRef,
    isCreateModalOpen,
    setCreateModalOpen,
    isViewDetailModalOpen,
    setViewDetailModalOpen,
    selectedEventDetails,
    handleDatesSet,
    handlePrev,
    handleNext,
    handleToday,
    handleDateClick,
    handleEventClick,
    coloredFilteredEvents,
    // datesSet,
    handleEventUpdated,
    isEditMode,
    eventToEdit,
  } = useCalendarPage();

  // Function to determine the initial view based on screen size
  const getInitialView = () => {
    return window.innerWidth >= 768 ? 'dayGridMonth' : 'listMonth';
  };

  // Custom event content renderer with category circles
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    
    
    // For month and list views, show circles on same line as title
    return (
      <div style={{ 
        padding: '2px', 
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px'
      }}>
        <CategoryCircles eventProps={event.extendedProps} />
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: 'bold',
          lineHeight: '1.1',
          wordWrap: 'break-word',
          hyphens: 'auto',
          flex: 1,
          minWidth: 0 // Allow text to shrink
        }}>
          {event.title}
        </div>
      </div>
    );
  };
  //console.log('Modal isCreateModalOpen open state:', isCreateModalOpen);
  useEffect(() => {
    const handleWindowResize = () => {
      const calendarApi = calendarRef.current.getApi();
      if (window.innerWidth >= 768) {
        calendarApi.changeView('dayGridMonth'); // Switch to Month view for large screens
      } else {
        calendarApi.changeView('listMonth'); // Switch to List view for smaller screens
      }
    };

    window.addEventListener('resize', handleWindowResize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calendarRef]); // Add calendarRef to the dependency array

  return (
    <div>
      <SiteHeader />
      <SiteMenuBar
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
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

          {/* Date Range Display */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              {calendarRef.current
                ? calendarRef.current.getApi().getDate().toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  }).toUpperCase()
                : 'LOADING CALENDAR...'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
            </div>
          </div>

          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <IconButton onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}>
              <CalendarMonthIcon />
            </IconButton>
            <IconButton onClick={() => calendarRef.current.getApi().changeView('listMonth')}>
              <ListIcon />
            </IconButton>
          </ButtonGroup>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        //        initialView="dayGridMonth"
        initialView={getInitialView()}
        events={coloredFilteredEvents}
        datesSet={handleDatesSet}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        eventDidMount={(eventInfo) => {
          // Remove background color for list view to avoid double category display
          if (eventInfo.view.type === 'listMonth') {
            eventInfo.el.style.backgroundColor = 'transparent';
            eventInfo.el.style.borderColor = '#ddd';
            
            // Hide the list view dot/circle indicator in the time column
            const dotElement = eventInfo.el.querySelector('.fc-list-event-dot');
            if (dotElement) {
              dotElement.style.display = 'none';
            }
            
            // Alternative: hide the entire time column border-left which contains the color indicator
            eventInfo.el.style.borderLeft = 'none';
          }
        }}
        ref={calendarRef}
        headerToolbar={false}
        scrollTime="17:00:00"
        // Modify the height to extend the calendar
        height="auto" // Adjust based on how much space you want the calendar to take
        // Extend the number of events shown in list view
        views={{
          listMonth: {
            dayMaxEvents: 'true', // Show all events without limiting
            listDayFormat: { weekday: 'long' }, // Customize the day formatting in list view
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' }, // Ensures title says "May 2025"
            eventMinHeight: 25, // Ensure enough height for title + category circles
          },
        }}
        dayCellDidMount={({ date, el }) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const cellDate = new Date(date);
          cellDate.setHours(0, 0, 0, 0);

          if (cellDate < today) {
            el.style.backgroundColor = '#c0c0c0';
          }
        }}
      />
      
      {/* Location Information Bar - Moved below calendar */}
      <div style={{ margin: '20px' }}>
        <LocationInfo />
      </div>
      
      {/* SubMenu */}
      <CalendarSubMenu
        menuAnchor={menuAnchor}
        handleClose={handleMenuClose}
        menuItems={menuItems}
        onActionSelected={handleMenuAction}
      />

      <CreateEventDetailModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        selectedDate={clickedDate}
        editMode={isEditMode}
        eventToEdit={eventToEdit}
      />

      <ViewEventDetailModal
        open={isViewDetailModalOpen}
        onClose={() => setViewDetailModalOpen(false)}
        selectedDate={clickedDate}
        eventDetails={selectedEventDetails}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
};

export default CalendarPage;
