// app/calendar/page.js

'use client'; 
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
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
    searchTerm,
    setSearchTerm,
  } = useCalendarPage();

  // Function to determine the initial view based on screen size
  const getInitialView = () => {
    return window.innerWidth >= 768 ? 'dayGridMonth' : 'list21Days';
  };

  // Generate placeholder events for list view to show all dates
  const generatePlaceholderEvents = (startDate, endDate) => {
    const placeholders = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      placeholders.push({
        id: `placeholder-${current.toISOString()}`,
        title: 'Click to add event', // Show instructional text
        start: new Date(current),
        allDay: true,
        display: 'list-item', // Make it visible in list view
        classNames: ['fc-placeholder-event'],
        extendedProps: {
          isPlaceholder: true
        }
      });
      current.setDate(current.getDate() + 1);
    }
    
    return placeholders;
  };

  // Format time display without AM/PM for monthly view
  const formatTimeForMonthly = (start, end) => {
    const formatTime = (date) => {
      if (!date) return '';
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const suffix = hours >= 12 ? 'p' : 'a';
      return `${displayHours}:${minutes.toString().padStart(2, '0')}${suffix}`;
    };
    
    const startTime = formatTime(start);
    const endTime = end ? formatTime(end) : '';
    return { startTime, endTime };
  };

  // Format time display with p/a suffix for list view
  const formatTimeForListView = (start, end) => {
    const formatTime = (date) => {
      if (!date) return '';
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const suffix = hours >= 12 ? 'p' : 'a';
      return `${displayHours}:${minutes.toString().padStart(2, '0')}${suffix}`;
    };
    
    const startTime = formatTime(start);
    const endTime = end ? formatTime(end) : '';
    return { startTime, endTime };
  };

  // Custom event content renderer with category circles
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isMonthlyView = eventInfo.view.type === 'dayGridMonth';
    
    // Handle placeholder events specially
    if (event.extendedProps?.isPlaceholder) {
      // For list view placeholders, show clickable text
      if (eventInfo.view.type === 'list21Days' || eventInfo.view.type === 'listMonth') {
        return (
          <div style={{
            padding: '8px 16px',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            <span style={{ opacity: 0.6 }}>Click to add event</span>
          </div>
        );
      }
      // Hide placeholders in other views
      return null;
    }
    
    // Get organizer short name and event short title with fallbacks
    const organizerShort = event.extendedProps?.ownerOrganizerShortName || 
                          event.extendedProps?.ownerOrganizerName?.substring(0, 8) || 
                          '';
    const eventShortTitle = event.extendedProps?.shortTitle || 
                           event.title?.substring(0, 15) || 
                           '';
    
    if (isMonthlyView) {
      // Monthly view: time + categories on same line, title below
      const { startTime, endTime } = formatTimeForMonthly(event.start, event.end);
      
      return (
        <div style={{ 
          padding: '2px', 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {/* Row 1: Time, categories, organizer, shortTitle - LARGER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            marginBottom: '1px'
          }}>
            {startTime && (
              <div style={{ 
                fontSize: '0.8rem', 
                lineHeight: '1.0',
                flexShrink: 0
              }}>
                <span style={{ fontWeight: 'bold' }}>{startTime}</span>
                {endTime && `-`}<span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>{endTime}</span>
              </div>
            )}
            <CategoryCircles eventProps={event.extendedProps} />
            {organizerShort && (
              <>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 'normal',
                  color: '#666',
                  overflow: 'visible',
                  whiteSpace: 'nowrap',
                  flexShrink: 1,
                  lineHeight: '1.0'
                }}>
                  {organizerShort}
                </div>
                {eventShortTitle && (
                  <>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}> | </span>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#333',
                      overflow: 'visible',
                      whiteSpace: 'nowrap',
                      flexShrink: 1,
                      lineHeight: '1.0'
                    }}>
                      {eventShortTitle}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Row 2: Event title - SMALLER */}
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 'normal',
            lineHeight: '1.1',
            wordWrap: 'break-word',
            hyphens: 'auto',
            flex: 1,
            color: '#555'
          }}>
            {event.title}
          </div>
        </div>
      );
    } else {
      // List view: time and categories on top line, title on second line
      const { startTime, endTime } = formatTimeForListView(event.start, event.end);
      
      return (
        <div style={{ 
          padding: '4px 2px', 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {/* Row 1: Time range, category circles, organizer, shortTitle - LARGER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Time range */}
            {startTime && (
              <div style={{ 
                fontSize: '0.9rem',
                lineHeight: '1.2',
                flexShrink: 0
              }}>
                <span style={{ fontWeight: 'bold' }}>{startTime}</span>
                {endTime && (
                  <>
                    <span> - </span>
                    <span style={{ fontWeight: 'normal' }}>{endTime}</span>
                  </>
                )}
              </div>
            )}
            {/* Category circles */}
            <CategoryCircles eventProps={event.extendedProps} />
            {organizerShort && (
              <>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 'normal',
                  color: '#666',
                  overflow: 'visible',
                  whiteSpace: 'nowrap',
                  flexShrink: 1,
                  lineHeight: '1.2'
                }}>
                  {organizerShort}
                </div>
                {eventShortTitle && (
                  <>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}> | </span>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: '#333',
                      overflow: 'visible',
                      whiteSpace: 'nowrap',
                      flexShrink: 1,
                      lineHeight: '1.2'
                    }}>
                      {eventShortTitle}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Row 2: Event title - SMALLER */}
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 'normal',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            hyphens: 'auto',
            color: '#555'
          }}>
            {event.title}
          </div>
        </div>
      );
    }
  };
  // State to track current view type
  const [currentViewType, setCurrentViewType] = useState(null);
  const [viewDateRange, setViewDateRange] = useState({ start: null, end: null });
  
  // Compute events with placeholders based on current view
  const eventsWithPlaceholders = (() => {
    if (currentViewType === 'list21Days' || currentViewType === 'listMonth') {
      if (viewDateRange.start && viewDateRange.end) {
        // Generate placeholders for the current view range
        const placeholders = generatePlaceholderEvents(viewDateRange.start, viewDateRange.end);
        
        // Filter out dates that already have real events
        const eventDates = new Set(
          coloredFilteredEvents.map(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString();
          })
        );
        
        const neededPlaceholders = placeholders.filter(placeholder => {
          const placeholderDate = new Date(placeholder.start);
          return !eventDates.has(placeholderDate.toDateString());
        });
        
        // Combine with real events
        return [...coloredFilteredEvents, ...neededPlaceholders];
      }
    }
    // For other views or when date range not set, just use the real events
    return coloredFilteredEvents;
  })();

  //console.log('Modal isCreateModalOpen open state:', isCreateModalOpen);
  useEffect(() => {
    const handleWindowResize = () => {
      const calendarApi = calendarRef.current.getApi();
      if (window.innerWidth >= 768) {
        calendarApi.changeView('dayGridMonth'); // Switch to Month view for large screens
        setCurrentViewType('dayGridMonth');
      } else {
        calendarApi.changeView('list21Days'); // Switch to List view for smaller screens
        setCurrentViewType('list21Days');
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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
            <IconButton onClick={() => {
              calendarRef.current.getApi().changeView('dayGridMonth');
              setCurrentViewType('dayGridMonth');
            }}>
              <CalendarMonthIcon />
            </IconButton>
            <IconButton onClick={() => {
              calendarRef.current.getApi().changeView('list21Days');
              setCurrentViewType('list21Days');
            }}>
              <ListIcon />
            </IconButton>
          </ButtonGroup>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        //        initialView="dayGridMonth"
        initialView={getInitialView()}
        events={eventsWithPlaceholders}
        datesSet={(dateInfo) => {
          handleDatesSet(dateInfo);
          // Track view type and date range
          if (calendarRef.current) {
            const view = calendarRef.current.getApi().view;
            setCurrentViewType(view.type);
            setViewDateRange({ start: view.currentStart, end: view.currentEnd });
          }
        }}
        nextDayThreshold="04:00:00"
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        eventDidMount={(eventInfo) => {
          // Handle placeholder events
          if (eventInfo.event.extendedProps.isPlaceholder) {
            // Style placeholder events to look like clickable day entries
            if (eventInfo.view.type === 'listMonth' || eventInfo.view.type === 'list' || eventInfo.view.type === 'list21Days') {
              // Style the placeholder to look like an empty day entry
              eventInfo.el.style.backgroundColor = '#f8f9fa';
              eventInfo.el.style.cursor = 'pointer';
              eventInfo.el.style.opacity = '0.7';
              eventInfo.el.style.fontStyle = 'italic';
              eventInfo.el.style.color = '#6c757d';
              
              // Add hover effect
              eventInfo.el.addEventListener('mouseenter', () => {
                eventInfo.el.style.backgroundColor = '#e9ecef';
                eventInfo.el.style.opacity = '1';
              });
              eventInfo.el.addEventListener('mouseleave', () => {
                eventInfo.el.style.backgroundColor = '#f8f9fa';
                eventInfo.el.style.opacity = '0.7';
              });
              
              // Hide the time for placeholder events
              const timeElement = eventInfo.el.querySelector('.fc-list-event-time');
              if (timeElement) {
                timeElement.style.display = 'none';
              }
              
              // Hide the dot/circle indicator
              const dotElement = eventInfo.el.querySelector('.fc-list-event-dot');
              if (dotElement) {
                dotElement.style.display = 'none';
              }
            } else {
              // Hide placeholders in non-list views
              eventInfo.el.style.display = 'none';
            }
          }
          
          // Remove background color for list view to avoid double category display
          if (!eventInfo.event.extendedProps.isPlaceholder && (eventInfo.view.type === 'listMonth' || eventInfo.view.type === 'list' || eventInfo.view.type === 'list21Days')) {
            eventInfo.el.style.backgroundColor = 'transparent';
            eventInfo.el.style.borderColor = '#ddd';
            
            // Hide the list view dot/circle indicator in the time column
            const dotElement = eventInfo.el.querySelector('.fc-list-event-dot');
            if (dotElement) {
              dotElement.style.display = 'none';
            }
            
            // Hide the default FullCalendar time display in list view
            const timeElement = eventInfo.el.querySelector('.fc-list-event-time');
            if (timeElement) {
              timeElement.style.display = 'none';
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
          list21Days: {
            type: 'list',
            duration: { days: 21 },
            buttonText: '3 Weeks',
            listDayFormat: { weekday: 'long', month: 'long', day: 'numeric' },
            dayMaxEvents: 'true',
          },
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
      
      
      {/* SubMenu */}
      <CalendarSubMenu
        menuAnchor={menuAnchor}
        handleClose={handleMenuClose}
        menuItems={menuItems}
        onActionSelected={handleMenuAction}
      />

      <CreateEventDetailModal
        open={isCreateModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          // Refresh events after creating/editing
          if (isEditMode) {
            handleEventUpdated('edit', eventToEdit?._id);
          } else {
            handleEventUpdated('create');
          }
        }}
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
