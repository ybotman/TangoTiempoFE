// src/hooks/useRegions.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
    const [regions, setRegions] = useState([]);


    useEffect(() => {
        const getRegions = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_AZ_TANGO_API_URL}/api/regions`);
                setRegions(response.data);
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };
        getRegions();
    }, []);

    return regions;
}