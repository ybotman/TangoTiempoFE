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
import MapIcon from '@mui/icons-material/Map';

import SiteHeader from '@/components/UI/SiteHeader';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import CalendarSubMenu from '@/components/UI/CalendarSubMenu';
import CreateEventDetailModal from '@/components/Modals/CreateEvents/CreateEventDetailModal';
import ViewEventDetailModal from '@/components/Modals/ViewEvents/ViewEventDetailModal.js';
import ViewAIEventDetails from '@/components/Modals/ViewEvents/ViewAIEventDetails';
import CategoryCircles from '@/components/UI/CategoryCircles';
import NoEventsAlert from '@/components/UI/NoEventsAlert';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';
import WelcomeModal from '@/components/Modals/Welcome/WelcomeModal'; // TIEMPO-329: Welcome modal
import MapCenterOnboardingModal from '@/components/Modals/misc/MapCenterOnboardingModal'; // TIEMPO-381: Onboarding modal
import { wasWelcomeShown } from '@/utils/visitorTracking'; // TIEMPO-329: Visitor tracking

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

  // TIEMPO-329: Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Get GeoLocation context for auto-opening map and onboarding
  const {
    openLocationSettings,
    openMapCenterModal,
    needsOnboarding,
    setNeedsOnboarding,
    saveToCloudDefault,
    isInitialized: geoInitialized
  } = useGeoLocation();

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
    eventsLoading,
  } = useCalendarPage();

  // Get selected role from context
  const { selectedRole } = useContext(RoleContext);

  // Function to determine the initial view based on screen size
  const getInitialView = () => {
    return window.innerWidth >= 768 ? 'dayGrid8Week' : 'list21Days';
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

  // TIEMPO-252: Format venue time for calendar display WITH timezone
  // eslint-disable-next-line no-unused-vars
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
    
    const startTime = formatVenueTime(startStr);
    const endTime = formatVenueTime(endStr);

    // TIEMPO-316: Removed timezone abbreviation from calendar display
    const endTimeWithTz = endTime;

    return {
      startTime: startTime,
      endTime: endTimeWithTz
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
    
    // Get organizer short names (owner + alternate if exists)
    const ownerShort = event.extendedProps?.ownerOrganizerShortName ||
                       event.extendedProps?.ownerOrganizerName?.substring(0, 8) ||
                       '';
    const alternateShort = event.extendedProps?.alternateOrganizerShortName ||
                           event.extendedProps?.alternateOrganizerName?.substring(0, 8) ||
                           '';
    // Format as "OWNER|ALTER" if alternate exists, otherwise just "OWNER"
    const organizerShort = alternateShort
                          ? `${ownerShort}|${alternateShort}`
                          : ownerShort;
    const eventShortTitle = event.extendedProps?.shortTitle ||
                           event.title?.substring(0, 15) ||
                           '';
    
    if (isMonthlyView) {
      // Monthly view: time + categories on same line, title below
      // TIEMPO-252: Use venue display times if available
      
      // Debug: Check what venue data we have
      if (event.title?.includes('Practica') || event.extendedProps?.shortTitle?.includes('VIDA')) {
        // TIEMPO-276: Security cleanup - removed venue data logging
      }
      
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
          {isAIDiscovered ? (
            <>
              {/* BOT-Curated Row 1: Robot + Category bubble + Title (bold) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                marginBottom: '1px'
              }}>
                <span style={{ color: '#C00', fontSize: '0.8rem' }}>🤖</span>
                <CategoryCircles eventProps={{...event.extendedProps, categorySecond: null, categoryThird: null}} />
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#333',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  flex: 1
                }}>
                  {event.title}
                </div>
              </div>
              {/* BOT-Curated Row 2: AI label + time + venue */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.65rem',
                color: '#555'
              }}>
                <span style={{ fontStyle: 'italic', color: '#888' }}>AI-found</span>
                {startTime && <span>· {startTime}</span>}
                {(event.extendedProps?.venueName || event.extendedProps?.venueCityName) && (
                  <span>· {event.extendedProps.venueName || event.extendedProps.venueCityName}</span>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Regular Events Row 1: Time, categories, organizer, shortTitle */}
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
                {eventShortTitle && (
                  <>
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
                    {organizerShort && (
                      <>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}> | </span>
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
                      </>
                    )}
                  </>
                )}
              </div>
              {/* Regular Events Row 2: Full title */}
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 'normal',
                lineHeight: '1.1',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                flex: 1,
                color: '#555',
                textDecoration: isCanceled ? 'line-through' : 'none'
              }}>
                {event.extendedProps?.isRecurring && '🔄 '}{event.title}
              </div>
            </>
          )}

          {/* Row 3: Featured image for isFeatured events */}
          {event.extendedProps?.isFeatured && event.extendedProps?.featuredImage && (
            <div style={{
              marginTop: '2px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img
                src={event.extendedProps.featuredImage}
                alt=""
                style={{
                  maxWidth: '100%',
                  maxHeight: '30px',
                  objectFit: 'contain',
                  borderRadius: '2px'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
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
          {isAIDiscovered ? (
            <>
              {/* BOT-Curated Row 1: Robot + Category bubble + Title (bold) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: '#C00', fontSize: '1rem' }}>🤖</span>
                <CategoryCircles eventProps={{...event.extendedProps, categorySecond: null, categoryThird: null}} />
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: '#333',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  flex: 1
                }}>
                  {event.title}
                </div>
              </div>
              {/* BOT-Curated Row 2: AI label + time + venue */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: '#555'
              }}>
                <span style={{ fontStyle: 'italic', color: '#888' }}>AI-found</span>
                {startTime && <span>· {startTime}</span>}
                {(event.extendedProps?.venueName || event.extendedProps?.venueCityName) && (
                  <span>· {event.extendedProps.venueName || event.extendedProps.venueCityName}</span>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Regular Events Row 1: Time, categories, organizer, shortTitle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
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
                <CategoryCircles eventProps={event.extendedProps} />
                {eventShortTitle && (
                  <>
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
                    {organizerShort && (
                      <>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}> | </span>
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
                      </>
                    )}
                  </>
                )}
              </div>
              {/* Regular Events Row 2: Full title */}
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 'normal',
                lineHeight: '1.2',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                color: '#555',
                textDecoration: isCanceled ? 'line-through' : 'none'
              }}>
                {event.extendedProps?.isRecurring && '🔄 '}{event.title}
              </div>
            </>
          )}

          {/* Row 3: Featured image for isFeatured events */}
          {event.extendedProps?.isFeatured && event.extendedProps?.featuredImage && (
            <div style={{
              marginTop: '4px',
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <img
                src={event.extendedProps.featuredImage}
                alt=""
                style={{
                  maxWidth: '120px',
                  maxHeight: '40px',
                  objectFit: 'contain',
                  borderRadius: '3px'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
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

        // TIEMPO-386: Filter dates using string comparison, not Date objects
        // Handle both regular events (event.start) and recurring events (event.rrule.dtstart)
        const eventDates = new Set(
          coloredFilteredEvents.flatMap(event => {
            // For recurring events, get dtstart from rrule
            if (event.rrule?.dtstart) {
              const dtstart = event.rrule.dtstart;
              // dtstart could be a Date object or ISO string
              const dateStr = dtstart instanceof Date
                ? dtstart.toISOString().split('T')[0]
                : (typeof dtstart === 'string' ? dtstart.split('T')[0] : '');
              return dateStr ? [dateStr] : [];
            }
            // For regular events, extract date from start
            const startStr = (event.start || '').split('T')[0];
            return startStr ? [startStr] : [];
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

// TIEMPO-276: Security cleanup - removed logging
  useEffect(() => {
    const handleWindowResize = () => {
      if (!calendarRef.current) return;
      const calendarApi = calendarRef.current.getApi();
      if (window.innerWidth >= 768) {
        calendarApi.changeView('dayGrid8Week'); // Switch to 8-week view for large screens
        setCurrentViewType('dayGrid8Week');
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

  // TIEMPO-329: Show welcome modal on first page load (takes precedence over map auto-open)
  useEffect(() => {
    if (!wasWelcomeShown()) {
      // Delay slightly to ensure page is ready
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-open map if no location is selected (only if welcome wasn't shown)
  // TIEMPO-381: Wait for geoInitialized before making decision - prevents race condition
  useEffect(() => {
    if (geoInitialized && noLocationSelected && !hasAutoOpenedMap && wasWelcomeShown()) {
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
  }, [geoInitialized, noLocationSelected, hasAutoOpenedMap, openLocationSettings, openMapCenterModal, user]);

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
            <IconButton onClick={handlePrev} title="Previous" data-testid="nav-prev">
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleToday} title="Today" data-testid="nav-today">
              <TodayIcon />
            </IconButton>
            <IconButton onClick={handleNext} title="Next" data-testid="nav-next">
              <ArrowForwardIcon />
            </IconButton>
          </ButtonGroup>

          {/* Date Range Display - Month title removed for TIEMPO-288 */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Month display removed - dates now show month abbreviations in cells */}
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
            </div>
          </div>

          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <IconButton onClick={() => {
              if (!calendarRef.current) return;
              calendarRef.current.getApi().changeView('dayGrid8Week');
              setCurrentViewType('dayGrid8Week');
            }} title="8 Week View" data-testid="view-8week">
              <CalendarMonthIcon />
            </IconButton>
            <IconButton onClick={() => {
              if (!calendarRef.current) return;
              const api = calendarRef.current.getApi();
              // BUGFIX: Force list view to start from local "today", not UTC "today"
              // When calendar is in UTC mode, we need to explicitly navigate to local date
              const today = new Date();
              const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              // Navigate to today's date first, then switch view
              api.gotoDate(localToday);
              api.changeView('list21Days');
              setCurrentViewType('list21Days');
            }} title="List View" data-testid="view-list">
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
          {eventsLoading && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '20px 40px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: '#333' 
              }}>
                Loading events...
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}} />
            </div>
          )}

          {/* No Events Alert - Show when no events are found */}
          <NoEventsAlert
            events={coloredFilteredEvents}
            eventsLoading={eventsLoading}
            onOpenMapCenter={openMapCenterModal}
            sx={{ mx: 2 }}
          />

          <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
          // TIEMPO-239: CRITICAL - Set timezone to UTC to prevent browser conversion
          // This ensures events display in their venue timezone, not browser timezone
          timeZone="UTC"
          //        initialView="dayGridMonth"
          initialView={getInitialView()}
          events={eventsWithPlaceholders}
          // TIEMPO-288: Custom date cell content with month abbreviations
          dayCellContent={(arg) => {
            // Apply to both month view and 8-week view
            if (arg.view.type !== 'dayGridMonth' && arg.view.type !== 'dayGrid8Week' && arg.view.type !== 'dayGrid') {
              return arg.dayNumberText;
            }

            const date = arg.date;
            // Use UTC methods to match calendar's UTC timezone setting
            const day = date.getUTCDate();
            const month = date.getUTCMonth();
            const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                              'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month];
            const fullMonth = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                              'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][month];

            // First day of month shows full month name in bold with clear highlight
            if (day === 1) {
              return (
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  padding: '4px 2px',
                  borderTop: '3px solid #1976d2',
                  backgroundColor: '#e3f2fd',
                  marginTop: '-3px',
                  marginLeft: '-2px',
                  marginRight: '-2px',
                  color: '#0d47a1'
                }}>
                  {fullMonth}-{day}
                </div>
              );
            }

            // Regular days show abbreviated month with smaller font for month
            return (
              <div style={{
                padding: '2px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1px'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#666' }}>{monthAbbr}-</span>
                <span style={{ fontSize: '0.85rem' }}>{day}</span>
              </div>
            );
          }}
          datesSet={(dateInfo) => {
          handleDatesSet(dateInfo);
          // Track view type and date range
          if (calendarRef.current) {
            const view = calendarRef.current.getApi().view;
            setCurrentViewType(view.type);

            // BUGFIX: For list views, convert UTC dates to local dates
            // This ensures placeholder generation uses the same dates as the API call
            if (view.type.includes('list')) {
              // Convert UTC Date objects to local date strings
              const startDate = new Date(view.currentStart);
              const endDate = new Date(view.currentEnd);

              const localStartYear = startDate.getFullYear();
              const localStartMonth = startDate.getMonth();
              const localStartDay = startDate.getDate();

              const localEndYear = endDate.getFullYear();
              const localEndMonth = endDate.getMonth();
              const localEndDay = endDate.getDate();

              // Create ISO strings at local midnight
              const localStartStr = `${localStartYear}-${String(localStartMonth + 1).padStart(2, '0')}-${String(localStartDay).padStart(2, '0')}T00:00:00`;
              const localEndStr = `${localEndYear}-${String(localEndMonth + 1).padStart(2, '0')}-${String(localEndDay).padStart(2, '0')}T23:59:59`;

              setViewDateRange({ start: localStartStr, end: localEndStr });
            } else {
              // For month/grid views, use FullCalendar's dates as-is
              setViewDateRange({ start: view.currentStart, end: view.currentEnd });
            }
          }
        }}
        nextDayThreshold="06:00:00"
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventContent={renderEventContent}
        eventDidMount={(eventInfo) => {
          // Handle placeholder events
          if (eventInfo.event.extendedProps.isPlaceholder) {
            // Style placeholder events to look like clickable day entries
            if (eventInfo.view.type === 'listMonth' || eventInfo.view.type === 'list' || eventInfo.view.type === 'list21Days') {
              // TIEMPO-386: Hide placeholder if this day has real events
              // FullCalendar list view structure: .fc-list-day has .fc-list-day-frame with events
              // Each event row is in tbody, grouped by day
              const row = eventInfo.el.closest('tr');
              if (row) {
                // Find all event rows in the same day section
                const tbody = row.closest('tbody');
                if (tbody) {
                  const allEvents = tbody.querySelectorAll('.fc-list-event');
                  const realEventsCount = Array.from(allEvents).filter(
                    el => !el.classList.contains('fc-placeholder-event') &&
                          !el.querySelector('.fc-placeholder-event')
                  ).length;

                  // If there are real events, hide this placeholder
                  if (realEventsCount > 0) {
                    eventInfo.el.style.display = 'none';
                    return; // Don't apply other styles
                  }
                }
              }

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
            fixedWeekCount: false, // Allow variable number of weeks
            dayHeaderFormat: { weekday: 'short' }, // Keep day headers short
          },
          // Custom 8-week view
          dayGrid8Week: {
            type: 'dayGrid',
            duration: { weeks: 8 },
            buttonText: '8 Weeks',
            fixedWeekCount: false,
            eventMinHeight: 25,
            dayHeaderFormat: { weekday: 'short' },
          },
        }}
        dayCellDidMount={({ date, el }) => {
          // BUGFIX: Use LOCAL date for all day comparisons, not UTC
          // When FullCalendar is in UTC mode, the cell dates are UTC
          // But we want gray/today/future based on LOCAL date, not UTC date
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const cellDateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

          // Remove FullCalendar's built-in "today" class (which uses UTC)
          el.classList.remove('fc-day-today');

          if (cellDateStr < todayStr) {
            // Past days: gray
            el.style.backgroundColor = '#c0c0c0';
          } else if (cellDateStr === todayStr) {
            // Today: add FullCalendar's today class back (for yellow highlight)
            el.classList.add('fc-day-today');
          }
          // Future days: default styling (no background color override)
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

      {/* TIEMPO-329: Welcome Modal - Shows on first visit based on user state */}
      <WelcomeModal
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* TIEMPO-381: MapCenter Onboarding Modal - Shows for logged-in users without mapCenter */}
      <MapCenterOnboardingModal
        open={needsOnboarding && !!user}
        onSaveLocation={async (locationData, firebaseToken) => {
          await saveToCloudDefault(locationData, firebaseToken);
          setNeedsOnboarding(false);
        }}
      />

      {/* TIEMPO-311: Floating map icon button - shows when no modals are open */}
      {!isCreateModalOpen && !isViewDetailModalOpen && !isAIDetailModalOpen && (
        <div
          className="map-icon-button"
          onClick={() => openMapCenterModal()}
          title="Click to explore other locations"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            color: 'black',
            padding: '8px',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.boxShadow = '0px 3px 8px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.2)';
          }}
        >
          <MapIcon style={{ fontSize: '20px', color: '#1976d2' }} />
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
