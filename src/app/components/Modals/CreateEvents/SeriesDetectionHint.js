'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

// TIEMPO-409 (SAS-FTPNTD Layer 2): detect when an organizer is publishing
// the same class as individual events week-after-week and suggest they use
// the recurring option instead.
//
// Heuristic: fetch recent events for the current ownerOrganizerID. Match
// against the current in-progress title by 3+ overlapping normalized tokens.
// If ≥2 non-recurring matches found in the last 30 days, surface an inline
// hint. Non-blocking. No auto-apply.

const LOOKBACK_DAYS = 30;
const MATCH_TOKEN_THRESHOLD = 3;
const HINT_TRIGGER_COUNT = 2;
const DEBOUNCE_MS = 700;
const MIN_TITLE_LEN = 8;

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3); // drop short tokens ('a', 'of', 'de')
}

export default function SeriesDetectionHint({ eventData }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    setSimilar([]);
    const title = eventData?.title || '';
    const orgId = eventData?.ownerOrganizerID;
    const isRepeating = Boolean(eventData?.isRepeating);
    const selfId = eventData?._id;

    if (isRepeating) return () => {}; // already recurring
    if (title.trim().length < MIN_TITLE_LEN) return () => {};
    if (!orgId) return () => {};

    const currentTokens = new Set(normalize(title));
    if (currentTokens.size < MATCH_TOKEN_THRESHOLD) return () => {};

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';
        const res = await axios.get(`${getApiBaseUrl()}/api/events`, {
          params: { ownerOrganizerID: orgId, appId, limit: 100 },
        });
        if (cancelled) return;
        const list = res.data?.events || (Array.isArray(res.data) ? res.data : []);
        const cutoff = dayjs().subtract(LOOKBACK_DAYS, 'day');
        const matches = list.filter((e) => {
          if (e.isRepeating) return false;
          if (e._id && e._id === selfId) return false;
          if (!dayjs(e.startDate).isAfter(cutoff)) return false;
          const otherTokens = new Set(normalize(e.title));
          let overlap = 0;
          for (const t of otherTokens) if (currentTokens.has(t)) overlap += 1;
          return overlap >= MATCH_TOKEN_THRESHOLD;
        });
        setSimilar(matches);
      } catch {
        // Silent — the hint is best-effort; don't disrupt event creation.
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [eventData?.title, eventData?.ownerOrganizerID, eventData?.isRepeating, eventData?._id]);

  if (similar.length < HINT_TRIGGER_COUNT) return null;

  const examples = similar.slice(0, 3).map((e) => e.title).join(', ');
  const orgName = eventData?.ownerOrganizerName || 'This organizer';

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>Looks like a recurring series?</AlertTitle>
      <Typography variant="body2" sx={{ mb: 0.75 }}>
        {orgName} has <strong>{similar.length} similar event{similar.length === 1 ? '' : 's'}</strong> in
        the last {LOOKBACK_DAYS} days matching this title.
      </Typography>
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
        e.g. {examples}{similar.length > 3 ? ', …' : ''}
      </Typography>
      <Typography variant="body2">
        <strong>Tip:</strong> toggle this event to <em>recurring</em> to publish the series once instead
        of week by week. Saves time + keeps your Beginner-tab visibility stable.
      </Typography>
    </Alert>
  );
}

SeriesDetectionHint.propTypes = {
  eventData: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    ownerOrganizerID: PropTypes.string,
    ownerOrganizerName: PropTypes.string,
    isRepeating: PropTypes.bool,
  }).isRequired,
};
