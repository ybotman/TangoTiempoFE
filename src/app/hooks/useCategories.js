import { useState, useEffect } from 'react';
import axios from 'axios';

const useCategories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                //const response = await axios.get('http://localhost:3001/api/categories');

                const response = await axios.get(process.env.NEXT_PUBLIC_TangoTiempoBE_URL ? `${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/categories` : 'https://tangotiempobe-g3c0ebh2b6asbbd6.eastus-01.azurewebsites.net/api/categories');

                //               const response = await axios.get(`${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/categories`);
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