'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import ExploreTimeline from '@/components/Explore/ExploreTimeline';
import ExploreCardList from '@/components/Explore/ExploreCardList';
import ExploreFilters from '@/components/Explore/ExploreFilters';
import DensityBar from '@/components/Explore/DensityBar';
import { COUNTRY_COOKIE, categoryLabel } from '@/components/Explore/exploreConstants';
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
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [xInfo, setXInfo] = useState(null); // { xScale, width, leftMargin, rightMargin }

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    axios
      .get(`${getApiBaseUrl()}/api/events`, {
        params: { travelWorthy: true, appId, limit: 500 },
      })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        // TIEMPO-404 D.1: keep ALL travelWorthy events for mobile card list.
        // Desktop scatter will still filter to country-resolved at render time.
        setEvents(list);
      })
      .catch((err) => setError(err.message || 'Failed to load events'));
  }, []);

  const availableCountries = useMemo(() => {
    if (!events) return [];
    // Exclude null/undefined — only countries-resolved events contribute to the desktop filter.
    return Array.from(new Set(events.map((e) => e.masteredCountryName).filter(Boolean))).sort();
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

  // Desktop filter: matches country selection + category
  const filteredEvents = useMemo(() => {
    if (!events || !selectedCountries) return [];
    const countrySet = new Set(selectedCountries);
    return events.filter((e) => {
      if (!countrySet.has(e.masteredCountryName)) return false;
      if (selectedCategory && categoryLabel(e.categoryFirst) !== selectedCategory) return false;
      return true;
    });
  }, [events, selectedCountries, selectedCategory]);

  // Mobile filter: category only (country filter optional on mobile — presets still work)
  const mobileFilteredEvents = useMemo(() => {
    if (!events) return [];
    let out = events;
    if (selectedCountries && selectedCountries.length && selectedCountries.length < availableCountries.length) {
      const countrySet = new Set(selectedCountries);
      // Keep country-null events visible when any country filter is active only if user hasn't narrowed hard
      out = out.filter((e) => !e.masteredCountryName || countrySet.has(e.masteredCountryName));
    }
    if (selectedCategory) {
      out = out.filter((e) => categoryLabel(e.categoryFirst) === selectedCategory);
    }
    return out;
  }, [events, selectedCountries, selectedCategory, availableCountries.length]);

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
        {/* TIEMPO-408: page title removed — mode toggle already labels this view */}
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
            <ExploreFilters
              category={selectedCategory}
              onCategoryChange={setSelectedCategory}
              availableCountries={availableCountries}
              selectedCountries={selectedCountries}
              onCountriesChange={handleCountryChange}
            />

            {isMobile ? (
              <ExploreCardList events={mobileFilteredEvents} />
            ) : availableCountries.length === 0 ? (
              // TIEMPO-408: desktop fallback — if no events have resolved country
              // (backfill not yet run / backend hasn't denormalized), show the
              // card list so events are still visible instead of an empty timeline.
              <>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Geography data is still catching up — showing event list.
                </Alert>
                <ExploreCardList events={mobileFilteredEvents} />
              </>
            ) : filteredEvents.length === 0 ? (
              <Alert severity="info">No events match the selected countries. Try a different filter.</Alert>
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
