// src/hooks/useRegions.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
    const [regions, setRegions] = useState([]);


    useEffect(() => {
        console.log('useEffect regions');
        const getRegions = async () => {
            try {

                const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`)

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
