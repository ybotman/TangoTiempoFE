//app/hooks/useCategories.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/categories`, {
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
          console.error('Invalid categories data format:', response.data);
          // Just set empty array if data format is invalid
          setCategories([]);
        }
      } catch (error) {
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
