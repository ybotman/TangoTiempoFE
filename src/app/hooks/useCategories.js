//app/hooks/useCategories.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching

import { useState, useEffect } from 'react';
import { dedupeFetch } from '@/utils/dedupeFetch';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        // TIEMPO-257: Use dedupeFetch to prevent duplicate category calls
        // Migration: Now uses getApiBaseUrl() for BE/AF switching
        const response = await dedupeFetch(`${getApiBaseUrl()}/api/categories`, {
          params: { appId },
        });
        // Handle the response data which might have a nested categories array
        if (Array.isArray(response.data)) {
          // Direct array format
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.categories)) {
          // Object with categories array inside (the actual format)
          setCategories(response.data.categories);
        } else {
          // TIEMPO-275: Keep console.error for important errors
          console.error('Invalid categories data format:', response.data);
          // Just set empty array if data format is invalid
          setCategories([]);
        }
      } catch (error) {
        // TIEMPO-275: Keep console.error for important errors
        console.error('Error fetching categories:', error);
        // Just use an empty array on error
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useCategories;
