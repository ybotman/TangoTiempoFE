'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import BeginnerOrganizerList from '@/components/Beginner/BeginnerOrganizerList';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// TIEMPO-408 T2: Beginner page — location-scoped, 60-day windowed GET.
// Mirrors Local's geo query pattern (lat/lng/radius + useGeoSearch) so the
// MapCenter pill in chrome drives what shows here, matching how users
// think of "my area." 60-day server-side window — beginners plan short-term.

const WINDOW_DAYS = 30;

export default function BeginnerPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const { currentLocation, isInitialized } = useGeoLocation();

  const hasLocation = !!(currentLocation?.lat && currentLocation?.lng);

  useEffect(() => {
    // Wait for geo context to initialize before firing the query so we
    // don't fetch a global unfiltered set then replace it.
    if (!isInitialized) return;

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    const params = {
      view: 'beginner',       // TIEMPO-446: BE returns all forBeginners=true events
      forBeginners: true,     // fallback for BE versions before TIEMPO-446 lands
      appId,
      limit: 500,
      start: dayjs().startOf('day').toISOString(),
      end: dayjs().add(WINDOW_DAYS, 'day').endOf('day').toISOString(),
      includeAiGenerated: true,
    };

    if (hasLocation) {
      params.useGeoSearch = true;
      params.lat = currentLocation.lat;
      params.lng = currentLocation.lng;
      const radiusMi = currentLocation.zoomRange || 50;
      params.radius = `${Math.round(radiusMi * 1.60934)}km`;
      params.sortByDistance = true;
    }

    setEvents(null);
    setError(null);
    axios
      .get(`${getApiBaseUrl()}/api/events`, { params })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        setEvents(list);
      })
      .catch((err) => setError(err.message || 'Failed to load events'));
  }, [isInitialized, hasLocation, currentLocation?.lat, currentLocation?.lng, currentLocation?.zoomRange]);

  const radiusLabel = hasLocation
    ? `within ${currentLocation.zoomRange || 50} mi of ${currentLocation.cityName || 'your map center'}`
    : 'near your selected location';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteMenuBar
        activeCategories={[]}
        handleCategoryChange={() => {}}
        categories={[]}
        searchTerm=""
        onSearchChange={() => {}}
        showDiscovered={false}
        onDiscoveredToggle={() => {}}
      />
      <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
        {/* TIEMPO-408: page title removed — mode toggle already labels this view */}
        <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
          Beginner classes, workshops, and welcoming events in the next {WINDOW_DAYS} days — {radiusLabel}.
        </Typography>

        {!isInitialized || events === null ? (
          !error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          )
        ) : null}
        {error && <Alert severity="error">Failed to load events: {error}</Alert>}
        {events && events.length === 0 && (
          <Alert severity="info">
            No beginner events found in the next {WINDOW_DAYS} days near this location. Try widening your map radius.
          </Alert>
        )}
        {events && events.length > 0 && <BeginnerOrganizerList events={events} />}
      </Container>
    </Box>
  );
}
