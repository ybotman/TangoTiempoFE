//app/hooks/useCategories.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/categories`, {
          params: { appId },
        });
        console.log('Categories loaded:', response.data);
        
        // Handle the response data which might have a nested categories array
        if (Array.isArray(response.data)) {
          // Direct array format
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.categories)) {
          // Object with categories array inside (the actual format)
          console.log('Using categories from response.data.categories');
          setCategories(response.data.categories);
        } else {
          console.error('Invalid categories data format:', response.data);
          // Just set empty array if data format is invalid
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error);
        // Just use an empty array on error
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useCategories;
