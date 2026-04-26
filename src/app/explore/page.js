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
import { categoryLabel, regionFor, VALID_EXPLORE_CATEGORIES } from '@/components/Explore/exploreConstants';
import { expandToNextInstance } from '@/utils/nextInstance';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import dayjs from 'dayjs';

// TIEMPO-408 Explore pass 2 (Toby guidance):
// - Categories filter: multi-select (Set)
// - Region filter: multi-select (Set) — continent/region grouping replaces country filter
// - AI-Found visual: made prominent in card/list and visx bars
// - Desktop fallback to card list when no country is resolved yet

const COOKIE_CATS = 'tt_explore_categories';
const COOKIE_REGIONS = 'tt_explore_regions';
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
  const [selectedRegions, setSelectedRegionsState] = useState(() => readSetCookie(COOKIE_REGIONS) || new Set());
  const [selectedMonthKey, setSelectedMonthKey] = useState(null); // 'YYYY-MM' or null = all in window
  const [offsetMonths, setOffsetMonths] = useState(0); // <<>> page offset, multiples of 6
  const [view, setViewState] = useState(() => {
    if (typeof window === 'undefined') return 'mobile-default';
    const saved = Cookies.get(COOKIE_VIEW);
    if (saved === 'map') return 'map';
    if (saved === 'list') return 'list';
    if (saved === 'timeline') return 'timeline';
    return 'mobile-default';
  });
  const effectiveView = view === 'mobile-default'
    ? (isMobile ? 'list' : 'timeline')
    : view;
  const [xInfo, setXInfo] = useState(null);

  const setView = useCallback((next) => {
    setViewState(next);
    Cookies.set(COOKIE_VIEW, next, { expires: 365, sameSite: 'Lax' });
  }, []);

  // TIEMPO-426: When a month is chosen, only auto-switch to timeline if the
  // user is on a view that doesn't render time-axis filtering meaningfully
  // (mobile-default or list). Map and timeline views both filter by
  // selectedMonthKey, so don't yank the user away from map.
  const handleMonthChange = useCallback((mk) => {
    setSelectedMonthKey(mk);
    if (mk && view !== 'map' && view !== 'timeline') setView('timeline');
  }, [setView, view]);

  const setSelectedCategories = useCallback((next) => {
    setSelectedCategoriesState(next);
    writeSetCookie(COOKIE_CATS, next);
  }, []);

  const setSelectedRegions = useCallback((next) => {
    setSelectedRegionsState(next);
    writeSetCookie(COOKIE_REGIONS, next);
  }, []);

  const availableRegions = useMemo(() => {
    if (!events) return [];
    return Array.from(new Set(events.map((e) => regionFor(e.masteredCountryName)).filter(Boolean))).sort();
  }, [events]);

  const availableCategories = useMemo(() => {
    if (!events) return [];
    return Array.from(new Set(events.map((e) => categoryLabel(e.categoryFirst)).filter(Boolean))).sort();
  }, [events]);

  // Drop any selected region that's no longer in the available set
  useEffect(() => {
    if (!events || selectedRegions.size === 0) return;
    const pruned = new Set(Array.from(selectedRegions).filter((r) => availableRegions.includes(r)));
    if (pruned.size !== selectedRegions.size) setSelectedRegions(pruned);
  }, [events, availableRegions, selectedRegions, setSelectedRegions]);

  // 12-month rolling window anchored to offsetMonths from today. Arrows on
  // the scrubber shift this window forward/backward by 6-month increments.
  const { windowStart, windowEnd } = useMemo(() => {
    const ws = dayjs().startOf('day').add(offsetMonths, 'month');
    const we = ws.add(12, 'month').endOf('day');
    return { windowStart: ws, windowEnd: we };
  }, [offsetMonths]);

  // TIEMPO-426: Fetch only the visible 12-month window instead of all
  // travel-worthy events forever. Refetch when the window changes.
  // TIEMPO-434: BE caps travelWorthy responses at 100 per page (CALBEAF-132
  // scrape-guard). The window often holds 200-300 TW events, so we
  // paginate through until exhausted (capped at MAX_PAGES for safety).
  // Without this, June+ events get truncated due to startDate ASC sort.
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    const start = windowStart.format('YYYY-MM-DD');
    const end = windowEnd.format('YYYY-MM-DD');
    const PAGE_LIMIT = 100; // BE caps TW at 100 per request
    const MAX_PAGES = 20;   // safety: 20 × 100 = 2000 events
    let cancelled = false;

    (async () => {
      try {
        const accumulated = [];
        let page = 1;
        let totalPages = 1;
        while (page <= totalPages && page <= MAX_PAGES) {
          const res = await axios.get(`${getApiBaseUrl()}/api/events`, {
            params: { travelWorthy: true, appId, start, end, limit: PAGE_LIMIT, page },
          });
          if (cancelled) return;
          const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
          accumulated.push(...list);
          totalPages = res.data?.pagination?.pages || 1;
          if (list.length === 0) break;
          page += 1;
        }
        if (cancelled) return;
        // TIEMPO-427: Drop events whose categoryFirst falls outside the
        // explore whitelist (SEMINAR / UNKNOWN / Trip etc.) — noise.
        const cleaned = accumulated.filter((e) => VALID_EXPLORE_CATEGORIES.has(categoryLabel(e.categoryFirst)));
        setEvents(cleaned);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load events');
      }
    })();

    return () => { cancelled = true; };
  }, [windowStart, windowEnd]);

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

      if (selectedRegions.size > 0 && !selectedRegions.has(regionFor(display.masteredCountryName))) continue;
      if (selectedCategories.size > 0 && !selectedCategories.has(categoryLabel(display.categoryFirst))) continue;

      if (selectedMonthKey) {
        // 11-day buffer on each side so events crossing the month boundary are visible
        const mStart = dayjs(`${selectedMonthKey}-01`).startOf('month').subtract(11, 'day');
        const mEnd = dayjs(`${selectedMonthKey}-01`).endOf('month').add(11, 'day');
        const s = dayjs(display.startDate);
        const en = dayjs(display.endDate);
        if (en.isBefore(mStart) || s.isAfter(mEnd)) continue;
      }
      out.push(display);
    }
    return out;
  }, [events, selectedRegions, selectedCategories, selectedMonthKey, windowStart, windowEnd]);

  // Visx timeline needs country rows — derive from filtered set
  const sortedActiveCountries = useMemo(
    () => Array.from(new Set(filteredEvents.map((e) => e.masteredCountryName).filter(Boolean))).sort(),
    [filteredEvents]
  );

  const dateRange = useMemo(() => {
    // When a month is selected, pin the window to that month ± 11 days so the
    // X-axis is predictable regardless of which events happen to be in the set.
    if (selectedMonthKey) {
      const mStart = dayjs(`${selectedMonthKey}-01`).startOf('month');
      return [
        mStart.subtract(11, 'day').toDate(),
        mStart.endOf('month').add(11, 'day').toDate(),
      ];
    }
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
  }, [filteredEvents, selectedMonthKey]);

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
                availableCategories={availableCategories}
                availableRegions={availableRegions}
                selectedRegions={selectedRegions}
                onRegionsChange={setSelectedRegions}
              />
              <ExploreViewToggle view={effectiveView} onChange={setView} showList />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <ExploreMonthScrubber
                selectedMonthKey={selectedMonthKey}
                onMonthChange={handleMonthChange}
                offsetMonths={offsetMonths}
                onOffsetChange={setOffsetMonths}
              />
            </Box>

            {isMobile ? (
              effectiveView === 'map' ? (
                <ExploreMap events={filteredEvents} />
              ) : effectiveView === 'timeline' ? (
                <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                  <ExploreTimeline
                    events={filteredEvents}
                    countries={sortedActiveCountries}
                    dateRange={dateRange}
                    onXScaleReady={setXInfo}
                    selectedMonthKey={selectedMonthKey}
                    onMonthChange={handleMonthChange}
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
              ) : (
                <ExploreCardList events={filteredEvents} />
              )
            ) : availableRegions.length === 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Country data is still catching up — showing event list.
                </Alert>
                <ExploreCardList events={filteredEvents} />
              </>
            ) : effectiveView === 'map' ? (
              <ExploreMap events={filteredEvents} />
            ) : effectiveView === 'list' ? (
              <ExploreCardList events={filteredEvents} />
            ) : filteredEvents.length === 0 ? (
              <Alert severity="info">No events match the current filter. Try relaxing category, country, or month.</Alert>
            ) : (
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <ExploreTimeline
                  events={filteredEvents}
                  countries={sortedActiveCountries}
                  dateRange={dateRange}
                  onXScaleReady={setXInfo}
                  selectedMonthKey={selectedMonthKey}
                  onMonthChange={handleMonthChange}
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
