# Service Layer Architecture Approach

This document outlines the technical approach for implementing the service layer architecture in TangoTiempo.

## Service Layer Pattern

### Core Principles

1. **Single Responsibility**: Each service is responsible for a single domain (events, venues, users, etc.)
2. **Data Abstraction**: Services abstract away the details of API calls from components and hooks
3. **Error Handling**: Services implement consistent error handling patterns
4. **Consistent Interface**: Services provide a consistent API for data operations
5. **Testability**: Services are designed to be easy to test and mock

### Service Structure

Each service follows a consistent structure:

```javascript
/**
 * Service description
 */
import axios from 'axios';
import { handleError, getBaseUrl, getAuthHeaders } from './serviceUtils';

/**
 * Function description with parameters and return value
 * 
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Result data
 */
export const functionName = async (options) => {
  try {
    const baseURL = getBaseUrl();
    
    const response = await axios.get(`${baseURL}/api/endpoint`, {
      params: options,
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    return handleError(error, 'Error in functionName');
  }
};
```

### Common Functionality

The `serviceUtils.js` file provides shared functionality:

```javascript
/**
 * Get the base URL for API calls
 * 
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';
};

/**
 * Handle errors consistently
 * 
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @throws {Error} Rethrows with additional context
 */
export const handleError = (error, context) => {
  console.error(`${context}:`, error);
  throw error;
};

/**
 * Get authentication headers
 * 
 * @returns {Object} Headers with auth tokens
 */
export const getAuthHeaders = () => {
  // Implementation depends on auth strategy
  return {};
};
```

## Hook Refactoring Pattern

Hooks will be refactored to use services instead of making direct API calls:

### Before:

```javascript
const useEvents = () => {
  const [events, setEvents] = useState([]);
  
  const fetchEvents = async (options) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events`, {
        params: options
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  return { events, fetchEvents };
};
```

### After:

```javascript
import { getEvents } from '@/services/eventService';

const useEvents = () => {
  const [events, setEvents] = useState([]);
  
  const fetchEvents = async (options) => {
    try {
      const data = await getEvents(options);
      setEvents(data);
    } catch (error) {
      // Handle UI-specific error state
      setError('Failed to load events');
    }
  };
  
  return { events, fetchEvents };
};
```

## Circular Dependency Resolution

The current circular dependency between GeoLocationContext and MasteredLocationContext will be resolved by:

1. Creating dedicated services for both:
   - geoLocationService.js
   - masteredLocationService.js

2. Having both contexts use these services instead of importing from each other:

```javascript
// GeoLocationContext.js
import { getNearestCity } from '@/services/masteredLocationService';

// MasteredLocationContext.js
import { getUserLocation } from '@/services/geoLocationService';
```

3. Services can import from each other without creating circular dependencies at the context level.

## Caching Strategy

Services will implement caching where appropriate:

```javascript
// Simple in-memory cache
const cache = new Map();

export const getOrganizers = async (options) => {
  const cacheKey = JSON.stringify(options);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    const isFresh = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
    
    if (isFresh) {
      return data;
    }
  }
  
  // Fetch from API if not in cache or cache is stale
  try {
    const response = await axios.get(`${getBaseUrl()}/api/organizers`, {
      params: options
    });
    
    // Cache the result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    return handleError(error, 'Error fetching organizers');
  }
};
```

## Testing Approach

Services will have dedicated unit tests:

```javascript
// eventService.test.js
import { getEvents } from '@/services/eventService';
import axios from 'axios';

jest.mock('axios');

describe('eventService', () => {
  it('getEvents should fetch events from the API', async () => {
    const mockData = [{ id: '1', title: 'Test Event' }];
    
    axios.get.mockResolvedValueOnce({ data: mockData });
    
    const result = await getEvents({});
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.any(Object)
    );
    expect(result).toEqual(mockData);
  });
  
  it('getEvents should handle errors', async () => {
    const error = new Error('Network error');
    
    axios.get.mockRejectedValueOnce(error);
    
    await expect(getEvents({})).rejects.toThrow();
  });
});
```

## Timeline and Priority

Services will be implemented in order of importance and usage:

1. **Core Services** (Phase 1): events, venues
2. **Critical Services** (Phase 2): locations, authentication
3. **User Services** (Phase 3): profiles, organizers
4. **Support Services** (Phase 4): analytics, logging, notifications

Each phase builds on the previous one, establishing patterns that later phases can follow.

## Migration Path

The migration will be gradual:

1. For each domain:
   - Create the service file
   - Move API calls from hooks to the service
   - Update hooks to use the service
   - Test thoroughly

2. Components will not need to change their hook usage in most cases - the refactoring happens inside the hooks.

3. No functionality changes are planned, only architectural improvements.

## Success Criteria

The service layer implementation will be considered successful when:

1. All API calls are made through services instead of directly from hooks
2. Circular dependencies between contexts are resolved
3. Error handling is consistent across the application
4. Tests are in place for all services
5. Documentation is complete and up-to-date
6. The application maintains all existing functionality