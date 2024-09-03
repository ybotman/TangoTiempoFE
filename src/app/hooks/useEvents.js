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
        const active = true;  // Assuming you want active events only; adjust as needed.

        try {
            console.log('Making Events API request:', { selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd, active });

            //const response = await axios.get('http://localhost:3001/api/events/byCalculatedLocations', {
            const response = await axios.get(process.env.NEXT_PUBLIC_BE_URL ? `${process.env.NEXT_PUBLIC_BE_URL}/api/events/byCalculatedLocations` : 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/events/byCalculatedLocations', {
                params: {
                    calculatedRegionName: selectedRegion,
                    calculatedDivisionName: selectedDivision || undefined,
                    calculatedCityName: selectedCity || undefined,
                    start: calendarStart,
                    end: calendarEnd,
                    active,
                },
            });

            //console.log('Events API : Response', response);
            let transformedEvents = transformEvents(response.data);
            //console.log('Events API : after transformed', transformedEvents);
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
            const response = await axios.post(process.env.NEXT_PUBLIC_BE_URL ? `${process.env.NEXT_PUBLIC_BE_URL}/api/events/CRUD` : 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/events/CRUD', eventData);
            console.log('Event created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    };

    return createEvent;
}