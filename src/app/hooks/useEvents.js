import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // To handle cases like LocationInfo.js where we're getting counts and don't need date filters
  // Or we're loading the calendar view initially
  const isCountsQuery = calendarStart === null && calendarEnd === null;
  
  // For debugging
  console.log('useEvents called with:', { 
    selectedRegion, 
    selectedDivision, 
    selectedCity, 
    calendarStart: calendarStart?.toISOString ? calendarStart.toISOString() : calendarStart,
    calendarEnd: calendarEnd?.toISOString ? calendarEnd.toISOString() : calendarEnd 
  });
  
  // Generate default date range if needed (current month)
  const getDefaultDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() };
  };

  const getEvents = useCallback(async () => {
    // For counts query, we just need selectedRegion
    // For calendar view, we need region and dates
    if ((!selectedRegion) || (!isCountsQuery && (!calendarStart || !calendarEnd))) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure we use the proper parameter case and types
      // Convert empty strings to undefined to avoid sending them in the request
      const params = {
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
        active: true, // Always fetch active events
        masteredRegionName: selectedRegion && selectedRegion.trim() !== '' ? selectedRegion.trim() : undefined,
        masteredDivisionName: selectedDivision && selectedDivision.trim() !== '' ? selectedDivision.trim() : undefined,
        masteredCityName: selectedCity && selectedCity.trim() !== '' ? selectedCity.trim() : undefined
      };
      
      // Add date parameters 
      if (!isCountsQuery) {
        // Use provided dates
        params.start = calendarStart;
        params.end = calendarEnd;
      } else {
        // For counts queries or initial load, use default date range
        const defaultDates = getDefaultDateRange();
        params.start = defaultDates.start;
        params.end = defaultDates.end;
      }

      console.log('Fetching events with params:', params);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/byMasteredLocations`, {
        params,
        timeout: 10000, // 10 second timeout
      });
      
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
      
      // Keep existing events on error rather than clearing them
      // This provides a better user experience when there are transient network issues
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd, isCountsQuery]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  return { events, loading, error, refreshEvents: getEvents };
}

export function useCreateEvent() {
  const createEvent = async (eventData) => {
    try {
      // Prepare the event data for submission
      const preparedData = {
        ...eventData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
        // The backend requires ownerOrganizerID specifically
        ownerOrganizerID: eventData.ownerOrganizerID || eventData.grantedOrganizer,
        // Additional required fields from the Mongoose schema
        regionName: eventData.masteredRegionName || eventData.selectedRegion,
        // Set default ownerOrganizerName if not provided
        ownerOrganizerName: eventData.ownerOrganizerName || "Event Organizer",
        // Set expiresAt to 1 year after endDate
        expiresAt: new Date(new Date(eventData.endDate).getTime() + 365 * 24 * 60 * 60 * 1000),
      };

      // Ensure mastered location fields are included
      if (!preparedData.masteredRegionName && preparedData.selectedRegion) {
        preparedData.masteredRegionName = preparedData.selectedRegion;
      }

      // Convert dayjs objects to ISO strings
      if (preparedData.startDate) {
        if (typeof preparedData.startDate.toISOString === 'function') {
          preparedData.startDate = preparedData.startDate.toISOString();
        } else if (preparedData.startDate.isValid && preparedData.startDate.isValid()) {
          // Handle dayjs objects
          preparedData.startDate = preparedData.startDate.toISOString();
        }
      }
      
      if (preparedData.endDate) {
        if (typeof preparedData.endDate.toISOString === 'function') {
          preparedData.endDate = preparedData.endDate.toISOString();
        } else if (preparedData.endDate.isValid && preparedData.endDate.isValid()) {
          // Handle dayjs objects
          preparedData.endDate = preparedData.endDate.toISOString();
        }
      }

      // Log the data being sent
      console.log('Submitting event data to API:', preparedData);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/post`, preparedData);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Enhance error message based on response
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || error.message;
        throw new Error(`Server error: ${message}`);
      }
      
      throw error;
    }
  };

  return createEvent;
}
