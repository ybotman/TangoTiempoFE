import { useState, useEffect } from 'react';
import axios from 'axios';

const useOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        const getOrganizers = async () => {
            try {
                const response = await axios.get('https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/organizersActive');
                //             const response = await axios.get(`${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/organizersActive`);
                console.log('Full API response:', response.data);
                setOrganizers(response.data);
            } catch (error) {
                console.error('Error fetching organizers:', error);
            }
        };
        getOrganizers();
    }, []);

    return organizers;
};

export default useOrganizers;