'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import ExploreTimeline from '@/components/Explore/ExploreTimeline';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

// TIEMPO-404 Milestone A: Explore timeline POC
// Fetches travelWorthy events with country, renders a visx scatter plot.
// Scroll / filter / density bar / mobile come in Milestones B + C.
export default function ExplorePage() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    axios
      .get(`${getApiBaseUrl()}/api/events`, {
        params: { travelWorthy: true, appId, limit: 500 },
      })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        setEvents(list.filter((e) => e.masteredCountryName));
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Explore — travel-worthy tango events
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Festivals, marathons, and multi-day workshops worldwide. Hover for details. Click a dot to search for the organizer.
        </Typography>

        {events === null && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load events: {error}</Alert>}
        {events && events.length === 0 && (
          <Alert severity="info">No travel-worthy events found with a resolved country yet.</Alert>
        )}
        {events && events.length > 0 && (
          <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <ExploreTimeline events={events} />
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Showing {events.length} travel-worthy events. Scrollable time and country filters coming in next milestone.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
