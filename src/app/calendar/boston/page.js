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
// Image import removed - not used

import SiteMenuBar from '@/components/UI/SiteMenuBar';
import { useCalendarPage } from '@/hooks/useCalendarPage';
// CalendarSubMenu removed for simplified Boston view
// CreateEventDetailModal removed - Boston is read-only
import ViewEventDetailModal from '@/components/Modals/ViewEvents/ViewEventDetailModal.js';
import ViewAIEventDetails from '@/components/Modals/ViewEvents/ViewAIEventDetails';
import CategoryCircles from '@/components/UI/CategoryCircles';
import NoEventsAlert from '@/components/UI/NoEventsAlert';
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { AuthContext } from '@/contexts/AuthContext';
// RoleContext not needed for Boston calendar
// listOfAllRoles removed - not used

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

// eslint-disable-next-line no-unused-vars
const formatVenueTimeForCalendar = (venueStartDisplay, venueEndDisplay, venueAbbr) => {
  if (!venueStartDisplay) return { startTime: '', endTime: '' };

  const parseVenueTime = (displayStr) => {
    if (!displayStr) return '';

    // Check if it's ISO format (from main calendar data)
    if (displayStr.includes('T')) {
      const [, timePart] = displayStr.split('T');
      const [hour, minute] = timePart.split(':');
      const hourNum = parseInt(hour, 10);
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const suffix = hourNum >= 12 ? 'p' : 'a';
      return `${displayHour}:${minute}${suffix}`;
    }

    // Otherwise it's display format (AM/PM)
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

  const startTime = parseVenueTime(venueStartDisplay);
  const endTime = parseVenueTime(venueEndDisplay);

  // TIEMPO-316: Removed timezone abbreviation from Boston calendar display
  const endTimeWithTz = endTime;

  return {
    startTime: startTime,
    endTime: endTimeWithTz
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
    setSessionLocation,
    openMapCenterModal
  } = useGeoLocation();

  // Auth context - reserved for future use (read-only message for logged-in users)
  const { user: _user } = useContext(AuthContext);

  // Local state for view type (not provided by hook)
  // Start with 8-week view for desktop, list for mobile
  const getInitialView = () => {
    return typeof window !== 'undefined' && window.innerWidth >= 768 ? 'dayGrid8Week' : 'list21Days';
  };
  const [currentViewType, setCurrentViewType] = useState(getInitialView());

  // Force Boston location on mount
  useEffect(() => {
    // Always set Boston location to ensure it has the source field
    setSessionLocation(BOSTON_CONFIG);
  }, [setSessionLocation]); // Include dependency

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
    // Loading states
    eventsLoading,
    includeAIEvents,
    setIncludeAIEvents,
    selectedAIEventDetails: selectedAIEvent,  // AI event details
    isAIDetailModalOpen: isViewAIEventModalOpen,  // AI modal state
    setAIDetailModalOpen: handleAIModalClose,  // AI modal close
    // Create event modal not used - Boston is read-only
  } = useCalendarPage();

  // TIEMPO-362: Helper to find occurrence override for current date
  const getOccurrenceOverride = (event) => {
    const instanceOverrides = event.extendedProps?.instanceOverrides;
    if (!instanceOverrides || instanceOverrides.length === 0) return null;

    // Get the occurrence date from event.start
    const occurrenceDate = event.start;
    if (!occurrenceDate) return null;

    // Format as YYYY-MM-DD for comparison
    const occurrenceDateStr = occurrenceDate.toISOString().split('T')[0];

    // Find matching override
    const override = instanceOverrides.find(ov => {
      const ovDate = new Date(ov.instanceKey);
      const ovDateStr = ovDate.toISOString().split('T')[0];
      return ovDateStr === occurrenceDateStr;
    });

    return override || null;
  };

  // Custom event content renderer (match main calendar exactly)
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isMonthlyView = eventInfo.view.type === 'dayGridMonth';

    // Check for canceled events
    const isCanceled = event.extendedProps?.eventStatus === 'canceled';

    // Check if this is an AI-discovered event
    const isAIDiscovered = event.extendedProps?.isDiscovered === true;
    
    // Get organizer short names (owner + alternate if exists)
    const ownerShort = event.extendedProps?.organizerShort ||
                       event.extendedProps?.ownerOrganizer?.organizerShort ||
                       event.extendedProps?.ownerOrganizerShort ||
                       event.extendedProps?.ownerOrganizerShortName ||
                       event.extendedProps?.ownerOrganizerName?.substring(0, 8) ||
                       '';
    const alternateShort = event.extendedProps?.alternateOrganizerShortName ||
                           event.extendedProps?.alternateOrganizerName?.substring(0, 8) ||
                           '';
    // Format as "OWNER|ALTER" if alternate exists, otherwise just "OWNER"
    const organizerShort = alternateShort
                          ? `${ownerShort}|${alternateShort}`
                          : ownerShort;

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
              {/* Regular Events Row 1 */}
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
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    color: '#000'
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
              {/* Regular Events Row 2: Full title + appended feature badge */}
              {/* TIEMPO-388: Updated styling - non-inverted text for features, inverted for canceled/orchestra */}
              {(() => {
                const override = getOccurrenceOverride(event);
                const patch = override?.patch;
                const isCanceledOverride = override?.overrideType === 'cancel' || patch?.featureType === 'canceled';
                const hasOrchestra = patch?.featureType === 'orchestra' && patch?.featureName;

                // Build feature badge (excluding orchestra which gets its own row)
                let featureBadge = null;
                if (isCanceledOverride) {
                  // TIEMPO-388: Canceled - inverted style, "TODAY:" prefix
                  const reason = patch?.featureName || '';
                  featureBadge = (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#d32f2f',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      marginLeft: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      TODAY: CANCELED{reason ? ` - ${reason}` : ''}
                    </span>
                  );
                } else if (patch?.featureType && patch?.featureName && !hasOrchestra) {
                  // TIEMPO-388: Non-inverted style (colored text on clear), no prefix
                  const typeLabels = { dj: 'DJ', performer: 'Performer', instructor: 'Instructor' };
                  const typeColors = { dj: '#1976d2', performer: '#9c27b0', instructor: '#ed6c02' };
                  const label = typeLabels[patch.featureType] || patch.featureType;
                  const textColor = typeColors[patch.featureType] || '#1976d2';
                  featureBadge = (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      color: textColor,
                      backgroundColor: 'transparent',
                      padding: '1px 4px',
                      marginLeft: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {label}: {patch.featureName}
                    </span>
                  );
                }

                return (
                  <>
                    {/* Row 2: Title + feature badge */}
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 'normal',
                      lineHeight: '1.1',
                      flex: hasOrchestra ? 0 : 1,
                      color: '#555',
                      textDecoration: isCanceled ? 'line-through' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '2px'
                    }}>
                      <span>{event.extendedProps?.isRecurring && '🔄 '}{event.title}</span>
                      {featureBadge}
                    </div>
                    {/* Row 3: Orchestra - inverted style, no prefix */}
                    {hasOrchestra && (
                      <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        lineHeight: '1.1',
                        color: '#fff',
                        backgroundColor: '#2e7d32',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        marginTop: '1px'
                      }}>
                        🎻 Orchestra: {patch.featureName}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Row 3/4: Featured image for isFeatured events */}
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
      // List view: more detailed display - matching main calendar exactly
      const { startTime, endTime } = event.extendedProps?.venueStartDisplay
        ? formatVenueTimeForCalendar(event.extendedProps.venueStartDisplay, event.extendedProps.venueEndDisplay, event.extendedProps.venueAbbr)
        : formatTimeForListView(event.start, event.end);

      // Detect mobile for wrapping behavior
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
              {/* Regular Events Row 1 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
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
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
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
                          whiteSpace: isMobile ? 'normal' : 'nowrap',
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
              {/* Regular Events Row 2: Full title + appended feature badge */}
              {/* TIEMPO-388: Updated styling - non-inverted text for features, inverted for canceled/orchestra */}
              {(() => {
                const override = getOccurrenceOverride(event);
                const patch = override?.patch;
                const isCanceledOverride = override?.overrideType === 'cancel' || patch?.featureType === 'canceled';
                const hasOrchestra = patch?.featureType === 'orchestra' && patch?.featureName;

                // Build feature badge (excluding orchestra which gets its own row)
                let featureBadge = null;
                if (isCanceledOverride) {
                  // TIEMPO-388: Canceled - inverted style, "TODAY:" prefix
                  const reason = patch?.featureName || '';
                  featureBadge = (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#d32f2f',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginLeft: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      TODAY: CANCELED{reason ? ` - ${reason}` : ''}
                    </span>
                  );
                } else if (patch?.featureType && patch?.featureName && !hasOrchestra) {
                  // TIEMPO-388: Non-inverted style (colored text on clear), no prefix
                  const typeLabels = { dj: 'DJ', performer: 'Performer', instructor: 'Instructor' };
                  const typeColors = { dj: '#1976d2', performer: '#9c27b0', instructor: '#ed6c02' };
                  const label = typeLabels[patch.featureType] || patch.featureType;
                  const textColor = typeColors[patch.featureType] || '#1976d2';
                  featureBadge = (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: textColor,
                      backgroundColor: 'transparent',
                      padding: '2px 6px',
                      marginLeft: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {label}: {patch.featureName}
                    </span>
                  );
                }

                return (
                  <>
                    {/* Row 2: Title + feature badge */}
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 'normal',
                      lineHeight: '1.2',
                      color: '#555',
                      textDecoration: isCanceled ? 'line-through' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '2px'
                    }}>
                      <span>{event.extendedProps?.isRecurring && '🔄 '}{event.title}</span>
                      {featureBadge}
                    </div>
                    {/* Row 3: Orchestra - inverted style, no prefix */}
                    {hasOrchestra && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        lineHeight: '1.2',
                        color: '#fff',
                        backgroundColor: '#2e7d32',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        marginTop: '2px'
                      }}>
                        🎻 Orchestra: {patch.featureName}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Row 3/4: Featured image for isFeatured events */}
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

      if (width >= 768) {
        calendarApi.changeView('dayGrid8Week'); // Switch to 8-week view for large screens
        setCurrentViewType('dayGrid8Week');
      } else {
        // BUGFIX: When switching to list view, navigate to local today first
        const today = new Date();
        const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        calendarApi.gotoDate(localToday);
        calendarApi.changeView('list21Days'); // Switch to List view for smaller screens
        setCurrentViewType('list21Days');
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [calendarRef, currentViewType]);

  return (
    <div data-testid="boston-calendar-page" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Hide FullCalendar's default time and dot columns in list view */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fc-list-event-time {
          display: none !important;
        }
        .fc-list-event-dot {
          display: none !important;
        }
        .fc-list-event-graphic {
          display: none !important;
        }
      `}} />

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

        {/* TIEMPO-381: Location pill - links to main site for other regions */}
        <a
          href="https://www.tangotiempo.com/calendar"
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          title="Click to explore other regions at TangoTiempo.com"
        >
          <span style={{ fontSize: '12px' }}>📍</span>
          <span>Boston ± 200mi</span>
        </a>
      </div>

      <SiteMenuBar
        activeCategories={activeCategories}
        handleCategoryChange={handleCategoryChange}
        categories={categories}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showDiscovered={includeAIEvents}
        onDiscoveredToggle={() => setIncludeAIEvents(!includeAIEvents)}
        readOnly={true}
      />

      {/* TIEMPO-381: Welcome notice removed from main screen - Boston is minimal/embedded */}

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
            <IconButton onClick={handlePrev} title="Previous" data-testid="nav-prev">
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleTodayClick} title="Today" data-testid="nav-today">
              <TodayIcon />
            </IconButton>
            <IconButton onClick={handleNext} title="Next" data-testid="nav-next">
              <ArrowForwardIcon />
            </IconButton>
          </ButtonGroup>

          {/* Date Range Display - Month title removed to match main calendar */}
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

          <ButtonGroup variant="outlined" size="small">
            <IconButton
              onClick={() => {
                calendarRef.current?.getApi()?.changeView('dayGrid8Week');
                setCurrentViewType('dayGrid8Week');
              }}
              color={currentViewType === 'dayGrid8Week' ? 'primary' : 'default'}
              title="8 Week View"
              data-testid="view-8week"
            >
              <CalendarMonthIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                const api = calendarRef.current?.getApi();
                if (api) {
                  // BUGFIX: Force list view to start from local "today", not UTC "today"
                  // When calendar is in UTC mode, we need to explicitly navigate to local date
                  const today = new Date();
                  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  // Navigate to today's date first, then switch view
                  api.gotoDate(localToday);
                  api.changeView('list21Days');
                  setCurrentViewType('list21Days');
                }
              }}
              color={currentViewType === 'list21Days' ? 'primary' : 'default'}
              title="List View"
              data-testid="view-list"
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
        <div data-testid="calendar-container" style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
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
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
            initialView={currentViewType}
            events={coloredFilteredEvents}
            eventClick={handleEventClick}
            // Remove dateClick for read-only view
            headerToolbar={false}
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
                  gap: '2px'
                }}>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#666',
                    fontWeight: 'normal'
                  }}>
                    {monthAbbr}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {day}
                  </span>
                </div>
              );
            }}
            height="auto"
            // Add missing configurations from main calendar
            nextDayThreshold="04:00:00"  // Events until 4am count as previous day (matching main calendar)
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
                listDayFormat: { weekday: 'long', month: 'long', day: 'numeric' },
              },
              // Custom 8-week view to match main calendar
              dayGrid8Week: {
                type: 'dayGrid',
                duration: { weeks: 8 },
                buttonText: '8 Weeks',
                fixedWeekCount: false,
                eventMinHeight: 25,
                dayHeaderFormat: { weekday: 'short' },
              },
            }}
            eventClassNames={(arg) => {
              const category = categories.find((cat) => cat.id === arg.event.extendedProps.category);
              return category && category.name ? [`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`] : [];
            }}
            eventDidMount={(info) => {
              const category = categories.find((cat) => cat.id === info.event.extendedProps.category);
              
              // For month view and 8-week view - transparent background, let renderEventContent handle styling
              if (info.view.type === 'dayGridMonth' || info.view.type === 'dayGrid8Week' || info.view.type === 'dayGrid') {
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
              // Future days: default styling

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