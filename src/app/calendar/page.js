// app/calendar/page.js

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

import SiteHeader from '@/components/UI/SiteHeader';
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

  // State to track if we've auto-opened the map
  const [hasAutoOpenedMap, setHasAutoOpenedMap] = useState(false);
  
  // Get GeoLocation context for auto-opening map
  const { openLocationSettings, openMapCenterModal } = useGeoLocation();
  
  // Get auth context to check if user is logged in
  const { user } = useContext(AuthContext);

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
    refreshEvents,
    // datesSet,
    handleEventUpdated,
    isEditMode,
    eventToEdit,
    searchTerm,
    setSearchTerm,
    includeAIEvents,
    setIncludeAIEvents,
    isAIDetailModalOpen,
    setAIDetailModalOpen,
    selectedAIEventDetails,
    noLocationSelected,
  } = useCalendarPage();

  // Get selected role from context
  const { selectedRole } = useContext(RoleContext);

  // Function to determine the initial view based on screen size
  const getInitialView = () => {
    return window.innerWidth >= 768 ? 'dayGridMonth' : 'list21Days';
  };

  // TIEMPO-246: Generate placeholder events without Date() conversions
  const generatePlaceholderEvents = (startDate, endDate) => {
    const placeholders = [];
    
    // Determine placeholder text based on user role
    const canAddEvents = selectedRole === listOfAllRoles.REGIONAL_ORGANIZER || 
                        selectedRole === listOfAllRoles.REGIONAL_ADMIN ||
                        selectedRole === listOfAllRoles.SYSTEM_ADMIN ||
                        selectedRole === listOfAllRoles.SUPER_ADMIN;
    
    const placeholderText = canAddEvents ? 'Click to add event' : 'No events';
    
    // String-based date manipulation to avoid timezone conversions
    let currentDateStr = startDate.split('T')[0]; // Get YYYY-MM-DD part
    const endDateStr = endDate.split('T')[0];
    
    while (currentDateStr <= endDateStr) {
      placeholders.push({
        id: `placeholder-${currentDateStr}`,
        title: placeholderText, // Role-based text
        start: `${currentDateStr}T00:00:00`, // ISO string without timezone
        allDay: true,
        display: 'list-item', // Make it visible in list view
        classNames: ['fc-placeholder-event'],
        extendedProps: {
          isPlaceholder: true
        }
      });
      
      // TIEMPO-246: Increment date using pure string manipulation
      const [year, month, day] = currentDateStr.split('-').map(Number);
      let nextDay = day + 1;
      let nextMonth = month;
      let nextYear = year;
      
      // Handle month rollover
      const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 
                          31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (nextDay > daysInMonth[month - 1]) {
        nextDay = 1;
        nextMonth++;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear++;
        }
      }
      
      currentDateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
    }
    
    return placeholders;
  };

  // TIEMPO-252: Format venue time for calendar display
  const formatVenueTimeForCalendar = (startStr, endStr, abbr) => {
    // Parse venue time string (format: "2025-07-07T19:00:00")
    const formatVenueTime = (timeStr) => {
      if (!timeStr) return '';
      const [, timePart] = timeStr.split('T');
      const [hour, minute] = timePart.split(':');
      const hourNum = parseInt(hour, 10);
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const suffix = hourNum >= 12 ? 'p' : 'a';
      return `${displayHour}:${minute}${suffix}`;
    };
    
    return {
      startTime: formatVenueTime(startStr),
      endTime: formatVenueTime(endStr)
    };
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
      // For list view placeholders, show role-based text
      if (eventInfo.view.type === 'list21Days' || eventInfo.view.type === 'listMonth') {
        // Determine text based on user role
        const canAddEvents = selectedRole === listOfAllRoles.REGIONAL_ORGANIZER || 
                            selectedRole === listOfAllRoles.REGIONAL_ADMIN ||
                            selectedRole === listOfAllRoles.SYSTEM_ADMIN ||
                            selectedRole === listOfAllRoles.SUPER_ADMIN;
        
        const displayText = canAddEvents ? 'Click to add event' : 'No events';
        
        return (
          <div style={{
            padding: '8px 16px',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            <span style={{ opacity: 0.6 }}>{displayText}</span>
          </div>
        );
      }
      // Hide placeholders in other views
      return null;
    }
    
    // Check if this is an AI-discovered event
    const isAIDiscovered = event.extendedProps?.isDiscovered === true;
    
    // Check if this event is canceled
    const isCanceled = event.extendedProps?.isCanceled === true;
    
    // Get organizer short name and event short title with fallbacks
    const organizerShort = event.extendedProps?.ownerOrganizerShortName || 
                          event.extendedProps?.ownerOrganizerName?.substring(0, 8) || 
                          '';
    const eventShortTitle = event.extendedProps?.shortTitle || 
                           event.title?.substring(0, 15) || 
                           '';
    
    if (isMonthlyView) {
      // Monthly view: time + categories on same line, title below
      // TIEMPO-252: Use venue display times if available
      const { startTime, endTime } = event.extendedProps?.venueStartDisplay 
        ? formatVenueTimeForCalendar(event.extendedProps.venueStartDisplay, event.extendedProps.venueEndDisplay, event.extendedProps.venueAbbr)
        : formatTimeForMonthly(event.start, event.end);
      
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
            {isAIDiscovered ? (
              <>
                {/* AI Events: Show "AI-Discovered", first category only, and shortTitle */}
                <div style={{ 
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#1976d2',
                  flexShrink: 0
                }}>
                  AI-Discovered
                </div>
                <CategoryCircles eventProps={{...event.extendedProps, categorySecond: null, categoryThird: null}} />
                {eventShortTitle && (
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
                )}
              </>
            ) : (
              <>
                {/* Regular Events: Show time, all categories, organizer, and shortTitle */}
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
                      lineHeight: '1.0',
                      textDecoration: isCanceled ? 'line-through' : 'none'
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
                          lineHeight: '1.0',
                          textDecoration: isCanceled ? 'line-through' : 'none'
                        }}>
                          {eventShortTitle}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Row 2: Event title with recurring indicator - SMALLER */}
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 'normal',
            lineHeight: '1.1',
            wordWrap: 'break-word',
            hyphens: 'auto',
            flex: 1,
            color: '#555',
            textDecoration: isCanceled ? 'line-through' : 'none'
          }}>
            {event.extendedProps?.isRecurring && '🔄 '}{event.title}
          </div>
        </div>
      );
    } else {
      // List view: time and categories on top line, title on second line
      // TIEMPO-252: Use venue display times if available
      const { startTime, endTime } = event.extendedProps?.venueStartDisplay
        ? formatVenueTimeForCalendar(event.extendedProps.venueStartDisplay, event.extendedProps.venueEndDisplay, event.extendedProps.venueAbbr)
        : formatTimeForListView(event.start, event.end);
      
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
            {isAIDiscovered ? (
              <>
                {/* AI Events: Show "AI-Discovered", first category only, and shortTitle */}
                <div style={{ 
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: '#1976d2',
                  flexShrink: 0
                }}>
                  AI-Discovered
                </div>
                <CategoryCircles eventProps={{...event.extendedProps, categorySecond: null, categoryThird: null}} />
                {eventShortTitle && (
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
                )}
              </>
            ) : (
              <>
                {/* Regular Events: Show time, all categories, organizer, and shortTitle */}
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
                      lineHeight: '1.2',
                      textDecoration: isCanceled ? 'line-through' : 'none'
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
                          lineHeight: '1.2',
                          textDecoration: isCanceled ? 'line-through' : 'none'
                        }}>
                          {eventShortTitle}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Row 2: Event title with recurring indicator - SMALLER */}
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 'normal',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            hyphens: 'auto',
            color: '#555',
            textDecoration: isCanceled ? 'line-through' : 'none'
          }}>
            {event.extendedProps?.isRecurring && '🔄 '}{event.title}
          </div>
        </div>
      );
    }
  };
  // State to track current view type
  const [currentViewType, setCurrentViewType] = useState(null);
  const [viewDateRange, setViewDateRange] = useState({ start: null, end: null });
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Touch handlers
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    // Don't interfere with calendar event clicks
    if (e.target.closest('.fc-event')) {
      return;
    }
    
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchMove = (e) => {
    // Don't track if touch started on event
    if (!touchStart) return;
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchEnd = (e) => {
    // Don't interfere with calendar event clicks
    if (e.target.closest('.fc-event')) {
      return;
    }
    
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    
    // Only handle horizontal swipes, let vertical swipes pass through for scrolling
    if (isHorizontalSwipe && (isLeftSwipe || isRightSwipe)) {
      if (isLeftSwipe && calendarRef.current) {
        calendarRef.current.getApi().next();
      }
      if (isRightSwipe && calendarRef.current) {
        calendarRef.current.getApi().prev();
      }
    }
  };
  
  // Compute events with placeholders based on current view
  const eventsWithPlaceholders = (() => {
    if (currentViewType === 'list21Days' || currentViewType === 'listMonth') {
      if (viewDateRange.start && viewDateRange.end) {
        // Generate placeholders for the current view range
        // Convert Date objects to ISO strings for generatePlaceholderEvents
        const startStr = viewDateRange.start instanceof Date ? viewDateRange.start.toISOString() : viewDateRange.start;
        const endStr = viewDateRange.end instanceof Date ? viewDateRange.end.toISOString() : viewDateRange.end;
        const placeholders = generatePlaceholderEvents(startStr, endStr);
        
        // TIEMPO-246: Filter dates using string comparison, not Date objects
        const eventDates = new Set(
          coloredFilteredEvents.map(event => {
            // Extract date part from ISO string (YYYY-MM-DD)
            return (event.start || '').split('T')[0];
          })
        );
        
        const neededPlaceholders = placeholders.filter(placeholder => {
          // Extract date part from placeholder start
          const placeholderDateStr = (placeholder.start || '').split('T')[0];
          return !eventDates.has(placeholderDateStr);
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

  // Auto-open map if no location is selected
  useEffect(() => {
    if (noLocationSelected && !hasAutoOpenedMap) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        if (!user) {
          // Non-logged user: Open MapCenterModal
          openMapCenterModal();
        } else {
          // Logged-in user: Open UserSettings to location preferences
          openLocationSettings('locationPrefs');
        }
        setHasAutoOpenedMap(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [noLocationSelected, hasAutoOpenedMap, openLocationSettings, openMapCenterModal, user]);

  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <SiteHeader />
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
                ? (() => {
                    // TIEMPO-246: Format calendar date without timezone conversion
                    const calDate = calendarRef.current.getApi().getDate();
                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                                  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                    return `${months[calDate.getMonth()]} ${calDate.getFullYear()}`;
                  })()
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

      {noLocationSelected ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px',
        }}>
          <h2 style={{ marginBottom: '20px', color: '#666' }}>
            Loading Map Settings...
          </h2>
          <p style={{ fontSize: '16px', color: '#777' }}>
            Opening location selector
          </p>
        </div>
      ) : (
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
          }}
        >
          <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
          // TIEMPO-239: CRITICAL - Set timezone to UTC to prevent browser conversion
          // This ensures events display in their venue timezone, not browser timezone
          timeZone="UTC"
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
          // TIEMPO-246: Compare dates without timezone conversion
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const cellDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

          if (cellDateStr < todayStr) {
            el.style.backgroundColor = '#c0c0c0';
          }
        }}
      />
        </div>
      )}
      
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
          // Just refresh events after modal closes
          refreshEvents();
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

      <ViewAIEventDetails
        open={isAIDetailModalOpen}
        onClose={() => setAIDetailModalOpen(false)}
        eventDetails={selectedAIEventDetails}
      />
    </div>
  );
};

export default CalendarPage;
