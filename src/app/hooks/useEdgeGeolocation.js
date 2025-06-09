import { useState, useEffect } from 'react';

export function useEdgeGeolocation() {
  const [edgeLocation, setEdgeLocation] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if edge geolocation is enabled
    const enabled = localStorage.getItem('edge-geolocation-enabled') === 'true';
    setIsEnabled(enabled);

    if (!enabled) {
      setLoading(false);
      return;
    }

    // Get CF geo data from cookie
    const getCfData = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('cf-geo-data='))
        ?.split('=')[1];
      
      if (cookieValue) {
        try {
          const data = JSON.parse(decodeURIComponent(cookieValue));
          
          // Transform CF data to match existing location format
          setEdgeLocation({
            city: data.city,
            region: data.region,
            country: data.country,
            coords: {
              latitude: parseFloat(data.latitude) || null,
              longitude: parseFloat(data.longitude) || null
            },
            source: 'cloudflare',
            timestamp: Date.now()
          });
        } catch (e) {
          console.error('Error parsing CF geo data:', e);
        }
      }
      setLoading(false);
    };

    getCfData();
  }, []);

  const toggleEdgeGeolocation = (enabled) => {
    localStorage.setItem('edge-geolocation-enabled', enabled.toString());
    setIsEnabled(enabled);
    
    // Reload to apply changes
    if (window.location.pathname !== '/geo-diagnostics') {
      window.location.reload();
    }
  };

  return {
    edgeLocation,
    isEnabled,
    loading,
    toggleEdgeGeolocation
  };
}