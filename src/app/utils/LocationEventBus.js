// src/app/utils/LocationEventBus.js
'use client';

/**
 * LocationEventBus - Event-driven communication system for location contexts
 * 
 * This singleton event bus enables communication between contexts without
 * circular dependencies. It follows a pub/sub pattern where:
 * - LocationAPIContext publishes data events
 * - GeoLocationContext subscribes to location updates
 * - Components can subscribe to specific events as needed
 */

class LocationEventBus {
  constructor() {
    this.events = {};
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name from LOCATION_EVENTS
   * @param {Function} callback - Function to call when event fires
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    if (this.debug) {
      console.log(`[LocationEventBus] Subscribed to ${event}, total listeners: ${this.events[event].length}`);
    }
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Emit an event
   * @param {string} event - Event name from LOCATION_EVENTS
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this.events[event]) {
      if (this.debug) {
        console.log(`[LocationEventBus] No listeners for event: ${event}`);
      }
      return;
    }
    
    if (this.debug) {
      console.log(`[LocationEventBus] Emitting ${event} to ${this.events[event].length} listeners`, data);
    }
    
    // Call each listener with the data
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[LocationEventBus] Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Remove a specific listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    if (this.debug) {
      console.log(`[LocationEventBus] Unsubscribed from ${event}, remaining listeners: ${this.events[event].length}`);
    }
    
    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  clear(event) {
    if (event) {
      delete this.events[event];
      if (this.debug) {
        console.log(`[LocationEventBus] Cleared all listeners for ${event}`);
      }
    } else {
      this.events = {};
      if (this.debug) {
        console.log('[LocationEventBus] Cleared all event listeners');
      }
    }
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }
}

// Create singleton instance
export const locationEventBus = new LocationEventBus();

// Event type constants
export const LOCATION_EVENTS = {
  // API data events
  NEAREST_CITY_FETCHED: 'nearestCityFetched',
  CITIES_FETCHED: 'citiesFetched',
  REGIONS_FETCHED: 'regionsFetched',
  DIVISIONS_FETCHED: 'divisionsFetched',
  
  // User interaction events
  LOCATION_SELECTED: 'locationSelected',
  LOCATION_CLEARED: 'locationCleared',
  TEMPORARY_LOCATION_SET: 'temporaryLocationSet',
  
  // Error events
  LOCATION_ERROR: 'locationError',
  API_ERROR: 'apiError',
  
  // State change events
  LOCATION_CHANGED: 'locationChanged',
  USER_LOCATION_UPDATED: 'userLocationUpdated',
  
  // Loading states
  LOADING_STARTED: 'loadingStarted',
  LOADING_COMPLETED: 'loadingCompleted'
};

// Type definitions for event payloads (for documentation)
export const EVENT_PAYLOADS = {
  nearestCityFetched: {
    cityData: {
      cityID: 'string',
      cityName: 'string',
      divisionID: 'string',
      divisionName: 'string',
      regionID: 'string',
      regionName: 'string',
      countryID: 'string',
      countryName: 'string',
      latitude: 'number',
      longitude: 'number'
    },
    coordinates: {
      latitude: 'number',
      longitude: 'number'
    }
  },
  citiesFetched: {
    cities: 'City[]',
    divisionId: 'string?',
    divisionName: 'string?'
  },
  locationSelected: {
    country: { id: 'string', name: 'string' },
    region: { id: 'string', name: 'string' },
    division: { id: 'string', name: 'string' },
    city: { id: 'string', name: 'string', latitude: 'number', longitude: 'number' }
  },
  locationError: {
    error: 'string',
    operation: 'string',
    details: 'any?'
  }
};