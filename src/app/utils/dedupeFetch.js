// TIEMPO-257: Simple request deduplication to prevent duplicate API calls
// This reduces 17 duplicate calls to ~3 by preventing in-flight duplicates

import axios from 'axios';

// Map to track in-flight requests
const pendingRequests = new Map();

/**
 * Deduplicates API requests to prevent multiple simultaneous calls to the same endpoint
 * Includes exponential backoff for failed requests (per FeWidget architectural guidance)
 * 
 * @param {string} url - The API endpoint URL
 * @param {object} options - Axios request options
 * @param {number} retries - Number of retry attempts for 5xx errors (default: 3)
 * @returns {Promise} - The deduped promise that resolves with the API response
 */
export const dedupeFetch = async (url, options = {}, retries = 3) => {
  // Create a cache key from URL and relevant options
  const cacheKey = `${url}_${JSON.stringify(options.params || {})}`;
  
  // If request is already in flight, return the existing promise
  if (pendingRequests.has(cacheKey)) {
    // TIEMPO-276: Security cleanup - removed request logging
    return pendingRequests.get(cacheKey);
  }
  
  // Create new request with exponential backoff for failures
  const promise = axios.get(url, options)
    .then(response => {
      // TIEMPO-276: Security cleanup - removed request logging
      return response;
    })
    .catch(err => {
      // Retry on server errors with exponential backoff
      if (retries > 0 && err.response?.status >= 500) {
        // TIEMPO-276: Security cleanup - removed retry logging
        const delay = 1000 * (4 - retries); // 1s, 2s, 3s
        return new Promise(resolve =>
          setTimeout(() => {
            pendingRequests.delete(cacheKey); // Clear before retry
            resolve(dedupeFetch(url, options, retries - 1));
          }, delay)
        );
      }
      console.error(`[DedupeFetch] Request failed for: ${url}`, err.message);
      throw err;
    })
    .finally(() => {
      // Clean up the pending request
      pendingRequests.delete(cacheKey);
    });
  
  // Store the promise for deduplication
  pendingRequests.set(cacheKey, promise);
  return promise;
};

/**
 * POST request deduplication - prevents duplicate mutations
 * Note: Use with caution - only for idempotent operations
 */
export const dedupPost = async (url, data = {}, options = {}, retries = 3) => {
  const cacheKey = `POST_${url}_${JSON.stringify(data)}`;
  
  if (pendingRequests.has(cacheKey)) {
    // TIEMPO-276: Security cleanup - removed POST logging
    return pendingRequests.get(cacheKey);
  }
  
  const promise = axios.post(url, data, options)
    .then(response => {
      // TIEMPO-276: Security cleanup - removed POST logging
      return response;
    })
    .catch(err => {
      if (retries > 0 && err.response?.status >= 500) {
        // TIEMPO-276: Security cleanup - removed retry logging
        const delay = 1000 * (4 - retries);
        return new Promise(resolve =>
          setTimeout(() => {
            pendingRequests.delete(cacheKey);
            resolve(dedupPost(url, data, options, retries - 1));
          }, delay)
        );
      }
      console.error(`[DedupPost] POST failed for: ${url}`, err.message);
      throw err;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });
  
  pendingRequests.set(cacheKey, promise);
  return promise;
};

/**
 * Clear all pending requests (useful for cleanup on unmount)
 */
export const clearPendingRequests = () => {
  pendingRequests.clear();
  // TIEMPO-276: Security cleanup - removed clear logging
};

/**
 * Get count of pending requests (useful for debugging)
 */
export const getPendingRequestCount = () => {
  return pendingRequests.size;
};