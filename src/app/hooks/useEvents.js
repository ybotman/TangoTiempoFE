import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
  const [events, setEvents] = useState([]);

  const getEvents = useCallback(async () => {
    if (!selectedRegion || !calendarStart || !calendarEnd) {
      setEvents([]);
      return;
    }

    try {
      const params = {
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
        active: true, // Always fetch active events
        masteredRegionName: selectedRegion || undefined,
        masteredDivisionName: selectedDivision || undefined,
        masteredCityName: selectedCity || undefined,
        start: calendarStart,
        end: calendarEnd,
      };

      console.log('Fetching events with params:', params);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/byMasteredLocations`, {
        params,
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  }, [selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  return { events, refreshEvents: getEvents };
}

export function useCreateEvent() {
  const createEvent = async (eventData) => {
    try {
      // Prepare the event data for submission
      const preparedData = {
        ...eventData,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      };

      // Ensure mastered location fields are included
      if (!preparedData.masteredRegionName && preparedData.selectedRegion) {
        preparedData.masteredRegionName = preparedData.selectedRegion;
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
