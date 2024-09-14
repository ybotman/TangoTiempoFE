//app/hooks/useOrganizers.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useOrganizers = (calculatedRegion) => {
    const [organizers, setOrganizers] = useState([]);

    useEffect(() => {
        const getOrganizers = async (region) => {
            if (!region) {
                // If no region is provided, return early and set organizers to an empty array
                setOrganizers([]);
                return;
            }

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`, {
                    params: {
                        activeCalculatedRegion: region
                    }
                });

                setOrganizers(response.data);
            } catch (error) {
                console.error('Error fetching organizers:', error);
                                setOrganizers([]);
            }
        };

        // Call getOrganizers only if calculatedRegion is available
        getOrganizers(calculatedRegion);
    }, [calculatedRegion]);

    return organizers;
};

export default useOrganizers;