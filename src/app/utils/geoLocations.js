'use client';

import axios from 'axios';

export async function searchVenues(query, options = {}) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('Mapbox access token is missing or not provided.');
    throw new Error('Mapbox access token is missing or not provided.');
  }

  const {
    proximity = null, // [lng, lat] for biasing results
    limit = 10, // Increased to find more landmarks and venues
    types = null, // Remove default - let MapBox search all types for better landmark coverage
    country = 'us' // ISO 3166 country code
  } = options;

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
  url += `?access_token=${accessToken}`;
  url += `&limit=${limit}`;
  // Only add types if explicitly specified - otherwise search all types
  if (types) {
    url += `&types=${types}`;
  }
  url += `&country=${country}`;

  if (proximity) {
    url += `&proximity=${proximity[0]},${proximity[1]}`;
  }

  try {
    const response = await axios.get(url);

    if (response.data.features) {
      return response.data.features.map(feature => {
        // Parse the place components
        const context = feature.context || [];

        // Better name extraction for landmarks
        // MapBox sometimes puts the landmark name in text, sometimes in properties.name
        const placeName = feature.properties?.name || feature.text || '';

        const addressComponents = {
          address: feature.properties?.address || '',
          name: placeName,
          fullAddress: feature.place_name || '',
          city: '',
          state: '',
          zip: '',
          country: ''
        };

        // Extract components from context
        context.forEach(component => {
          if (component.id.startsWith('postcode')) {
            addressComponents.zip = component.text;
          } else if (component.id.startsWith('place')) {
            addressComponents.city = component.text;
          } else if (component.id.startsWith('region')) {
            addressComponents.state = component.short_code ?
              component.short_code.replace('US-', '') : component.text;
          } else if (component.id.startsWith('country')) {
            addressComponents.country = component.text;
          }
        });

        // Handle POI results that have address in properties
        if (feature.properties?.address) {
          addressComponents.address1 = feature.properties.address;
        } else if (feature.address) {
          addressComponents.address1 = `${feature.address} ${feature.text}`;
        } else {
          addressComponents.address1 = feature.text;
        }

        return {
          id: feature.id,
          name: addressComponents.name,
          fullAddress: addressComponents.fullAddress,
          address1: addressComponents.address1,
          address2: '',
          address3: '',
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          country: addressComponents.country,
          center: feature.center, // [lng, lat]
          latitude: feature.center[1],
          longitude: feature.center[0],
          placeType: feature.place_type?.[0] || 'place',
          category: feature.properties?.category || null, // MapBox category if available
          relevance: feature.relevance || 1
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Venue Search Error:', error.message, error.response?.data);
    throw error;
  }
}

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

  // TIEMPO-276: Security cleanup - removed geocoding URL logging

  try {
    const response = await axios.get(url);
    // TIEMPO-276: Security cleanup - removed geocoding response logging

    if (response.data.features?.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      // TIEMPO-276: Security cleanup - removed coordinate logging
      /*
        latitude: lat,
        longitude: lng,
      */
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
