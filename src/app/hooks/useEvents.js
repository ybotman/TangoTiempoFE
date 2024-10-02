import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useEvents(
  selectedRegion,
  selectedDivision,
  selectedCity,
  calendarStart,
  calendarEnd
) {
  const [events, setEvents] = useState([]);

  const getEvents = useCallback(async () => {
    if (!selectedRegion) {
      setEvents([]);
      return;
    }
    try {
      console.log('useEvents-> Making Events API request:', {
        selectedRegion,
        selectedDivision,
        selectedCity,
        calendarStart,
        calendarEnd,
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/byCalculatedLocations`,
        {
          params: {
            active: true,
            calculatedRegionName: selectedRegion,
            calculatedDivisionName: selectedDivision || undefined,
            calculatedCityName: selectedCity || undefined,
            start: calendarStart,
            end: calendarEnd,
          },
        }
      );
      console.log('useEvents-> Events fetched:', response.data);

      setEvents(response.data);
    } catch (error) {
      console.error('useEvents-> Error fetching events:', error);
      setEvents([]);
    }
  }, [
    selectedRegion,
    selectedDivision,
    selectedCity,
    calendarStart,
    calendarEnd,
  ]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  return { events, refreshEvents: getEvents };
}

export function useCreateEvent() {
  const createEvent = async (eventData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/post`,
        eventData
      );
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  return createEvent;
}
