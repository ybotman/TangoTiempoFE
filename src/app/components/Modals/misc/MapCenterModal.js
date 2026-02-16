'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  Slider,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { AuthContext } from '@/contexts/AuthContext';
import {
  useEventDensity,
  PILL_COLORS,
  CATEGORY_COLORS,
  TIME_RANGE_DEFAULT,
  getAggregationLevel,
} from '@/components/EventDensity';
import 'leaflet/dist/leaflet.css';

// TIEMPO-360: Helper to create pill marker HTML with level + name header
function createPillMarkerHtml(item, _zoom) {
  const {
    socialCount = 0,
    eventCount = 0,
    discoveredCount = 0,
    classCount = 0,
    otherCount = 0,
    level = '',
    name = ''
  } = item;

  const isVenue = level === 'venue';

  // Build pills HTML
  const pills = [];

  if (socialCount > 0) {
    pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.social};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${socialCount}</span>`);
  }
  if (eventCount > 0) {
    pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.events};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${eventCount}</span>`);
  }
  if (discoveredCount > 0) {
    pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:${PILL_COLORS.discovered};color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${discoveredCount}</span>`);
  }

  // Venue level: show Class (yellow) and Other (grey) pills
  if (isVenue) {
    if (classCount > 0) {
      pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:#FFFF00;color:#333;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${classCount}</span>`);
    }
    if (otherCount > 0) {
      pills.push(`<span style="display:inline-flex;align-items:center;justify-content:center;background-color:#999;color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:600;margin:0 1px;box-shadow:0 1px 2px rgba(0,0,0,0.2);">${otherCount}</span>`);
    }
  }

  // If no counts, show placeholder
  if (pills.length === 0) {
    return '<div style="display:none;"></div>';
  }

  // Truncate name if too long (no level prefix - just the name)
  const displayName = name.length > 18 ? name.slice(0, 17) + '…' : name;

  // Header with just name (no level prefix)
  const header = displayName
    ? `<div style="font-size:9px;font-weight:600;color:#555;text-align:center;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">${displayName}</div>`
    : '';

  return `<div style="display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.95);padding:4px 6px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;">${header}<div style="display:flex;align-items:center;gap:2px;">${pills.join('')}</div></div>`;
}

/**
 * Create HTML for venue popup with event list (date-ordered by category)
 */
/**
 * Create HTML for city popup - uses shared day-swipe format
 */
function createCityPopupHtml(cityName, events) {
  return createDaySwipePopupHtml(cityName, events, 'city');
}

/**
 * Create HTML for venue popup with day-grouped events (same format as city)
 */
function createVenuePopupHtml(venueName, events) {
  // Reuse city popup format for consistency - same 7-day swipe UI
  return createDaySwipePopupHtml(venueName, events, 'venue');
}

/**
 * Shared popup builder for both city and venue with day tabs
 */
function createDaySwipePopupHtml(locationName, events, type = 'city') {
  if (!events || events.length === 0) {
    return `<div style="padding:8px;"><strong>${locationName}</strong><br/><em>No events</em></div>`;
  }

  const popupId = `${type}-${locationName.replace(/\s+/g, '-').toLowerCase()}`;

  // Group events by day (next 7 days) using LOCAL dates (not UTC)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  const dayEvents = {};

  // Helper to format date as YYYY-MM-DD in local timezone
  const toLocalDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = toLocalDateKey(d);
    days.push({ key, date: d });
    dayEvents[key] = [];
  }

  // Helper: get day of week (0=Sun, 1=Mon, etc) from BYDAY code
  const dayCodeToNum = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

  // Helper: find next occurrence for weekly recurring events
  const getOccurrenceInWindow = (event, windowStart, windowDays) => {
    if (!event.isRepeating || !event.recurrenceRule) {
      // Not recurring - use original date
      return event.venueStartDisplay || event.startDate;
    }

    // Parse BYDAY from rule (e.g., "FREQ=WEEKLY;BYDAY=TU" -> Tuesday)
    const match = event.recurrenceRule.match(/BYDAY=([A-Z]{2})/);
    if (!match) return event.venueStartDisplay || event.startDate;

    const targetDay = dayCodeToNum[match[1]];
    if (targetDay === undefined) return event.venueStartDisplay || event.startDate;

    // Find occurrence within window
    for (let i = 0; i < windowDays.length; i++) {
      const d = windowDays[i].date;
      if (d.getDay() === targetDay) {
        // Found matching day - construct datetime with original time
        const origTime = (event.venueStartDisplay || event.startDate).split('T')[1] || '19:00:00';
        return toLocalDateKey(d) + 'T' + origTime;
      }
    }
    return null; // No occurrence in window
  };

  // Sort events into days using venue local time (with recurring event handling)
  events.forEach((event) => {
    const displayTime = getOccurrenceInWindow(event, today, days);
    if (!displayTime) return; // No occurrence in window

    const key = displayTime.split('T')[0];
    if (dayEvents[key]) {
      // Store with calculated occurrence time
      dayEvents[key].push({ ...event, occurrenceDisplay: displayTime });
    }
  });

  // Sort each day's events by time (using occurrence time for recurring)
  Object.keys(dayEvents).forEach((key) => {
    dayEvents[key].sort((a, b) => {
      const timeA = (a.occurrenceDisplay || a.venueStartDisplay || a.startDate).split('T')[1] || '00:00';
      const timeB = (b.occurrenceDisplay || b.venueStartDisplay || b.startDate).split('T')[1] || '00:00';
      return timeA.localeCompare(timeB);
    });
  });

  // Format time helper - extract time from occurrence/venue display
  const formatTime = (event) => {
    const displayTime = event.occurrenceDisplay || event.venueStartDisplay || event.startDate;
    const timePart = displayTime.split('T')[1];
    if (!timePart) return '';

    // Parse HH:MM from the time part
    const [hours, minutes] = timePart.split(':');
    const h = parseInt(hours, 10);
    const m = minutes || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // Format day tab label
  const formatDayTab = (date, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tmrw';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Build day tabs
  const tabs = days.map((d, i) => {
    const count = dayEvents[d.key].length;
    const hasEvents = count > 0;
    return `<button onclick="document.querySelectorAll('.${popupId}-panel').forEach(p=>p.style.display='none');document.getElementById('${popupId}-${d.key}').style.display='block';document.querySelectorAll('.${popupId}-tab').forEach(t=>{t.style.background='#f5f5f5';t.style.color='#333';});this.style.background='#1976d2';this.style.color='white';" class="${popupId}-tab" style="flex:1;padding:3px 1px;font-size:8px;border:none;background:${i===0?'#1976d2':'#f5f5f5'};color:${i===0?'white':'#333'};cursor:pointer;border-radius:3px;opacity:${hasEvents?1:0.4};">${formatDayTab(d.date, i)}${hasEvents ? `<br/><span style="font-weight:600;">${count}</span>` : ''}</button>`;
  }).join('');

  // Build day panels
  const panels = days.map((d, i) => {
    const evts = dayEvents[d.key];
    const dateLabel = d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (evts.length === 0) {
      return `<div id="${popupId}-${d.key}" class="${popupId}-panel" style="display:${i===0?'block':'none'};padding:6px 0;">
        <div style="font-size:9px;color:#666;margin-bottom:4px;">${dateLabel}</div>
        <div style="color:#999;font-style:italic;font-size:10px;">No events</div>
      </div>`;
    }

    const rows = evts.slice(0, 8).map((event) => {
      const color = CATEGORY_COLORS[event.categoryFirst] || '#999';
      const time = formatTime(event);
      const title = event.title.length > 24 ? event.title.slice(0, 23) + '…' : event.title;
      const aiBadge = event.isDiscovered ? `<span style="background:#2E7D32;color:#fff;font-size:6px;padding:0 2px;border-radius:2px;margin-left:2px;">AI</span>` : '';

      return `<div style="display:flex;align-items:center;gap:4px;padding:2px 0;border-bottom:1px solid #f0f0f0;">
        <span style="width:5px;height:5px;border-radius:50%;background:${color};flex-shrink:0;"></span>
        <span style="font-size:8px;color:#666;min-width:50px;">${time}</span>
        <span style="font-size:9px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}${aiBadge}</span>
      </div>`;
    }).join('');

    const moreText = evts.length > 8 ? `<div style="font-size:8px;color:#666;text-align:center;margin-top:2px;">+${evts.length - 8} more</div>` : '';

    return `<div id="${popupId}-${d.key}" class="${popupId}-panel" style="display:${i===0?'block':'none'};padding:4px 0;">
      <div style="font-size:9px;color:#666;margin-bottom:3px;">${dateLabel}</div>
      <div style="max-height:120px;overflow-y:auto;">${rows}</div>
      ${moreText}
    </div>`;
  }).join('');

  // "View in Calendar" link - pass location filter
  const calendarLink = type === 'city'
    ? `/calendar?city=${encodeURIComponent(locationName)}`
    : `/calendar?venue=${encodeURIComponent(locationName)}`;

  return `<div style="min-width:240px;max-width:300px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;padding-bottom:3px;border-bottom:2px solid #1976d2;">
      <span style="font-weight:600;font-size:11px;">${locationName}</span>
      <a href="${calendarLink}" style="font-size:9px;color:#1976d2;text-decoration:none;" onclick="event.stopPropagation();">View Calendar →</a>
    </div>
    <div style="display:flex;gap:2px;margin-bottom:4px;">${tabs}</div>
    ${panels}
  </div>`;
}

const MapCenterModal = ({
  open,
  onClose,
  onSetLocation,
  onSaveLocation,
  initialLocation = null, // No hardcoded default - use smart fallback from Providers

}) => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const clusterLayerRef = useRef(null);
  const fetchTimerRef = useRef(null);

  const [mapInitialized, setMapInitialized] = useState(false);
  const [centerLat, setCenterLat] = useState(initialLocation?.lat || '');
  const [centerLng, setCenterLng] = useState(initialLocation?.lng || '');
  const [zoomRange, setZoomRange] = useState(initialLocation?.zoomRange || 50);
  const [timeRangeDays] = useState(TIME_RANGE_DEFAULT); // TIEMPO-360: Time range for density fetch
  const [currentZoom, setCurrentZoom] = useState(5); // TIEMPO-360: Track map zoom for pill rendering
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDensityPills, setShowDensityPills] = useState(false); // TIEMPO-381: Toggle for event density pills (default off)

  // TIEMPO-360: Use new density pill system
  const { densityData, loading: densityLoading, metadata: densityMeta, fetchDensity } = useEventDensity();

  // TIEMPO-360: Pre-fetch density data when modal opens (before map init)
  // TIEMPO-381: Only fetch if showDensityPills is enabled
  useEffect(() => {
    if (!open || !showDensityPills) return;

    // Pre-fetch with initial location or US-centric default bounds
    const lat = initialLocation?.lat || 39.8;
    const lng = initialLocation?.lng || -98.5;
    const prefetchBounds = {
      north: lat + 15,
      south: lat - 15,
      east: lng + 25,
      west: lng - 25,
    };

    fetchDensity({
      bounds: prefetchBounds,
      zoom: 5, // Region level for initial view
      timeRangeDays,
    });
    // Prefetch only on modal open - other values read at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, showDensityPills]);

  // Initialize map - with retry logic for ref attachment
  useEffect(() => {
    if (!open || mapInitialized) return;
    
    // Retry logic for waiting for ref to attach
    let retryCount = 0;
    const maxRetries = 10;
    
    const checkAndInit = () => {
      retryCount++;
      
      if (mapRef.current) {
        initializeMap();
      } else if (retryCount < maxRetries) {
        setTimeout(checkAndInit, 100);
      } else {
        setMessage({ type: 'error', text: 'Failed to initialize map container' });
      }
    };
    
    const initializeMap = async () => {
      try {
        // Dynamic import L to avoid SSR issues
        const L = (await import('leaflet')).default;
        
        // Fix Leaflet's default icon path issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });
        
        // Initialize map
        const initialLat = centerLat ? parseFloat(centerLat) : 40.7128;
        const initialLng = centerLng ? parseFloat(centerLng) : -74.0060;
        
        const map = L.map(mapRef.current, {
          center: [initialLat, initialLng],
          zoom: 5,
          scrollWheelZoom: true,
          zoomControl: true
        });
        
        // Add tile layer
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
          {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
            attribution: '© Mapbox © OpenStreetMap'
          }
        ).addTo(map);
      
        // TIEMPO-360: Create layer for density pill markers
        clusterLayerRef.current = L.layerGroup().addTo(map);

        // Handle map click — only set center if not clicking a density marker
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          updateMarker(lat, lng);
          setCenterLat(lat.toFixed(6));
          setCenterLng(lng.toFixed(6));
        });

        // TIEMPO-360: Fetch density pills on zoom/pan (debounced)
        const fetchDensityForBounds = () => {
          if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
          fetchTimerRef.current = setTimeout(() => {
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            setCurrentZoom(zoom);
            fetchDensity({
              bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              },
              zoom,
              timeRangeDays,
            });
          }, 500);
        };

        map.on('moveend', fetchDensityForBounds);
        map.on('zoomend', fetchDensityForBounds);

        // Force map to recalculate size after a delay
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapInstanceRef.current = map;
        setMapInitialized(true);

        // Force resize after initialization, then fetch initial density pills
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            const bounds = mapInstanceRef.current.getBounds();
            const zoom = mapInstanceRef.current.getZoom();
            setCurrentZoom(zoom);
            fetchDensity({
              bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              },
              zoom,
              timeRangeDays,
            });
          }
        }, 300);
        
      } catch (error) {
        console.error('[MapCenterModal] Error initializing map:', error);
        setMessage({ type: 'error', text: 'Failed to initialize map' });
      }
    };
    
    // Start the check and init process
    checkAndInit();
    
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      if (clusterLayerRef.current) clusterLayerRef.current = null;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
    // Map init only on modal open - functions/values read at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  
  // Force map resize when modal fully opens
  useEffect(() => {
    if (open && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  const updateMarker = async (lat, lng) => {
    if (!mapInstanceRef.current) return;
    
    // Dynamic import L to avoid SSR issues
    const L = (await import('leaflet')).default;
    
    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (circleRef.current) {
      circleRef.current.remove();
    }
    
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-location-marker',
      html: '<div style="background-color: #1976d2; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    // Add new marker
    markerRef.current = L.marker([lat, lng], { icon: customIcon })
      .addTo(mapInstanceRef.current);
    
    // Add circle
    circleRef.current = L.circle([lat, lng], {
      radius: zoomRange * 1609.34,
      fillColor: '#1976d2',
      fillOpacity: 0.1,
      color: '#1976d2',
      weight: 2,
      dashArray: '5, 5'
    }).addTo(mapInstanceRef.current);
    
    // Center map
    let targetZoom;
    if (zoomRange <= 10) targetZoom = 10;
    else if (zoomRange <= 25) targetZoom = 9;
    else if (zoomRange <= 50) targetZoom = 8;
    else if (zoomRange <= 100) targetZoom = 7;
    else if (zoomRange <= 150) targetZoom = 6;
    else targetZoom = 5;
    
    mapInstanceRef.current.setView([lat, lng], targetZoom, { animate: true });
  };
  
  // TIEMPO-360: Render density pill markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterLayerRef.current) return;

    // TIEMPO-381: Clear markers if toggle is off
    if (!showDensityPills) {
      clusterLayerRef.current.clearLayers();
      return;
    }

    if (!densityData.length) return;

    const renderPills = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      clusterLayerRef.current.clearLayers();

      const level = getAggregationLevel(currentZoom);
      const canDrill = level !== 'venue';

      densityData.forEach((item) => {
        if (!item.center?.lat || !item.center?.lng) return;

        // Skip or flag "Unknown" items (data quality issue)
        const isUnknown = item.name?.toLowerCase().includes('unknown');
        if (isUnknown && level === 'venue') {
          // At venue level, skip unknown venues entirely
          // These are events with missing venue data - flag for Fulton
          console.warn(`[Density] Skipping Unknown venue with ${item.totalCount} events - data quality issue`);
          return;
        }

        // Create HTML for the pill group
        const pillHtml = createPillMarkerHtml(item, currentZoom);

        const icon = L.divIcon({
          className: 'density-pill-marker',
          html: pillHtml,
          iconSize: [130, 50],
          iconAnchor: [65, 25],
        });

        const marker = L.marker([item.center.lat, item.center.lng], {
          icon,
          interactive: true,
          bubblingMouseEvents: false,
        });

        // Tooltip with location name and pill breakdown
        // Build tooltip - include Class/Other at venue level
        const isVenueLevel = level === 'venue';
        let tooltipParts = [`${item.socialCount} Mil/Pra`, `${item.eventCount} Festival+`];
        if (item.discoveredCount) tooltipParts.push(`${item.discoveredCount} BOT`);
        if (isVenueLevel && item.classCount) tooltipParts.push(`${item.classCount} Class`);
        if (isVenueLevel && item.otherCount) tooltipParts.push(`${item.otherCount} Other`);
        const tooltipContent = `<strong>${item.name}</strong><br/>${tooltipParts.join(' | ')}${canDrill ? '<br/><em>Click to explore</em>' : ''}`;
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -15],
          className: 'density-pill-tooltip',
        });

        // Click behavior based on level
        const isCity = level === 'city';
        const isVenue = level === 'venue';

        if (canDrill && !isCity) {
          // Drill down for region/division/country
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            mapInstanceRef.current.flyTo([item.center.lat, item.center.lng], currentZoom + 3, {
              animate: true,
              duration: 0.8,
            });
          });
        } else if ((isCity || isVenue) && item.events && item.events.length > 0) {
          // City or Venue level - show popup with event list
          const popupHtml = isCity
            ? createCityPopupHtml(item.name, item.events)
            : createVenuePopupHtml(item.name, item.events);
          marker.bindPopup(popupHtml, {
            maxWidth: isCity ? 320 : 280,
            maxHeight: isCity ? 280 : 200,
            className: isCity ? 'city-events-popup' : 'venue-events-popup',
          });
        } else if (canDrill) {
          // Fallback drill for city without events
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            mapInstanceRef.current.flyTo([item.center.lat, item.center.lng], currentZoom + 2, {
              animate: true,
              duration: 0.8,
            });
          });
        }

        clusterLayerRef.current.addLayer(marker);
      });
    };

    renderPills();
  }, [densityData, currentZoom, showDensityPills]);

  // TIEMPO-360: Refetch when time range changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInitialized) return;

    const bounds = mapInstanceRef.current.getBounds();
    const zoom = mapInstanceRef.current.getZoom();
    fetchDensity({
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      zoom,
      timeRangeDays,
    });
    // fetchDensity is inline function, reads current map state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRangeDays, mapInitialized]);

  // Update circle when zoom range changes only
  useEffect(() => {
    if (circleRef.current && centerLat && centerLng) {
      circleRef.current.setRadius(zoomRange * 1609.34);
    }
    // Only trigger on radius changes - coordinates read at call time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomRange]);

  // Update marker when location is set
  useEffect(() => {
    if (mapInitialized && centerLat && centerLng) {
      updateMarker(parseFloat(centerLat), parseFloat(centerLng));
    }
    // updateMarker is inline function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInitialized, centerLat, centerLng]);
  
  const handleSetTemp = () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map to set a location' });
      return;
    }

    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };

    onSetLocation(locationData);
    setMessage({ type: 'success', text: 'Map Center set for Session (temporary)!' });
    setLoading(false);

    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  const handleSavePerm = async () => {
    if (!centerLat || !centerLng) {
      setMessage({ type: 'error', text: 'Please click on the map to set a location' });
      return;
    }

    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to save Cloud Default' });
      return;
    }

    setLoading(true);
    const locationData = {
      lat: parseFloat(centerLat),
      lng: parseFloat(centerLng),
      zoomRange: zoomRange
    };

    try {
      // Get FRESH Firebase auth token (force refresh to avoid expired tokens)
      // Import firebase auth to get fresh token
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User not logged in');
      }

      // Force refresh token to ensure it's not expired
      const firebaseToken = await currentUser.getIdToken(true);

      // Call saveToCloudDefault with Firebase token
      await onSaveLocation(locationData, firebaseToken);
      setMessage({ type: 'success', text: 'Location saved as Cloud Default!' });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[MapCenterModal] Error saving Cloud Default:', error);
      setMessage({ type: 'error', text: `Failed to save: ${error.message}` });
    }
    setLoading(false);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? '95vh' : '90vh',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Map Center Settings</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
        {/* Compact instruction - hidden on mobile */}
        {!isMobile && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Click anywhere on the map to set your center point
          </Typography>
        )}

        {/* Alert - compact on mobile */}
        {user ? (
          <Alert severity="info" sx={{ mb: 1, py: isMobile ? 0.5 : 1 }}>
            {isMobile ? (
              <Typography variant="caption">
                Save for <strong>Session</strong> or <strong>Cloud Default</strong>
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Welcome {user.displayName || user.email}!
                </Typography>
                <Typography variant="body2">
                  You can save this location for your <strong>Session</strong> (temporary) or as your <strong>Cloud Default</strong> (permanent across devices).
                </Typography>
              </>
            )}
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 1, py: isMobile ? 0.5 : 1 }}>
            {isMobile ? (
              <Typography variant="caption">
                Set center for <strong>Session</strong>. Sign up to save permanently!
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Set your map center for this <strong>Session</strong> (temporary only).
                </Typography>
                <Typography variant="body2">
                  <strong>Want to save permanently?</strong> Sign up to save as your Cloud Default!
                </Typography>
              </>
            )}
          </Alert>
        )}

        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        {/* Action Buttons - Compact on mobile */}
        <Box sx={{
          display: 'flex',
          gap: isMobile ? 0.5 : 1.5,
          mb: 1,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Button 1: Set Map Center (Session) - Always visible */}
          <Button
            variant="outlined"
            onClick={handleSetTemp}
            disabled={loading || !centerLat || !centerLng}
            startIcon={!isMobile && <MyLocationIcon sx={{ fontSize: 16 }} />}
            size="small"
            sx={{
              px: isMobile ? 1 : 2,
              py: 0.5,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
              fontWeight: 500,
              minWidth: isMobile ? 'auto' : '160px'
            }}
          >
            {isMobile ? 'Session' : 'Set Map Center (Session)'}
          </Button>

          {/* Button 2: Auth users see "Save as Default", Anonymous see "Sign Up" */}
          {user ? (
            <Button
              variant="contained"
              onClick={handleSavePerm}
              disabled={loading || !centerLat || !centerLng}
              startIcon={!isMobile && <LocationOnIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{
                px: isMobile ? 1 : 2,
                py: 0.5,
                fontSize: isMobile ? '0.7rem' : '0.875rem',
                fontWeight: 500,
                minWidth: isMobile ? 'auto' : '180px'
              }}
            >
              {isMobile ? 'Save Default' : 'Save as Default'}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { window.location.href = '/auth/login'; }}
                size="small"
                sx={{
                  px: isMobile ? 1.5 : 2,
                  py: 0.5,
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  fontWeight: 500,
                  minWidth: isMobile ? 'auto' : '100px'
                }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => { window.location.href = '/auth/signup'; }}
                size="small"
                sx={{
                  px: isMobile ? 1.5 : 2,
                  py: 0.5,
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  fontWeight: 500,
                  minWidth: isMobile ? 'auto' : '100px'
                }}
              >
                Sign Up
              </Button>
            </>
          )}

          {/* TIEMPO-381: Event counts toggle */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showDensityPills}
                onChange={(e) => setShowDensityPills(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                {isMobile ? 'Events' : 'Show Events'}
              </Typography>
            }
            sx={{ m: 0, ml: 1 }}
          />
        </Box>
        
        {/* Search Range Slider */}
        <Box sx={{ mb: 1, px: isMobile ? 0 : 2 }}>
          <Typography variant={isMobile ? 'caption' : 'body2'} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MyLocationIcon sx={{ fontSize: isMobile ? 12 : 16 }} />
            {isMobile ? `${zoomRange}mi` : `Search Range: ${zoomRange} miles`}
          </Typography>
          <Slider
            value={zoomRange}
            onChange={(e, newValue) => setZoomRange(newValue)}
            min={5}
            max={200}
            step={5}
            marks={isMobile ? [
              { value: 5, label: '5' },
              { value: 100, label: '100' },
              { value: 200, label: '200' }
            ] : [
              { value: 5, label: '5mi' },
              { value: 50, label: '50mi' },
              { value: 100, label: '100mi' },
              { value: 200, label: '200mi' }
            ]}
            valueLabelDisplay="auto"
            size="small"
            sx={{ '& .MuiSlider-markLabel': { fontSize: isMobile ? '0.6rem' : '0.75rem' } }}
          />
        </Box>
        
        {/* Map Container with density overlay */}
        <Box sx={{ position: 'relative' }}>
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: isMobile ? '350px' : '400px',
              borderRadius: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              cursor: 'crosshair',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              '& .leaflet-container': {
                height: '100% !important',
                width: '100% !important',
              }
            }}
          >
            {!mapInitialized && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                <CircularProgress />
              </Box>
            )}
          </Box>

          {/* TIEMPO-381: Legend for event density pills - only show when enabled */}
          {mapInitialized && showDensityPills && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 1000,
              pointerEvents: 'none',
            }}>
              {densityLoading && <CircularProgress size={12} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.social }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>Mil/Pra</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.events }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>Festival+</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: PILL_COLORS.discovered }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>BOT</Typography>
              </Box>
              {densityMeta && (
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', lineHeight: 1 }}>
                  {densityMeta.totalEvents || 0} events
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        {/* Coordinates Display */}
        {centerLat && centerLng && (
          <Box sx={{ 
            mt: 2, 
            p: 1, 
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            <Typography variant="caption" color="text.secondary">
              Selected Location: {parseFloat(centerLat).toFixed(4)}°, {parseFloat(centerLng).toFixed(4)}°
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MapCenterModal;

MapCenterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSetLocation: PropTypes.func.isRequired,
  onSaveLocation: PropTypes.func.isRequired,
  initialLocation: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    zoomRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  savedLocation: PropTypes.oneOfType([
    PropTypes.shape({
      lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      zoomRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    PropTypes.oneOf([null])
  ]),
};
