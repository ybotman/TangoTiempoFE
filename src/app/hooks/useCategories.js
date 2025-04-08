import { useState, useEffect } from 'react';
import axios from 'axios';

const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from .env.local
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/categories`,
          {
            params: { appId }, // Pass appId as a query parameter
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useCategories;
