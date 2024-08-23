import { useState, useEffect } from 'react';
import axios from 'axios';
import { transformEvents } from '@/utils/transformEvents';

export function useEvents(selectedRegion, selectedDivision, selectedCity) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        console.log("Selected Region:", selectedRegion);
        console.log("Selected Division:", selectedDivision);
        console.log("Selected City:", selectedCity);

        if (!selectedRegion) {
            console.log('No region selected, skipping API call.');
            setEvents([]);  // Clear events if no region is selected
            return;
        }

        const getEvents = async () => {
            const start = new Date().toISOString();
            const end = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

            const forcedAPI = 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/eventsByCalcuatedLocations'

            try {
                console.log('Making Events API request:', { selectedRegion, selectedDivision, selectedCity, start, end });
                console.log('but forcedApi', forcedAPI)
                const response = await axios.get(forcedAPI)
                /*               const response = await axios.get(`${process.env.
                                   NEXT_PUBLIC_TangoTiempoBE_URL}/api/eventsByLocation`, {
                                   params: {
                                       region: selectedRegion,
                                       division: selectedDivision,
                                       city: selectedCity,
                                       start,
                                       end,
                                   },
            });
                   */
                console.log('Events API : Response', response)
                let transformedEvents = transformEvents(response.data);
                console.log('Events API : after transformed', transformedEvents);
                setEvents(transformedEvents);

            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        getEvents();
    }, [selectedRegion, selectedDivision, selectedCity]);

    return events; // Ensure you're returning just the events array
}