// src/hooks/useRegions.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
    const [regions, setRegions] = useState([]);


    useEffect(() => {
        console.log('useEffect regions');
        const getRegions = async () => {
            try {
                console.log('API Base URL:', process.env.NEXT_PUBLIC_AZ_TANGO_API_URL);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_AZ_TANGO_API_URL}/api/activeRegions`);
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