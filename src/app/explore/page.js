'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, Container, CircularProgress, Alert, Paper, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SiteMenuBar from '@/components/UI/SiteMenuBar';
import ExploreTimeline from '@/components/Explore/ExploreTimeline';
import ExploreCardList from '@/components/Explore/ExploreCardList';
import ExploreFilters from '@/components/Explore/ExploreFilters';
import ExploreViewToggle from '@/components/Explore/ExploreViewToggle';
import ExploreMonthScrubber from '@/components/Explore/ExploreMonthScrubber';
import ExploreMap from '@/components/Explore/ExploreMap';
import DensityBar from '@/components/Explore/DensityBar';
import { categoryLabel } from '@/components/Explore/exploreConstants';
import { expandToNextInstance } from '@/utils/nextInstance';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import dayjs from 'dayjs';

// TIEMPO-408 Explore pass 2 (Toby guidance):
// - Categories filter: multi-select (Set)
// - Country filter: single-select (string | null)
// - AI-Found visual: made prominent in card/list and visx bars
// - Desktop fallback to card list when no country is resolved yet

const COOKIE_CATS = 'tt_explore_categories';
const COOKIE_COUNTRY = 'tt_explore_country';
const COOKIE_VIEW = 'tt_explore_view';

const readSetCookie = (name) => {
  if (typeof window === 'undefined') return null;
  const raw = Cookies.get(name);
  if (!raw) return null;
  try { const p = JSON.parse(raw); return Array.isArray(p) ? new Set(p) : null; }
  catch { return null; }
};

const writeSetCookie = (name, set) =>
  Cookies.set(name, JSON.stringify(Array.from(set)), { expires: 365, sameSite: 'Lax' });

export default function ExplorePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategoriesState] = useState(() => readSetCookie(COOKIE_CATS) || new Set());
  const [selectedCountry, setSelectedCountryState] = useState(() => {
    if (typeof window === 'undefined') return null;
    const raw = Cookies.get(COOKIE_COUNTRY);
    return raw || null;
  });
  const [selectedMonthKey, setSelectedMonthKey] = useState(null); // 'YYYY-MM' or null = all in window
  const [offsetMonths, setOffsetMonths] = useState(0); // <<>> page offset, multiples of 6
  const [view, setViewState] = useState(() => {
    if (typeof window === 'undefined') return 'timeline';
    return Cookies.get(COOKIE_VIEW) === 'map' ? 'map' : 'timeline';
  });
  const [xInfo, setXInfo] = useState(null);

  const setView = useCallback((next) => {
    setViewState(next);
    Cookies.set(COOKIE_VIEW, next, { expires: 365, sameSite: 'Lax' });
  }, []);

  const setSelectedCategories = useCallback((next) => {
    setSelectedCategoriesState(next);
    writeSetCookie(COOKIE_CATS, next);
  }, []);

  const setSelectedCountry = useCallback((next) => {
    setSelectedCountryState(next);
    if (next === null) Cookies.remove(COOKIE_COUNTRY);
    else Cookies.set(COOKIE_COUNTRY, next, { expires: 365, sameSite: 'Lax' });
  }, []);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    axios
      .get(`${getApiBaseUrl()}/api/events`, {
        params: { travelWorthy: true, appId, limit: 500 },
      })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        setEvents(list);
      })
      .catch((err) => setError(err.message || 'Failed to load events'));
  }, []);

  const availableCountries = useMemo(() => {
    if (!events) return [];
    return Array.from(new Set(events.map((e) => e.masteredCountryName).filter(Boolean))).sort();
  }, [events]);

  // If selectedCountry is no longer in the available set, clear it
  useEffect(() => {
    if (selectedCountry && events && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry(null);
    }
  }, [events, availableCountries, selectedCountry, setSelectedCountry]);

  // 12-month rolling window anchored to offsetMonths from today. Arrows on
  // the scrubber shift this window forward/backward by 6-month increments.
  const { windowStart, windowEnd } = useMemo(() => {
    const ws = dayjs().startOf('day').add(offsetMonths, 'month');
    const we = ws.add(12, 'month').endOf('day');
    return { windowStart: ws, windowEnd: we };
  }, [offsetMonths]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const fromMs = windowStart.valueOf();
    const toMs = windowEnd.valueOf();
    const out = [];
    for (const e of events) {
      // TIEMPO-408 refinement #2: expand recurring masters to their next
      // in-window instance. Non-recurring pass through if in window. Expired
      // / malformed recurrence → dropped.
      const display = expandToNextInstance(e, fromMs, toMs);
      if (!display) continue;

      if (selectedCountry && display.masteredCountryName !== selectedCountry) continue;
      if (selectedCategories.size > 0 && !selectedCategories.has(categoryLabel(display.categoryFirst))) continue;

      if (selectedMonthKey) {
        const mStart = dayjs(`${selectedMonthKey}-01`).startOf('month');
        const mEnd = mStart.endOf('month');
        const s = dayjs(display.startDate);
        const en = dayjs(display.endDate);
        if (en.isBefore(mStart) || s.isAfter(mEnd)) continue;
      }
      out.push(display);
    }
    return out;
  }, [events, selectedCountry, selectedCategories, selectedMonthKey, windowStart, windowEnd]);

  // Visx timeline needs country rows — derive from filtered set
  const sortedActiveCountries = useMemo(
    () => Array.from(new Set(filteredEvents.map((e) => e.masteredCountryName).filter(Boolean))).sort(),
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
        {events === null && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">Failed to load events: {error}</Alert>}
        {events && events.length === 0 && (
          <Alert severity="info">No travel-worthy events found yet.</Alert>
        )}

        {events && events.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <ExploreFilters
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                availableCountries={availableCountries}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
              {!isMobile && <ExploreViewToggle view={view} onChange={setView} />}
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <ExploreMonthScrubber
                selectedMonthKey={selectedMonthKey}
                onMonthChange={setSelectedMonthKey}
                offsetMonths={offsetMonths}
                onOffsetChange={setOffsetMonths}
              />
            </Box>

            {isMobile ? (
              <ExploreCardList events={filteredEvents} />
            ) : availableCountries.length === 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Country data is still catching up — showing event list.
                </Alert>
                <ExploreCardList events={filteredEvents} />
              </>
            ) : view === 'map' ? (
              <ExploreMap events={filteredEvents} />
            ) : filteredEvents.length === 0 ? (
              <Alert severity="info">No events match the current filter. Try relaxing category, country, or month.</Alert>
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
