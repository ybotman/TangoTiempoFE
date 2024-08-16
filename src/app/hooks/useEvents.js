// src/hooks/useEvents.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { transformEvents } from '@/utils/transformEvents';

export function useEvents(selectedRegion) {
    const [events, setEvents] = useState([]);
    console.log('useEvents', selectedRegion)
    useEffect(() => {
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
                const transformedEvents = transformEvents(response.data);
                setEvents(transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        if (selectedRegion) {
            getEvents();
        }
    }, [selectedRegion]);

    return events;
}