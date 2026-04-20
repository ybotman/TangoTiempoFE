'use client';

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Box, Typography, Chip, Stack, Divider, Tooltip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RepeatIcon from '@mui/icons-material/Repeat';
import dayjs from 'dayjs';
import { firstInstanceInWindow } from '@/utils/nextInstance';

// TIEMPO-413: Organizer tab — grouped by ownerOrganizerName, all local
// events within mapcenter radius over 90-day window. Groups render as
// MUI Accordion, collapsed by default, sorted by event count descending
// (most active organizers first). Future: favorited organizers float to
// the top of the list — not in this scope.

const WINDOW_DAYS = 90;

function isAIish(e) {
  return Boolean(e?.isDiscovered || e?.isAiGenerated);
}

function groupKey(e) {
  return (
    e.ownerOrganizerID ||
    e.ownerOrganizerName ||
    e.ownerOrganizerShortName ||
    '__none__'
  );
}

function formatEventLine(displayDate, e) {
  const start = dayjs(displayDate);
  const date = start.format('ddd MMM D');
  const time = start.format('h:mm A');
  return { date, time, title: e.title };
}

export default function OrganizerGroupedList({ events }) {
  const router = useRouter();

  const groups = useMemo(() => {
    if (!events?.length) return [];
    const now = dayjs().startOf('day');
    const cutoff = dayjs().add(WINDOW_DAYS, 'day');
    const fromMs = now.valueOf();
    const toMs = cutoff.valueOf();

    // Recurring masters need next-instance expansion — a weekly milonga's
    // base startDate can be years old; rrule finds the next instance in
    // the 90-day window. Events with no hit in the window are dropped.
    const windowed = [];
    for (const e of events) {
      const nextDate = firstInstanceInWindow(e, fromMs, toMs);
      if (!nextDate) continue;
      windowed.push({ ...e, _displayDate: nextDate });
    }

    // Group by organizer
    const map = new Map();
    for (const e of windowed) {
      const k = groupKey(e);
      if (!map.has(k)) {
        const fullName = e.ownerOrganizerName || '';
        const shortName = e.ownerOrganizerShortName || '';
        const headerPrimary = fullName || shortName || 'Unknown organizer';
        const headerSecondary = shortName && fullName && fullName !== shortName ? shortName : null;
        map.set(k, {
          key: k,
          headerPrimary,
          headerSecondary,
          organizerId: e.ownerOrganizerID,
          events: [],
        });
      }
      map.get(k).events.push(e);
    }

    // Sort events within group chronologically (AI still de-emphasized to bottom)
    const byDisplayDate = (a, b) => {
      const aAI = isAIish(a) ? 1 : 0;
      const bAI = isAIish(b) ? 1 : 0;
      if (aAI !== bAI) return aAI - bAI;
      return a._displayDate.getTime() - b._displayDate.getTime();
    };

    // Sort groups by event count descending — most active first.
    // Tiebreak: alphabetical on headerPrimary.
    return Array.from(map.values())
      .map((g) => ({ ...g, events: [...g.events].sort(byDisplayDate) }))
      .sort((a, b) => {
        if (b.events.length !== a.events.length) return b.events.length - a.events.length;
        return a.headerPrimary.localeCompare(b.headerPrimary);
      });
  }, [events]);

  if (!groups.length) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        No events in the next {WINDOW_DAYS} days in this area.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75} sx={{ mt: 1 }}>
      {groups.map((g) => (
        <Accordion
          key={g.key}
          defaultExpanded={false}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px !important',
            overflow: 'hidden',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 1.5,
              py: 0.25,
              background: 'rgba(25,118,210,0.06)',
              '& .MuiAccordionSummary-content': { my: 0.75 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.headerPrimary}
                </Typography>
                {g.headerSecondary && (
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.25 }}>
                    {g.headerSecondary}
                  </Typography>
                )}
              </Box>
              <Chip
                label={g.events.length}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  fontWeight: 600,
                  bgcolor: 'rgba(25,118,210,0.12)',
                  color: '#1976d2',
                  flexShrink: 0,
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Stack divider={<Divider flexItem />}>
              {g.events.map((e) => {
                const ai = isAIish(e);
                const { date, time, title } = formatEventLine(e._displayDate, e);
                return (
                  <Box
                    key={e._id}
                    onClick={() => router.push(`/calendar?event=${e._id}`)}
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
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.4, fontWeight: 600, color: ai ? 'text.secondary' : 'text.primary' }}>
                        {date}
                        {e.isRepeating && (
                          <Tooltip title="Recurring series — next upcoming session shown" arrow>
                            <RepeatIcon sx={{ fontSize: 12, color: '#64748b' }} aria-label="recurring" />
                          </Tooltip>
                        )}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {time}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: ai ? 400 : 500,
                          color: ai ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                        {e.categoryFirst && (
                          <Chip
                            label={e.categoryFirst}
                            size="small"
                            sx={{
                              fontSize: '0.6rem',
                              height: 18,
                              bgcolor: ai ? '#f8fafc' : 'rgba(0,0,0,0.05)',
                              color: ai ? '#94a3b8' : '#475569',
                              border: '1px solid',
                              borderColor: ai ? '#e2e8f0' : 'rgba(0,0,0,0.08)',
                            }}
                          />
                        )}
                        {e.masteredCityName && (
                          <Chip
                            label={e.masteredCityName}
                            size="small"
                            sx={{
                              fontSize: '0.6rem',
                              height: 18,
                              bgcolor: ai ? '#f8fafc' : 'rgba(25,118,210,0.08)',
                              color: ai ? '#94a3b8' : '#1976d2',
                              border: '1px solid',
                              borderColor: ai ? '#e2e8f0' : 'rgba(25,118,210,0.2)',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
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
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}

OrganizerGroupedList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      ownerOrganizerName: PropTypes.string,
      ownerOrganizerShortName: PropTypes.string,
      ownerOrganizerID: PropTypes.string,
      masteredCityName: PropTypes.string,
      categoryFirst: PropTypes.string,
      isDiscovered: PropTypes.bool,
      isAiGenerated: PropTypes.bool,
    })
  ).isRequired,
};
