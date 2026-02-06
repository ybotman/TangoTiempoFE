// components/DevTools/ServiceStatusGrid.js
'use client';

import React, { useState } from 'react';
import { useServiceHealth } from '@/hooks/useServiceHealth';

/**
 * 3x3 Service Status Grid
 *
 * Grid Layout:
 * Row 1: Express BE, Firebase, Mapbox
 * Row 2: MongoDB, Google GA, Geo API (with accuracy colors)
 * Row 3: AF Health, AF Events, AF Venues
 */
const ServiceStatusGrid = () => {
  const services = useServiceHealth();
  const [hoveredService, setHoveredService] = useState(null);

  /**
   * Get color based on service status
   * Special handling for Geo API with accuracy spectrum
   */
  const getStatusColor = (service) => {
    // Special handling for Geo API - color based on accuracy
    if (service.name === 'Geo API' && service.accuracy !== null) {
      if (service.accuracy < 50) return '#00C853'; // Dark Green: <50m GPS
      if (service.accuracy < 500) return '#4CAF50'; // Green: 50-500m Neighborhood
      if (service.accuracy < 5000) return '#FFEB3B'; // Yellow: 500m-5km City
      if (service.accuracy < 50000) return '#FF9800'; // Orange: 5km-50km Regional
      return '#F44336'; // Red: >50km Country fallback
    }

    // Standard status colors for other services
    switch (service.status) {
      case 'healthy':
        return '#4CAF50'; // Green
      case 'checking':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      case 'disabled':
        return '#757575'; // Gray
      default:
        return '#757575'; // Gray
    }
  };

  /**
   * Get tooltip content for service
   */
  const getTooltipContent = (service) => {
    if (service.name === 'Geo API' && service.accuracy !== null) {
      // Build comprehensive location info from ipapi.co data
      const parts = [];

      if (service.city) parts.push(service.city);
      if (service.region_code) parts.push(service.region_code);
      if (service.postal) parts.push(service.postal);

      const locationLine = parts.length > 0 ? parts.join(', ') : 'Location data unavailable';

      const coords = service.latitude && service.longitude
        ? `${service.latitude.toFixed(4)}, ${service.longitude.toFixed(4)}`
        : 'No coordinates';

      const countryInfo = service.country_name && service.country_code
        ? `${service.country_name} (${service.country_code})`
        : service.country_name || service.country_code || '';

      const timezoneInfo = service.timezone ? `\nTimezone: ${service.timezone}` : '';

      return `${service.name}\nProvider: ipapi.co\n${locationLine}\n${countryInfo}${timezoneInfo}\nCoords: ${coords}\nAccuracy: ±${(service.accuracy / 1000).toFixed(1)}km\nStatus: ✓ ${service.status}`;
    }

    // Google Geolocation API tooltip
    if (service.name === 'Google Geo' && service.accuracy !== null) {
      const coords = service.latitude && service.longitude
        ? `${service.latitude.toFixed(4)}, ${service.longitude.toFixed(4)}`
        : 'No coordinates';

      return `${service.name}\nProvider: Google Geolocation API\nCoords: ${coords}\nAccuracy: ±${(service.accuracy / 1000).toFixed(1)}km\nStatus: ✓ ${service.status}`;
    }

    // Google Reverse Geocoding tooltip
    if (service.name === 'Google Reverse' && service.fullAddress) {
      const coords = service.latitude && service.longitude
        ? `${service.latitude.toFixed(4)}, ${service.longitude.toFixed(4)}`
        : 'No coordinates';

      return `${service.name}\nProvider: Google Geocoding API\nAddress: ${service.fullAddress}\nCoords: ${coords}\nStatus: ✓ ${service.status}`;
    }

    const statusIcon = service.status === 'healthy' ? '✓' :
                       service.status === 'checking' ? '⌛' :
                       service.status === 'error' ? '✗' : '○';

    // Add Swagger link for AF Health when healthy
    if (service.name === 'AF Health' && service.status === 'healthy') {
      return `${service.name}\nStatus: ${statusIcon} ${service.status}\n${service.detail}\n\nSwagger: localhost:7071/api/docs`;
    }

    return `${service.name}\nStatus: ${statusIcon} ${service.status}\n${service.detail}`;
  };

  /**
   * Grid layout: 3 rows × 3 columns
   * Row 1: Express BE, Firebase, Mapbox
   * Row 2: MongoDB, Google GA, Geo API (ipapi.co)
   * Row 3: AF Health, Google Geo (Geolocation), Google Reverse (Geocoding)
   */
  const gridRows = [
    [services.expressBackend, services.firebase, services.mapbox],
    [services.mongodb, services.googleAnalytics, services.geoAPI],
    [services.azureFunctions, services.googleGeoAPI, services.googleReverseGeo],
  ];

  return (
    <>
      {/* Hide on mobile - only show on desktop/laptop */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .service-status-grid {
          display: flex;
        }
        @media (max-width: 767px) {
          .service-status-grid {
            display: none;
          }
        }
      `}</style>
      <div
        className="service-status-grid"
        style={{
          position: 'absolute',
          top: '45px',
          left: '10px',
          flexDirection: 'column',
          gap: '2px',
          zIndex: 100,
        }}
      >
      {gridRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            gap: '2px',
          }}
        >
          {row.map((service, colIndex) => {
            const serviceKey = `${rowIndex}-${colIndex}`;
            const isHovered = hoveredService === serviceKey;

            return (
              <div
                key={serviceKey}
                onMouseEnter={() => setHoveredService(serviceKey)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => setHoveredService(isHovered ? null : serviceKey)}
                style={{
                  position: 'relative',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(service),
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                }}
                title={getTooltipContent(service)} // Basic browser tooltip
              >
                {/* Custom tooltip for desktop hover */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '0',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      whiteSpace: 'pre-line',
                      minWidth: '160px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      zIndex: 1000,
                      pointerEvents: 'none',
                      lineHeight: '1.3',
                    }}
                  >
                    {getTooltipContent(service)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </>
  );
};

export default ServiceStatusGrid;
