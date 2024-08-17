import { useState, useEffect } from 'react';
import axios from 'axios';

const useOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        const getOrganizers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/organizersActive`);
                setOrganizers(response.data);
            } catch (error) {
                console.error('Error fetching organizers:', error);
            }
        };

        getOrganizers();
    }, []);

    const updateOrganizer = async (organizer) => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/organizers/${organizer._id}`, organizer);
            setOrganizers(prevOrganizers =>
                prevOrganizers.map(org => org._id === organizer._id ? response.data : org)
            );
        } catch (error) {
            console.error('Error updating organizer:', error);
        }
    };

    const addOrganizer = async (newOrganizer) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/organizers`, newOrganizer);
            setOrganizers(prevOrganizers => [...prevOrganizers, response.data]);
        } catch (error) {
            console.error('Error adding organizer:', error);
        }
    };

    return {
        organizers,
        updateOrganizer,
        addOrganizer
    };
};

export default useOrganizers;