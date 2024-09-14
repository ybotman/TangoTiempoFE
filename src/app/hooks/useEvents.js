//app/hooks/useEvents.js// app/hooks/useEvents.js

import { useState, useEffect } from "react";
import axios from "axios";

export function useEvents(
  selectedRegion,
  selectedDivision,
  selectedCity,
  calendarStart,
  calendarEnd
) {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    if (!selectedRegion) {
      setEvents([]);
      return;
    }
    try {
      console.log("useEvents-> Making Events API request:", {
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

      setEvents(response.data);
    } catch (error) {
      console.error("useEvents-> Error fetching events:", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    getEvents();
  }, [
    selectedRegion,
    selectedDivision,
    selectedCity,
    calendarStart,
    calendarEnd,
  ]);

  return { events, refreshEvents: getEvents };
}

export function useCreateEvent() {
  const createEvent = async (eventData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/CRUD`,
        eventData
      );
      console.log("Event created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  return createEvent;
}