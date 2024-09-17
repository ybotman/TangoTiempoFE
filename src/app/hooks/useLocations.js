// useLocations.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useLocations = (regionId, divisionId, cityId) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            console.log("Fetching locations with the following parameters:");
            console.log("Region ID:", regionId);
            console.log("Division ID:", divisionId);
            console.log("City ID:", cityId);

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/locations`, {
                    params: {
                        region: regionId,
                        division: divisionId,
                        city: cityId
                    }
                });

                console.log("API Response:", response.data);  // Log the response data
                setLocations(response.data);
            } catch (error) {
                console.error("Error fetching locations:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (regionId) {  // Ensure regionId is present before making the call
            fetchLocations();
        }
    }, [regionId, divisionId, cityId]);

    return { locations, loading, error };
};