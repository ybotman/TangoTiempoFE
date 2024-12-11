import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
  const [events, setEvents] = useState([]);

  const getEvents = useCallback(async () => {
    if (!selectedRegion) {
      setEvents([]);
      return;
    }

    try {
      const params = {
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/post`, eventData);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  return createEvent;
}
