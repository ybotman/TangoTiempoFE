import { useState, useEffect } from 'react';
import axios from 'axios';

export function useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
    const [events, setEvents] = useState([]);

    const getEvents = async () => {
        if (!selectedRegion) {
            setEvents([]);
            return;
        }
        const active = true;

        try {
            console.log('useEvents-> Making Events API request:', { selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd, active });

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/byCalculatedLocations`, {
                params: {
                    active: true,  // Correct assignment of value
                    calculatedRegionName: selectedRegion,
                    calculatedDivisionName: selectedDivision || undefined,
                    calculatedCityName: selectedCity || undefined,
                    start: calendarStart,
                    end: calendarEnd,
                }
            });

            console.log('useEvents-> Events fetched:', response.data);
            setEvents(response.data);  // This line sets the fetched events to the state
        } catch (error) {
            console.error('useEvents-> Error fetching events:', error);
            setEvents([]);  // Clear events on error
        }
    };

    useEffect(() => {
        getEvents();
    }, [selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd]);

    return { events, refreshEvents: getEvents };
}

export function useCreateEvent() {
    const createEvent = async (eventData) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/api/events/CRUD`, eventData);
            console.log('Event created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    };

    return createEvent;
}