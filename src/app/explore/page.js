'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import ExploreTimeline from '@/components/Explore/ExploreTimeline';
import ExploreCardList from '@/components/Explore/ExploreCardList';
import CountryFilter from '@/components/Explore/CountryFilter';
import DensityBar from '@/components/Explore/DensityBar';
import { COUNTRY_COOKIE } from '@/components/Explore/exploreConstants';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import dayjs from 'dayjs';

// TIEMPO-404 Milestone D: responsive — scatter on desktop, card list on mobile portrait.

const readCookieCountries = () => {
  if (typeof window === 'undefined') return null;
  const raw = Cookies.get(COUNTRY_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeCookieCountries = (countries) => {
  Cookies.set(COUNTRY_COOKIE, JSON.stringify(countries), { expires: 365, sameSite: 'Lax' });
};

export default function ExplorePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <900px → card list
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(null); // null = not yet seeded
  const [xInfo, setXInfo] = useState(null); // { xScale, width, leftMargin, rightMargin }

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

  const availableCountries = useMemo(() => {
    if (!events) return [];
    return Array.from(new Set(events.map((e) => e.masteredCountryName))).sort();
  }, [events]);

  // Seed selection from cookie once events load; default to all available
  useEffect(() => {
    if (!events || selectedCountries !== null) return;
    const stored = readCookieCountries();
    const seeded = stored && stored.length
      ? stored.filter((c) => availableCountries.includes(c))
      : availableCountries;
    setSelectedCountries(seeded.length ? seeded : availableCountries);
  }, [events, availableCountries, selectedCountries]);

  const handleCountryChange = useCallback((next) => {
    setSelectedCountries(next);
    writeCookieCountries(next);
  }, []);

  const filteredEvents = useMemo(() => {
    if (!events || !selectedCountries) return [];
    const set = new Set(selectedCountries);
    return events.filter((e) => set.has(e.masteredCountryName));
  }, [events, selectedCountries]);

  const sortedActiveCountries = useMemo(
    () => Array.from(new Set(filteredEvents.map((e) => e.masteredCountryName))).sort(),
    [filteredEvents]
  );

  const dateRange = useMemo(() => {
    if (!filteredEvents.length) {
      return [dayjs().toDate(), dayjs().add(6, 'month').toDate()];
    }
    const allMs = filteredEvents.flatMap((e) => [
      new Date(e.startDate).getTime(),
      new Date(e.endDate).getTime(),
    ]);
    return [
      dayjs(Math.min(...allMs)).subtract(14, 'day').toDate(),
      dayjs(Math.max(...allMs)).add(14, 'day').toDate(),
    ];
  }, [filteredEvents]);

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
      <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Explore
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

        {events && events.length > 0 && selectedCountries !== null && (
          <>
            <CountryFilter
              availableCountries={availableCountries}
              selected={selectedCountries}
              onChange={handleCountryChange}
              compact={isMobile}
            />

            {filteredEvents.length === 0 ? (
              <Alert severity="info">No events match the selected countries. Try a different filter.</Alert>
            ) : isMobile ? (
              <ExploreCardList events={filteredEvents} />
            ) : (
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <ExploreTimeline
                  events={filteredEvents}
                  countries={sortedActiveCountries}
                  dateRange={dateRange}
                  onXScaleReady={setXInfo}
                />
                {xInfo && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ overflowX: 'auto' }}>
                      <DensityBar
                        events={filteredEvents}
                        xScale={xInfo.xScale}
                        leftMargin={xInfo.leftMargin}
                        width={xInfo.width}
                      />
                    </Box>
                  </>
                )}
              </Paper>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
