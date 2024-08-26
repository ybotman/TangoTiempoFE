// src/hooks/useRegions.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
    const [regions, setRegions] = useState([]);


    useEffect(() => {
        console.log('useEffect regions');
        const getRegions = async () => {
            try {
                //const response = await axios.get('http://localhost:3001/api/regions');
                //         console.log('API Base URL:', process.env.NEXT_PUBLIC_TangoTiempoBE_URL);
                const response = await axios.get(`https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/regions/activeRegions`);
                console.log('-->', response)
                setRegions(response.data);
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };
        getRegions();
    }, []);

    return regions;
}
