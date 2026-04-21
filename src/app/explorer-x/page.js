'use client';

// TIEMPO-419: Explorer-X — TEST-only research tool for inspecting the
// international event corpus. NOT to be promoted to PROD.
//
// Hostname gate is the belt-and-suspenders: even if the commit slips
// into a PROD bundle, the route renders null for any non-test host.
// Access: type /explorer-x into test.tangotiempo.com or localhost.
//
// Filters surface the raw + mastered fields side-by-side so the
// operator (Toby) can spot corpus-gap venues (null masteredCountryName)
// and see where discovery-lane metadata is sparse.

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, CircularProgress, Alert,
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Checkbox, FormControlLabel, Chip, Stack,
  Select, MenuItem, InputLabel, FormControl, Button,
} from '@mui/material';
import dayjs from 'dayjs';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const NULL_TOKEN = '__NULL__'; // sentinel for "no country" / "no city"

function useHostnameGate() {
  const [allowed, setAllowed] = useState(null); // null = deciding, true/false = decided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    const isTest = host.startsWith('test.') || host === 'localhost' || host === '127.0.0.1';
    setAllowed(isTest);
  }, []);
  return allowed;
}

function isUS(e) {
  const m = e.masteredCountryName;
  if (m === 'United States' || m === 'USA' || m === 'US') return true;
  return false;
}

export default function ExplorerXPage() {
  const allowed = useHostnameGate();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  // Filter state
  const [countryPick, setCountryPick] = useState(''); // '' = all, NULL_TOKEN = null-only, else exact match
  const [cityQuery, setCityQuery] = useState('');
  const [onlyTravelWorthy, setOnlyTravelWorthy] = useState(false);
  const [categoryPick, setCategoryPick] = useState(''); // '' = all

  useEffect(() => {
    if (allowed !== true) return;
    const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
    axios
      .get(`${getApiBaseUrl()}/api/events`, { params: { appId, limit: 1000 } })
      .then((res) => {
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        setEvents(list.filter((e) => !isUS(e)));
      })
      .catch((err) => setError(err.message || 'Failed to load events'));
  }, [allowed]);

  const availableCountries = useMemo(() => {
    if (!events) return [];
    const set = new Set();
    for (const e of events) set.add(e.masteredCountryName || NULL_TOKEN);
    return Array.from(set).sort();
  }, [events]);

  const availableCategories = useMemo(() => {
    if (!events) return [];
    return Array.from(new Set(events.map((e) => e.categoryFirst).filter(Boolean))).sort();
  }, [events]);

  const filtered = useMemo(() => {
    if (!events) return [];
    const cityNeedle = cityQuery.trim().toLowerCase();
    return events.filter((e) => {
      if (countryPick === NULL_TOKEN) {
        if (e.masteredCountryName) return false;
      } else if (countryPick) {
        if (e.masteredCountryName !== countryPick) return false;
      }
      if (cityNeedle) {
        const hit =
          (e.masteredCityName || '').toLowerCase().includes(cityNeedle) ||
          (e.venueCityName || '').toLowerCase().includes(cityNeedle) ||
          (e.venueName || '').toLowerCase().includes(cityNeedle);
        if (!hit) return false;
      }
      if (onlyTravelWorthy && !e.travelWorthy) return false;
      if (categoryPick && e.categoryFirst !== categoryPick) return false;
      return true;
    });
  }, [events, countryPick, cityQuery, onlyTravelWorthy, categoryPick]);

  const clearFilters = () => {
    setCountryPick('');
    setCityQuery('');
    setOnlyTravelWorthy(false);
    setCategoryPick('');
  };

  if (allowed === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (allowed === false) {
    return null; // belt-and-suspenders: silent on PROD
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Explorer-X
      </Typography>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
        TEST-only research view · non-US events (appId=1) · {filtered.length} shown
        {events && ` of ${events.length} total`}
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Country</InputLabel>
            <Select
              value={countryPick}
              label="Country"
              onChange={(e) => setCountryPick(e.target.value)}
            >
              <MenuItem value="">(all)</MenuItem>
              {availableCountries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c === NULL_TOKEN ? '(null — unmastered)' : c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="City search"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            sx={{ minWidth: 180 }}
            helperText="matches masteredCity, venueCity, venueName"
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryPick}
              label="Category"
              onChange={(e) => setCategoryPick(e.target.value)}
            >
              <MenuItem value="">(all)</MenuItem>
              {availableCategories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={onlyTravelWorthy}
                onChange={(e) => setOnlyTravelWorthy(e.target.checked)}
                size="small"
              />
            }
            label="travelWorthy only"
          />

          <Button size="small" onClick={clearFilters}>Clear</Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}
      {events === null && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {events && (
        <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>TW</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Start</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>End</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Venue city (raw)</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>masteredCity</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Venue ctry (raw)</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>masteredCountry</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700 }}>masteringStatus</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((e) => {
                const nullCountry = !e.masteredCountryName;
                return (
                  <TableRow key={e._id} hover sx={nullCountry ? { bgcolor: 'rgba(234, 88, 12, 0.06)' } : undefined}>
                    <TableCell sx={{ fontSize: '0.72rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.title}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem' }}>
                      {e.categoryFirst && (
                        <Chip
                          label={e.categoryFirst}
                          size="small"
                          sx={{ height: 16, fontSize: '0.62rem', bgcolor: 'rgba(0,0,0,0.06)' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem' }}>
                      {e.travelWorthy ? (
                        <Chip label="TW" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(34,197,94,0.18)', color: '#15803d', fontWeight: 700 }} />
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {e.startDate ? dayjs(e.startDate).format('YYYY-MM-DD') : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {e.endDate ? dayjs(e.endDate).format('YYYY-MM-DD') : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {e.venueCityName || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: e.masteredCityName ? 500 : 400, color: e.masteredCityName ? 'text.primary' : '#94a3b8', fontStyle: e.masteredCityName ? 'normal' : 'italic' }}>
                      {e.masteredCityName || '(null)'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {e.venueCountry || ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: e.masteredCountryName ? 500 : 400, color: e.masteredCountryName ? 'text.primary' : '#dc2626', fontStyle: e.masteredCountryName ? 'normal' : 'italic' }}>
                      {e.masteredCountryName || '(null)'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {e.masteringStatus || ''}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No events match current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
