import { useState, useEffect } from 'react';
import axios from 'axios';
import { transformEvents } from '@/utils/transformEvents';

export function useEvents(selectedRegion) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!selectedRegion) {
            setEvents([]);  // Clear events if no calcuatedRegion is selected
            return;
        }

        const getEvents = async () => {
            const start = new Date().toISOString();
            const end = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

            try {
                console.log('Making API request:', { calcuatedRegion: selectedRegion, start, end });
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/eventsRegion`, {

                    params: {
                        calcuatedRegion: selectedRegion,
                        start,
                        end,
                    },
                });
                let transformedEvents = transformEvents(response.data);
                setEvents(transformedEvents);
                console.log('Events after setting:', transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        getEvents();
    }, [selectedRegion]);

    return events; // Ensure you're returning just the events array
}