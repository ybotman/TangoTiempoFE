'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import ExploreCardList from '@/components/Explore/ExploreCardList';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

// TIEMPO-406 (Phase 5 MVP pulled forward): Beginner mode.
// Filtered view of forBeginners=true events. Card list pattern
// reused from Explore mobile. No onboarding prompt yet — that
// lands in the full Phase 5 polish pass.
export default function BeginnerPage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    axios
      .get(`${getApiBaseUrl()}/api/events`, {
        params: { forBeginners: true, appId, limit: 500 },
      })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        setEvents(list);
      })
      .catch((err) => setError(err.message || 'Failed to load events'));
  }, []);

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
        <Typography variant="h4" gutterBottom>
          Beginner
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Classes, practicas, and welcoming events for dancers new to tango.
        </Typography>

        {events === null && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load events: {error}</Alert>}
        {events && events.length === 0 && (
          <Alert severity="info">No beginner-friendly events found yet.</Alert>
        )}
        {events && events.length > 0 && <ExploreCardList events={events} />}
      </Container>
    </Box>
  );
}
