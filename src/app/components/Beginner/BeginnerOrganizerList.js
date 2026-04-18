'use client';

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, Chip, Stack, Divider } from '@mui/material';
import dayjs from 'dayjs';

// TIEMPO-408 T2: Beginner tab grouped by organizer (see docs/BEGINNER-TAB-DESIGN.md §4).
// Organizer = section header; events listed chronologically below.
// Non-AI events render full-strength; AI-discovered events render de-emphasized
// AND sort below non-AI within each organizer group (matches Local's pattern).

const WINDOW_DAYS = 60;

function isAIish(e) {
  return Boolean(e?.isDiscovered || e?.isAiGenerated);
}

function eventSort(a, b) {
  const aAI = isAIish(a) ? 1 : 0;
  const bAI = isAIish(b) ? 1 : 0;
  if (aAI !== bAI) return aAI - bAI; // non-AI first
  return new Date(a.startDate) - new Date(b.startDate);
}

function groupKey(e) {
  return (
    e.ownerOrganizerID ||
    e.ownerOrganizerName ||
    e.ownerOrganizerShortName ||
    '__none__'
  );
}

function formatEventLine(e) {
  const start = dayjs(e.startDate);
  const date = start.format('ddd MMM D');
  const time = start.format('h:mm A');
  return { date, time, title: e.title };
}

export default function BeginnerOrganizerList({ events }) {
  const router = useRouter();

  const groups = useMemo(() => {
    if (!events?.length) return [];
    const cutoff = dayjs().add(WINDOW_DAYS, 'day');
    const now = dayjs().startOf('day');

    // Window filter: keep events from today through +60d
    const windowed = events.filter((e) => {
      const s = dayjs(e.startDate);
      return s.isAfter(now.subtract(1, 'day')) && s.isBefore(cutoff);
    });

    // Group by organizer, drop groups with zero upcoming events (already
    // filtered, but the bucket may be empty if all got filtered)
    const map = new Map();
    for (const e of windowed) {
      const k = groupKey(e);
      if (!map.has(k)) {
        map.set(k, {
          key: k,
          organizerName:
            e.ownerOrganizerName ||
            e.ownerOrganizerShortName ||
            'Unknown organizer',
          organizerShortName: e.ownerOrganizerShortName,
          organizerId: e.ownerOrganizerID,
          events: [],
        });
      }
      map.get(k).events.push(e);
    }

    // Sort events within group, then sort groups by soonest non-AI event date
    const arr = Array.from(map.values()).map((g) => {
      const sorted = [...g.events].sort(eventSort);
      const nonAiSoonest = sorted.find((e) => !isAIish(e)) || sorted[0];
      return { ...g, events: sorted, soonestMs: new Date(nonAiSoonest.startDate).getTime() };
    });
    arr.sort((a, b) => a.soonestMs - b.soonestMs);
    return arr;
  }, [events]);

  if (!groups.length) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        No beginner-friendly events in the next {WINDOW_DAYS} days.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ mt: 1 }}>
      {groups.map((g) => (
        <Paper key={g.key} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              background: 'rgba(25,118,210,0.06)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {g.organizerName}
            </Typography>
            {/* Contact line placeholder — phone/email land in follow-up once
                backend exposes them on the event response (see BEGINNER-TAB-DESIGN §7). */}
          </Box>
          <Stack divider={<Divider flexItem />}>
            {g.events.map((e) => {
              const ai = isAIish(e);
              const { date, time, title } = formatEventLine(e);
              return (
                <Box
                  key={e._id}
                  onClick={() => router.push(`/event/${e._id}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.85,
                    cursor: 'pointer',
                    opacity: ai ? 0.55 : 1,
                    background: ai ? 'rgba(0,0,0,0.015)' : 'transparent',
                    transition: 'background 120ms ease',
                    '&:hover': { background: 'rgba(25,118,210,0.04)' },
                  }}
                >
                  <Box sx={{ minWidth: 92, flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: ai ? 'text.secondary' : 'text.primary' }}>
                      {date}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {time}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: ai ? 400 : 500,
                      color: ai ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {title}
                  </Typography>
                  {ai && (
                    <Chip
                      label="AI"
                      size="small"
                      sx={{
                        fontSize: '0.58rem',
                        height: 16,
                        bgcolor: '#f1f5f9',
                        color: '#94a3b8',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                      title="AI-discovered event"
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

BeginnerOrganizerList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      ownerOrganizerName: PropTypes.string,
      ownerOrganizerShortName: PropTypes.string,
      ownerOrganizerID: PropTypes.string,
      isDiscovered: PropTypes.bool,
      isAiGenerated: PropTypes.bool,
    })
  ).isRequired,
};
