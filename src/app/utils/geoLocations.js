'use client';

import axios from 'axios';

export async function geocodeAddress(address1, address2, address3, city, state, zip) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('Mapbox access token is missing or not provided.');
    throw new Error('Mapbox access token is missing or not provided.');
  }

  // Construct the full address query
  const parts = [
    address1,
    address2,
    address3,
    city,
    state,
    zip,
    'United States', // Default to United States
  ]
    .filter(Boolean)
    .join(', ');

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(parts)}.json?access_token=${accessToken}&limit=1`;

  console.log('Geocoding Request URL:', url);

  try {
    const response = await axios.get(url);
    console.log('Geocoding Response:', response.data);

    if (response.data.features?.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      console.log('Extracted Geo Coordinates:', {
        latitude: lat,
        longitude: lng,
      });
      return { latitude: lat, longitude: lng };
    } else {
      console.warn('Geocoding returned no features.');
      return null;
    }
  } catch (error) {
    console.error('Geocoding Error:', error.message, error.response?.data);
    throw error;
  }
}
