import { useState, useEffect } from 'react';
import axios from 'axios';
import { transformEvents } from '@/utils/transformEvents';

export function useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd) {
    const [events, setEvents] = useState([]);

    const getEvents = async () => {
        if (!selectedRegion) {
            setEvents([]);
            return;
        }
        const active = true;

        try {
            console.log('Making Events API request:', { selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd, active });


            const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/CalculatedLocations`, {
                params: {
                    calculatedRegionName: selectedRegion,
                    calculatedDivisionName: selectedDivision || undefined,
                    calculatedCityName: selectedCity || undefined,
                    start: calendarStart,
                    end: calendarEnd,
                }
            });

            let transformedEvents = transformEvents(response.data);
            setEvents(transformedEvents);

        } catch (error) {
            console.error('Error fetching events:', error);
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