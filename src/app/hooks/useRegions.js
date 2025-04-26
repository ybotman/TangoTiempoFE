// src/hooks/useRegions.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRegions() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    console.log('useEffect in useRegions');
    const getRegions = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`, {
          params: { appId },
        });
        console.log('Regions loaded:', response.data);
        setRegions(response.data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    getRegions();
  }, []);

  return regions;
}
