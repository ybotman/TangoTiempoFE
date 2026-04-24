'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import OrganizerGroupedList from '@/components/Organizer/OrganizerGroupedList';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// TIEMPO-413: Organizer page — mapcenter-scoped, 90-day windowed GET.
// Shows ALL local events grouped by organizer long name. Wider window
// than Beginner/Local so less-frequent organizers still surface.

const WINDOW_DAYS = 90;

export default function OrganizerPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const { currentLocation, isInitialized } = useGeoLocation();

  const hasLocation = !!(currentLocation?.lat && currentLocation?.lng);

  useEffect(() => {
    if (!isInitialized) return;

    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    const params = {
      appId,
      limit: 1000,
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
        <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
          Organizers hosting events in the next {WINDOW_DAYS} days — {radiusLabel}. Tap a name to see their schedule.
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
            No events found in the next {WINDOW_DAYS} days near this location. Try widening your map radius.
          </Alert>
        )}
        {events && events.length > 0 && <OrganizerGroupedList events={events} />}
      </Container>
    </Box>
  );
}
