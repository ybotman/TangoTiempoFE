// components/DevTools/GeoComparisonDashboard.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

/**
 * Geolocation Services Comparison Dashboard (TIEMPO-321)
 * Tests and compares all geolocation services side-by-side
 *
 * Services tested:
 * 1. BigDataCloud (new AF endpoint - will fail until deployed)
 * 2. Abstract API (new AF endpoint - will fail until deployed)
 * 3. Mapbox Reverse Geocoding (new AF endpoint - will fail until deployed)
 * 4. Google Geolocation API (current - frontend)
 * 5. ipapi.co (current - AF endpoint)
 * 6. Cloudflare (current - AF endpoint)
 */
const GeoComparisonDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const afUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_AF_URL : '';
  const googleApiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_GEO_API_KEY : '';

  /**
   * Test all geolocation services simultaneously
   */
  const testAllServices = async () => {
    setLoading(true);
    setError(null);
    const testResults = [];
    const startTime = Date.now();

    // Test 1: BigDataCloud (AF - will fail until deployed)
    const bigDataCloudStart = Date.now();
    try {
      const response = await fetch(`${afUrl}/api/geo/bigdatacloud/ip`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      testResults.push({
        name: 'BigDataCloud',
        status: response.ok ? 'success' : 'error',
        ip: data.ip || '-',
        latitude: data.latitude || '-',
        longitude: data.longitude || '-',
        city: data.city || '-',
        region: data.region || '-',
        country: data.country_name || data.country || '-',
        accuracy: data.accuracy ? `${(data.accuracy / 1000).toFixed(1)}km` : '-',
        responseTime: `${Date.now() - bigDataCloudStart}ms`,
        error: data.error || null,
        source: 'Azure Function',
      });
    } catch (err) {
      testResults.push({
        name: 'BigDataCloud',
        status: 'error',
        ip: '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: '-',
        responseTime: `${Date.now() - bigDataCloudStart}ms`,
        error: err.message || 'Endpoint not available',
        source: 'Azure Function',
      });
    }

    // Test 2: Abstract API (AF - will fail until deployed)
    const abstractStart = Date.now();
    try {
      const response = await fetch(`${afUrl}/api/geo/abstract/ip`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      testResults.push({
        name: 'Abstract API',
        status: response.ok ? 'success' : 'error',
        ip: data.ip || '-',
        latitude: data.latitude || '-',
        longitude: data.longitude || '-',
        city: data.city || '-',
        region: data.region || '-',
        country: data.country_name || data.country || '-',
        accuracy: data.accuracy ? `${(data.accuracy / 1000).toFixed(1)}km` : '-',
        responseTime: `${Date.now() - abstractStart}ms`,
        error: data.error || null,
        source: 'Azure Function',
      });
    } catch (err) {
      testResults.push({
        name: 'Abstract API',
        status: 'error',
        ip: '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: '-',
        responseTime: `${Date.now() - abstractStart}ms`,
        error: err.message || 'Endpoint not available',
        source: 'Azure Function',
      });
    }

    // Test 3: Google Geolocation API (Frontend - current)
    const googleStart = Date.now();
    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ considerIp: true }),
          signal: AbortSignal.timeout(5000)
        }
      );
      const data = await response.json();

      // Store Google result for Mapbox test
      const googleLat = data.location?.lat;
      const googleLng = data.location?.lng;

      testResults.push({
        name: 'Google Geo API',
        status: response.ok ? 'success' : 'error',
        ip: '-',
        latitude: googleLat || '-',
        longitude: googleLng || '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: data.accuracy ? `${(data.accuracy / 1000).toFixed(1)}km` : '-',
        responseTime: `${Date.now() - googleStart}ms`,
        error: data.error?.message || null,
        source: 'Frontend (Direct)',
      });

      // Test 4: Mapbox Reverse Geocoding (AF - will fail until deployed)
      // Only run if Google succeeded
      if (response.ok && googleLat && googleLng) {
        const mapboxStart = Date.now();
        try {
          const mapboxResponse = await fetch(`${afUrl}/api/geo/mapbox/reverse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: googleLat,
              longitude: googleLng
            }),
            signal: AbortSignal.timeout(5000)
          });
          const mapboxData = await mapboxResponse.json();
          testResults.push({
            name: 'Mapbox (from Google)',
            status: mapboxResponse.ok ? 'success' : 'error',
            ip: '-',
            latitude: mapboxData.latitude || googleLat,
            longitude: mapboxData.longitude || googleLng,
            city: mapboxData.city || '-',
            region: mapboxData.region || '-',
            country: mapboxData.country || '-',
            accuracy: '-',
            responseTime: `${Date.now() - mapboxStart}ms`,
            error: mapboxData.error || null,
            source: 'Azure Function',
            address: mapboxData.formatted_address || null,
          });
        } catch (err) {
          testResults.push({
            name: 'Mapbox (from Google)',
            status: 'error',
            ip: '-',
            latitude: googleLat,
            longitude: googleLng,
            city: '-',
            region: '-',
            country: '-',
            accuracy: '-',
            responseTime: `${Date.now() - mapboxStart}ms`,
            error: err.message || 'Endpoint not available',
            source: 'Azure Function',
          });
        }
      }
    } catch (err) {
      testResults.push({
        name: 'Google Geo API',
        status: 'error',
        ip: '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: '-',
        responseTime: `${Date.now() - googleStart}ms`,
        error: err.message || 'API call failed',
        source: 'Frontend (Direct)',
      });
    }

    // Test 5: ipapi.co (AF - current)
    const ipapiStart = Date.now();
    try {
      const response = await fetch(`${afUrl}/api/geo/ip`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      testResults.push({
        name: 'ipapi.co (Current)',
        status: response.ok && response.status !== 429 ? 'success' : 'error',
        ip: data.ip || '-',
        latitude: data.latitude || '-',
        longitude: data.longitude || '-',
        city: data.city || '-',
        region: data.region || '-',
        country: data.country_name || data.country || '-',
        accuracy: '~5km',
        responseTime: `${Date.now() - ipapiStart}ms`,
        error: response.status === 429 ? '429 Rate Limit' : data.error || null,
        source: 'Azure Function',
      });
    } catch (err) {
      testResults.push({
        name: 'ipapi.co (Current)',
        status: 'error',
        ip: '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: '-',
        responseTime: `${Date.now() - ipapiStart}ms`,
        error: err.message || 'Request failed',
        source: 'Azure Function',
      });
    }

    // Test 6: Cloudflare (AF - current)
    const cloudflareStart = Date.now();
    try {
      const response = await fetch(`${afUrl}/api/cloudflare/info`, {
        signal: AbortSignal.timeout(5000)
      });
      const data = await response.json();
      const cfData = data.data || data;
      testResults.push({
        name: 'Cloudflare',
        status: response.ok ? 'success' : 'error',
        ip: cfData.ip || '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: cfData.country || '-',
        accuracy: 'Country-level',
        responseTime: `${Date.now() - cloudflareStart}ms`,
        error: data.error || null,
        source: 'Azure Function',
      });
    } catch (err) {
      testResults.push({
        name: 'Cloudflare',
        status: 'error',
        ip: '-',
        latitude: '-',
        longitude: '-',
        city: '-',
        region: '-',
        country: '-',
        accuracy: '-',
        responseTime: `${Date.now() - cloudflareStart}ms`,
        error: err.message || 'Request failed',
        source: 'Azure Function',
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`[GeoComparison] All tests completed in ${totalTime}ms`);

    setResults(testResults);
    setLoading(false);
  };

  // Auto-test on mount
  useEffect(() => {
    testAllServices();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get valid map markers (only results with actual lat/long)
  const mapMarkers = results.filter(
    r => typeof r.latitude === 'number' && typeof r.longitude === 'number'
  );

  // Calculate map center (average of all valid coordinates)
  const mapCenter = mapMarkers.length > 0
    ? [
        mapMarkers.reduce((sum, r) => sum + r.latitude, 0) / mapMarkers.length,
        mapMarkers.reduce((sum, r) => sum + r.longitude, 0) / mapMarkers.length
      ]
    : [42.3601, -71.0589]; // Default to Boston

  // Color mapping for different services
  const getMarkerColor = (name) => {
    const colors = {
      'BigDataCloud': '#2196F3',
      'Abstract API': '#4CAF50',
      'Google Geo API': '#FF5722',
      'Mapbox (from Google)': '#9C27B0',
      'ipapi.co (Current)': '#FF9800',
      'Cloudflare': '#00BCD4',
    };
    return colors[name] || '#757575';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Geolocation Services Comparison (TIEMPO-321)
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={testAllServices}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Refresh All'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        ⚠️ Note: New endpoints (BigDataCloud, Abstract API, Mapbox) will fail until Azure Functions are deployed.
      </Typography>

      <Grid container spacing={2}>
        {/* Map Section */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Map View ({mapMarkers.length} locations)
            </Typography>
            {mapMarkers.length > 0 && typeof window !== 'undefined' && (
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '340px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {mapMarkers.map((marker, index) => {
                  // Import leaflet for custom icon (only on client side)
                  if (typeof window !== 'undefined') {
                    const L = require('leaflet');
                    const icon = new L.DivIcon({
                      className: 'custom-marker',
                      html: `<div style="background-color: ${getMarkerColor(marker.name)}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${index + 1}</div>`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    });

                    return (
                      <Marker
                        key={index}
                        position={[marker.latitude, marker.longitude]}
                        icon={icon}
                      >
                        <Popup>
                          <strong>{marker.name}</strong><br />
                          Lat: {marker.latitude.toFixed(4)}<br />
                          Lng: {marker.longitude.toFixed(4)}<br />
                          {marker.city !== '-' && `City: ${marker.city}`}<br />
                          {marker.accuracy !== '-' && `Accuracy: ${marker.accuracy}`}
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}
              </MapContainer>
            )}
            {mapMarkers.length === 0 && (
              <Box sx={{
                height: 340,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  No location data available yet. Click "Refresh All" to test services.
                </Typography>
              </Box>
            )}
            {/* Legend */}
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mapMarkers.map((marker, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getMarkerColor(marker.name),
                      border: '1px solid white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                    {index + 1}. {marker.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={7}>
          {results.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lat/Long</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Accuracy</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:hover': { backgroundColor: '#fafafa' },
                        backgroundColor: result.error ? '#ffebee' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {typeof result.latitude === 'number' && typeof result.longitude === 'number' && (
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getMarkerColor(result.name),
                                border: '1px solid white',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {result.name}
                            </Typography>
                            {result.address && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                🏠 {result.address}
                              </Typography>
                            )}
                            {result.error && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                ⚠️ {result.error}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.status}
                          size="small"
                          color={getStatusColor(result.status)}
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {result.ip}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {typeof result.latitude === 'number' && typeof result.longitude === 'number'
                            ? `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`
                            : `${result.latitude}, ${result.longitude}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{result.city}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{result.region}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{result.country}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{result.accuracy}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {result.responseTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                          {result.source}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeoComparisonDashboard;
