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
// CalendarSubMenu removed for simplified Boston view
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
  zoomRange: 200, // 200 mile radius - covers all New England
  source: 'legacy-boston',
  locked: true
};

// Helper functions for event rendering
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return hours + (minutes !== 0 ? ':' + minutesStr : '') + ampm;
};

const formatVenueTimeForCalendar = (venueStartDisplay, venueEndDisplay, venueAbbr) => {
  if (!venueStartDisplay) return { startTime: '', endTime: '' };
  
  const parseVenueTime = (displayStr) => {
    if (!displayStr) return '';
    const match = displayStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toLowerCase();
    
    if (hours === 12 && period === 'am') {
      return '12:00am';
    }
    
    return hours + (minutes !== '00' ? ':' + minutes : '') + period;
  };
  
  return {
    startTime: parseVenueTime(venueStartDisplay),
    endTime: parseVenueTime(venueEndDisplay)
  };
};

const formatTimeForListView = (start, end) => {
  const startTime = start ? formatTime(start) : '';
  const endTime = end ? formatTime(end) : '';
  return { startTime, endTime };
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
    currentLocation,
    setSessionLocation
  } = useGeoLocation();

  // Auth and Role contexts
  const { user } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);

  // Local state for view type (not provided by hook)
  const [currentViewType, setCurrentViewType] = useState('dayGridMonth');

  // Force Boston location on mount
  useEffect(() => {
    // Always set Boston location to ensure it has the source field
    setSessionLocation(BOSTON_CONFIG);
  }, []); // Run once on mount

  // Get all the calendar functionality from the hook
  const {
    coloredFilteredEvents = [],  // Use the transformed events ready for FullCalendar
    categories = [],
    activeCategories = [],
    handleCategoryChange,
    searchTerm,
    setSearchTerm,
    calendarRef,
    handlePrev,
    handleNext,
    handleToday: handleTodayClick,
    selectedEventDetails,  // This is the actual selected event data
    handleEventClick,
    isViewDetailModalOpen: isViewEventModalOpen,
    setViewDetailModalOpen: handleModalClose,
    eventsLoading: loading,
    eventsError: error,
    noLocationSelected,
    includeAIEvents,
    setIncludeAIEvents,
    selectedAIEventDetails: selectedAIEvent,  // AI event details
    isAIDetailModalOpen: isViewAIEventModalOpen,  // AI modal state
    setAIDetailModalOpen: handleAIModalClose,  // AI modal close
    isCreateModalOpen: isCreateEventModalOpen,
    clickedDate: selectedDateInfo,
    handleDateClick,
    setCreateModalOpen: handleCreateEventModalClose,
  } = useCalendarPage();

  // Custom event content renderer (match main calendar exactly)
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isMonthlyView = eventInfo.view.type === 'dayGridMonth';
    
    // Check for canceled events
    const isCanceled = event.extendedProps?.eventStatus === 'canceled';
    
    // Get organizer short name (normal text)
    const organizerShort = event.extendedProps?.organizerShort || 
                          event.extendedProps?.ownerOrganizer?.organizerShort ||
                          event.extendedProps?.ownerOrganizerShort || '';
    
    // Get venue short title (BOLD text) - uses shortTitle field like main calendar
    const eventShortTitle = event.extendedProps?.shortTitle || 
                           event.title?.substring(0, 15) || 
                           '';

    if (isMonthlyView) {
      // Month view: match main calendar exactly
      const { startTime, endTime } = event.extendedProps?.venueStartDisplay
        ? formatVenueTimeForCalendar(event.extendedProps.venueStartDisplay, event.extendedProps.venueEndDisplay, event.extendedProps.venueAbbr)
        : formatTimeForListView(event.start, event.end);
      
      return (
        <div style={{ 
          padding: '2px', 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          {/* Row 1: Time | Categories | Organizer (normal) | Venue (bold) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            marginBottom: '1px'
          }}>
            {/* Time display */}
            {startTime && (
              <div style={{ 
                fontSize: '0.8rem', 
                lineHeight: '1.0',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontWeight: 'bold' }}>{startTime}</span>
                {endTime && `-`}<span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>{endTime}</span>
              </div>
            )}
            {/* Category bubbles */}
            <CategoryCircles eventProps={event.extendedProps} />
            {/* Organizer and Venue - matching main calendar exactly */}
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
          </div>
          
          {/* Row 2: Event title - no wrapping */}
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
      // List view: more detailed display
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
          {/* Time range, categories, organizer, venue */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {startTime && (
              <div style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                <span style={{ fontWeight: 'bold' }}>{startTime}</span>
                {endTime && (
                  <>
                    <span> - </span>
                    <span style={{ fontWeight: 'normal' }}>{endTime}</span>
                  </>
                )}
              </div>
            )}
            <CategoryCircles eventProps={event.extendedProps} />
            {organizerShort && (
              <span style={{
                fontSize: '0.85rem',
                color: '#666',
                textDecoration: isCanceled ? 'line-through' : 'none'
              }}>
                {organizerShort}
              </span>
            )}
            {eventShortTitle && (
              <>
                <span style={{ fontSize: '0.85rem', color: '#666' }}> | </span>
                <span style={{ 
                  fontSize: '0.85rem',
                  fontWeight: 'bold', 
                  color: '#333',
                  textDecoration: isCanceled ? 'line-through' : 'none'
                }}>
                  {eventShortTitle}
                </span>
              </>
            )}
          </div>
          
          {/* Event title */}
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 'normal',
            lineHeight: '1.2',
            color: '#000000',  // Black text
            textDecoration: isCanceled ? 'line-through' : 'none'
          }}>
            {event.extendedProps?.isRecurring && '🔄 '}{event.title}
          </div>
        </div>
      );
    }
  };

  // Handle month view rendering
  const handleDayCellDidMount = (info) => {
    const dayEvents = coloredFilteredEvents.filter((event) => {
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
  }, [calendarRef, currentViewType]);

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
          src="/defaults/BTCHeader2.jpeg" 
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

          {/* Date Range Display - Month Year Label */}
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
                    const calDate = calendarRef.current.getApi().getDate();
                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                                  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                    return `${months[calDate.getMonth()]} ${calDate.getFullYear()}`;
                  })()
                : 'LOADING CALENDAR...'}
            </div>
          </div>

          <ButtonGroup variant="outlined" size="small">
            <IconButton
              onClick={() => {
                calendarRef.current?.getApi()?.changeView('dayGridMonth');
                setCurrentViewType('dayGridMonth');
              }}
              color={currentViewType === 'dayGridMonth' ? 'primary' : 'default'}
              title="Month View"
            >
              <CalendarMonthIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                calendarRef.current?.getApi()?.changeView('list21Days');
                setCurrentViewType('list21Days');
              }}
              color={currentViewType === 'list21Days' ? 'primary' : 'default'}
              title="List View"
            >
              <ListIcon />
            </IconButton>
          </ButtonGroup>
        </div>

        {/* Calendar Sub Menu removed for simplified Boston view */}

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
            events={coloredFilteredEvents}
            eventClick={handleEventClick}
            // Remove dateClick for read-only view
            headerToolbar={false}
            height="auto"
            dayMaxEvents={false}  // Show all events, not just 3
            eventDisplay="block"
            // Add missing configurations from main calendar
            nextDayThreshold="06:00:00"  // Events until 6am count as previous day
            timeZone="UTC"  // Use UTC to prevent timezone conversions
            nowIndicator={true}  // Show current time indicator
            eventContent={renderEventContent}  // Use custom renderer
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
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
              return category && category.name ? [`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`] : [];
            }}
            eventDidMount={(info) => {
              const category = categories.find((cat) => cat.id === info.event.extendedProps.category);
              
              // For month view - transparent background, let renderEventContent handle styling
              if (info.view.type === 'dayGridMonth') {
                info.el.style.backgroundColor = 'transparent';
                info.el.style.borderColor = 'transparent';
                info.el.style.border = 'none';
                info.el.style.boxShadow = 'none';
              }
              
              // For list view - transparent background to avoid double colors
              if (info.view.type === 'list21Days' || info.view.type === 'listMonth') {
                info.el.style.backgroundColor = 'transparent';
                info.el.style.borderColor = '#ddd';
                
                // Style the dot with category color
                const dotEl = info.el.querySelector('.fc-list-event-dot');
                if (dotEl && category) {
                  dotEl.style.borderColor = category.color;
                }
              }
            }}
            // Gray out past days in month view
            dayCellDidMount={(arg) => {
              const { date, el } = arg;
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const cellDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              
              // Apply gray background to past days (match main calendar #c0c0c0)
              if (cellDateStr < todayStr) {
                el.style.backgroundColor = '#c0c0c0';
              }
              
              // Also handle the category circles we add
              handleDayCellDidMount(arg);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {isViewEventModalOpen && selectedEventDetails && (
        <ViewEventDetailModal
          open={isViewEventModalOpen}
          onClose={() => handleModalClose(false)}
          eventDetails={selectedEventDetails}
        />
      )}

      {isViewAIEventModalOpen && selectedAIEvent && (
        <ViewAIEventDetails
          open={isViewAIEventModalOpen}
          onClose={() => handleAIModalClose(false)}
          aiEventDetails={selectedAIEvent}
        />
      )}

      {/* Create modal removed - read-only view */}
    </div>
  );
};

export default BostonCalendarPage;