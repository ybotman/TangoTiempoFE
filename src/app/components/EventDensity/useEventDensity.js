// TIEMPO-360: Event Density Aggregation Hook
'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import {
  getAggregationLevel,
  categorizeEvent,
} from './densityConstants';

/**
 * Hook to fetch events and aggregate them into density data by geographic hierarchy
 * Supports 1:1 collapsing (skipping levels with single children)
 */
export function useEventDensity() {
  const [densityData, setDensityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const abortControllerRef = useRef(null);

  const baseURL = getApiBaseUrl();

  /**
   * Fetch events within bounds and time range, then aggregate by hierarchy level
   */
  const fetchDensity = useCallback(
    async ({ bounds, zoom, timeRangeDays = 120 }) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        // Calculate date range
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + timeRangeDays);

        // Fetch events within bounds (using BE's bounding box params)
        const response = await axios.get(`${baseURL}/api/events`, {
          params: {
            appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            // Bounding box format per Fulton's specification
            swLat: bounds.south,
            swLng: bounds.west,
            neLat: bounds.north,
            neLng: bounds.east,
            // Request enough events for aggregation
            limit: 2000,
            // Include geolocation fields for mapping
            includeGeo: true,
          },
          signal: abortControllerRef.current.signal,
          timeout: 15000,
        });

        const events = response.data?.events || response.data || [];

        // Determine aggregation level from zoom
        const level = getAggregationLevel(zoom);

        // Aggregate events by the appropriate hierarchy level
        const aggregated = aggregateEvents(events, level);

        // Apply 1:1 collapsing
        const collapsed = collapseHierarchy(aggregated);

        setDensityData(collapsed);
        setMetadata({
          totalEvents: events.length,
          level,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        console.error('[useEventDensity] Error fetching density:', err.message);
        setError(err.message);
        setDensityData([]);
      } finally {
        setLoading(false);
      }
    },
    [baseURL]
  );

  /**
   * Clear density data
   */
  const clearDensity = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDensityData([]);
    setMetadata(null);
    setError(null);
  }, []);

  return {
    densityData,
    loading,
    error,
    metadata,
    fetchDensity,
    clearDensity,
  };
}

/**
 * Aggregate events by geographic hierarchy level
 */
function aggregateEvents(events, level) {
  const groups = new Map();

  events.forEach((event) => {
    const key = getGroupKey(event, level);
    if (!key) return;

    if (!groups.has(key.id)) {
      groups.set(key.id, {
        id: key.id,
        name: key.name,
        level,
        center: key.center,
        socialCount: 0,
        eventCount: 0,
        discoveredCount: 0,
        classCount: 0,      // Class events (venue level only)
        otherCount: 0,      // Other/Unknown events (venue level only)
        categoryCounts: {},
        totalCount: 0,
        events: [], // Store events for venue-level popup
      });
    }

    const group = groups.get(key.id);
    const { isSocial, isEvent, isDiscovered, category } = categorizeEvent(event);

    // High-level counts (Milonga/Practica and Festival/Encuentro/etc)
    if (isSocial) group.socialCount++;
    if (isEvent) group.eventCount++;
    if (isDiscovered) group.discoveredCount++;

    // Class and Other counts (shown at venue level)
    if (category === 'Class') group.classCount++;
    if (category === 'Other' || category === 'Unknown' || category === 'Trip') group.otherCount++;

    // Full category counts (for venue level)
    group.categoryCounts[category] = (group.categoryCounts[category] || 0) + 1;
    group.totalCount++;

    // Store event summary for venue/city-level popup
    if (level === 'venue' || level === 'city') {
      group.events.push({
        title: event.title || event.shortTitle || 'Untitled',
        startDate: event.startDate,
        // Use venue local time for display (already timezone-adjusted by backend)
        venueStartDisplay: event.venueStartDisplay || event.startDate,
        venueAbbr: event.venueAbbr || '',
        categoryFirst: event.categoryFirst || 'Other',
        isDiscovered: event.isDiscovered || false,
        // For recurring events, store recurrence info to calculate occurrences
        isRepeating: event.isRepeating || false,
        recurrenceRule: event.recurrenceRule || null,
      });
    }
  });

  return Array.from(groups.values());
}

/**
 * Helper to extract coordinates from either array or GeoJSON format
 * @param {Array|Object} geo - Either [lng, lat] array or { coordinates: [lng, lat] }
 * @returns {Array|null} - [lng, lat] array or null
 */
function getCoords(geo) {
  if (!geo) return null;
  if (Array.isArray(geo) && geo.length >= 2) return geo;
  if (geo.coordinates && Array.isArray(geo.coordinates)) return geo.coordinates;
  return null;
}

/**
 * Get grouping key based on aggregation level
 * Simplified to: COUNTY -> CITY -> VENUE
 */
function getGroupKey(event, level) {
  switch (level) {
    case 'county': {
      // County level - group by division (closest to county concept)
      const divisionName = event.masteredDivisionName || event.masteredRegionName || 'Unknown';
      const coords = getCoords(event.masteredCityGeolocation);
      return {
        id: `county-${divisionName}`,
        name: divisionName,
        center: coords ? { lat: coords[1], lng: coords[0] } : null,
      };
    }

    case 'city': {
      const cityName = event.masteredCityName || 'Unknown';
      const coords = getCoords(event.masteredCityGeolocation);
      return {
        id: `city-${cityName}`,
        name: cityName,
        center: coords ? { lat: coords[1], lng: coords[0] } : null,
      };
    }

    case 'venue': {
      // Handle both venueName and locationName field names
      const venueName = event.venueName || event.locationName || 'Unknown Venue';

      // Try venue coords first, fall back to city coords
      const coords = getCoords(event.venueGeolocation) || getCoords(event.masteredCityGeolocation);

      if (!coords) {
        console.warn(`[Density] Event missing coordinates: ${event.title || venueName}`);
        return null;
      }
      return {
        id: `venue-${venueName}-${coords[0]}-${coords[1]}`,
        name: venueName,
        center: { lat: coords[1], lng: coords[0] },
      };
    }

    default:
      return null;
  }
}

/**
 * Collapse 1:1 hierarchies (levels with single children)
 * If a level has only one unique child, skip to that child's data
 */
function collapseHierarchy(aggregated) {
  // For now, return as-is. Collapsing logic can be enhanced later
  // by checking if all items at current level belong to same parent

  // Filter out items with no valid center
  return aggregated.filter((item) => item.center && item.center.lat && item.center.lng);
}

export default useEventDensity;
