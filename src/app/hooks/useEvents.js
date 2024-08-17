import { useState, useEffect } from 'react';
import axios from 'axios';
import { transformEvents } from '@/utils/transformEvents';

export function useEvents(selectedRegion) {  // Removed selectedOrganizers
    const [events, setEvents] = useState([]);

    useEffect(() => {
        console.log('Events state has been updated:', events);
    }, [events]);

    useEffect(() => {
        console.log('useEvents>useEffect>Selected Region:', selectedRegion);

        /* get the events */
        const getEvents = async () => {
            const start = new Date().toISOString();
            const end = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/eventsRegion`, {
                    params: {
                        region: selectedRegion,
                        start,
                        end,
                    },
                });
                console.log('getEvents API Response:', response.data);

                // Ensure it's always an array
                const eventsArray = response.data.events || [];

                let transformedEvents = transformEvents(response.data);
                console.log('getEvents transformedEvents:', transformedEvents);

                // Removed the filtering by selectedOrganizers
                setEvents(transformedEvents);
                console.log('Events after setting:', transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        if (selectedRegion) {
            getEvents();
        }
    }, [selectedRegion]);  // Removed selectedOrganizers dependency

    const addEvent = async (newEvent) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/events`, newEvent);
            setEvents([...events, transformEvents([response.data])]);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const updateEvent = async (updatedEvent) => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/events/${updatedEvent._id}`, updatedEvent);
            setEvents(events.map(event => (event._id === updatedEvent._id ? transformEvents([response.data]) : event)));
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/events/${eventId}`);
            setEvents(events.filter(event => event._id !== eventId));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return { events, addEvent, updateEvent, deleteEvent };
}