import { useState, useEffect } from 'react';
import axios from 'axios';

const useOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        const fetchOrganizers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/organizersActive');
                setOrganizers(response.data);
            } catch (error) {
                console.error('Error fetching organizers:', error);
            }
        };

        fetchOrganizers();
    }, []);

    return organizers;
};

export default useOrganizers;