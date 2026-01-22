/**
 * Venue Service - Provides functions for venue operations
 *
 * This service abstracts venue-related API calls and operations,
 * creating a clean interface for components and hooks to use.
 * Created to resolve React Hooks ESLint issues in useEvents.js.
 *
 * Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
 */

import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

/**
 * Get a list of venues with optional filtering
 * 
 * @param {Object} options - Query parameters
 * @param {string} [options.cityId] - Filter by city ID
 * @param {string} [options.masteredCityId] - Filter by mastered city ID
 * @param {string} [options.masteredDivisionId] - Filter by division ID
 * @param {string} [options.masteredRegionId] - Filter by region ID
 * @param {boolean} [options.isActive] - Filter by active status
 * @param {string} [options.name] - Filter by name (partial match)
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=100] - Limit per page
 * @param {string} [options.select] - Fields to select
 * @param {boolean} [options.populate=false] - Whether to populate references
 * @returns {Promise<Object>} Venues and pagination data
 */
export const getVenues = async (options = {}) => {
  try {
    const baseURL = getApiBaseUrl();
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    
    // Prepare parameters
    const params = {
      appId,
      ...options
    };
    
    const response = await axios.get(`${baseURL}/api/venues`, {
      params,
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

/**
 * Get a venue by its ID
 * 
 * @param {string} venueId - The venue ID to retrieve
 * @param {boolean} [populate=false] - Whether to populate references
 * @returns {Promise<Object>} The venue data
 */
export const getVenueById = async (venueId, populate = false) => {
  try {
    if (!venueId) {
      throw new Error('Venue ID is required');
    }
    
    const baseURL = getApiBaseUrl();
    
    const response = await axios.get(`${baseURL}/api/venues/${venueId}`, {
      params: { populate: populate.toString() },
      timeout: 8000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching venue ${venueId}:`, error);
    throw error;
  }
};

/**
 * Create a new venue
 * 
 * @param {Object} venueData - The venue data to create
 * @returns {Promise<Object>} The created venue
 */
export const createVenue = async (venueData) => {
  try {
    const baseURL = getApiBaseUrl();
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    
    // Ensure appId is included
    const preparedData = {
      appId,
      ...venueData
    };
    
    const response = await axios.post(`${baseURL}/api/venues`, preparedData);
    
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
};

/**
 * Update an existing venue
 * 
 * @param {string} venueId - The ID of the venue to update
 * @param {Object} venueData - The updated venue data
 * @returns {Promise<Object>} The updated venue
 */
export const updateVenue = async (venueId, venueData) => {
  try {
    if (!venueId) {
      throw new Error('Venue ID is required');
    }
    
    const baseURL = getApiBaseUrl();
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    
    // Ensure appId is included
    const preparedData = {
      appId,
      ...venueData
    };
    
    const response = await axios.put(`${baseURL}/api/venues/${venueId}`, preparedData);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating venue ${venueId}:`, error);
    throw error;
  }
};

/**
 * Delete a venue
 *
 * @param {string} venueId - The ID of the venue to delete
 * @param {string} firebaseToken - Firebase authentication token (required for authorization)
 * @returns {Promise<Object>} The response data
 */
export const deleteVenue = async (venueId, firebaseToken) => {
  try {
    if (!venueId) {
      throw new Error('Venue ID is required');
    }

    if (!firebaseToken) {
      throw new Error('Authentication token is required');
    }

    const baseURL = getApiBaseUrl();

    const response = await axios.delete(`${baseURL}/api/venues/${venueId}`, {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error deleting venue ${venueId}:`, error);
    throw error;
  }
};