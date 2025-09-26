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
    types = null, // Can specify 'poi' for businesses, null for all
    country = 'us', // ISO 3166 country code
    useSearchBox = true // Use Search Box API for better POI results
  } = options;

  let url;

  if (useSearchBox) {
    // Use Search Box API for better POI/business results
    url = `https://api.mapbox.com/search/searchbox/v1/forward`;
    url += `?q=${encodeURIComponent(query)}`;
    url += `&access_token=${accessToken}`;
    url += `&limit=${limit}`;
    url += `&country=${country}`;

    if (proximity) {
      url += `&proximity=${proximity[0]},${proximity[1]}`;
    }

    if (types) {
      url += `&types=${types}`;
    }
  } else {
    // Fallback to Geocoding API
    url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
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
  }

  try {
    console.log('🔍 Searching venues with URL:', url);

    // Use fetch instead of axios for better browser compatibility
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Search response:', data);

    if (data.features) {
      console.log(`✅ Found ${data.features.length} results`);
      return data.features.map(feature => {
        // Parse the place components
        const context = feature.context || [];

        // Better name extraction for landmarks and POIs
        // Search Box API uses properties.name, Geocoding API uses text
        const placeName = feature.properties?.name || feature.text || '';

        // For Search Box API, get the full address from properties
        const fullAddress = feature.properties?.full_address || feature.place_name || '';

        const addressComponents = {
          address: feature.properties?.address || '',
          name: placeName,
          fullAddress: fullAddress,
          city: '',
          state: '',
          zip: '',
          country: ''
        };

        // Extract components - Search Box API may have different structure
        if (feature.properties?.address_line1) {
          // Search Box API structure
          addressComponents.address1 = feature.properties.address_line1;
          addressComponents.city = feature.properties.address_level2 || '';
          addressComponents.state = feature.properties.address_level1 || '';
          addressComponents.zip = feature.properties.postcode || '';
          addressComponents.country = feature.properties.country || '';
        } else {
          // Geocoding API structure - extract from context
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

          // Handle address for Geocoding API
          if (feature.properties?.address) {
            addressComponents.address1 = feature.properties.address;
          } else if (feature.address) {
            addressComponents.address1 = `${feature.address} ${feature.text}`;
          } else {
            addressComponents.address1 = feature.text;
          }
        }

        // Get coordinates - Search Box API uses geometry.coordinates
        const coordinates = feature.geometry?.coordinates || feature.center || [0, 0];

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
          center: coordinates, // [lng, lat]
          latitude: coordinates[1],
          longitude: coordinates[0],
          placeType: feature.properties?.feature_type || feature.place_type?.[0] || 'place',
          category: feature.properties?.category || feature.properties?.poi_category || null,
          relevance: feature.relevance || 1
        };
      });
    }

    console.log('⚠️ No features in response');
    return [];
  } catch (error) {
    console.error('❌ Venue Search Error:', error.message);

    // For fetch errors, we don't have error.response like axios
    if (error.message.includes('HTTP error')) {
      console.error('API returned an error status');
    }

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
