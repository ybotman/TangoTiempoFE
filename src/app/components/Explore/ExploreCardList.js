'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
import { colorFor, categoryLabel, continentColorFor } from './exploreConstants';

// TIEMPO-404 Milestone D.1: compact mobile cards with continent color stripe,
// infinite scroll via IntersectionObserver.

const PAGE_SIZE = 30;

function formatDateRange(start, end) {
  const s = dayjs(start);
  const e = dayjs(end);
  if (s.year() !== e.year()) {
    return `${s.format('MMM D, YYYY')} – ${e.format('MMM D, YYYY')}`;
  }
  if (s.month() === e.month() && s.date() !== e.date()) {
    return `${s.format('MMM D')}–${e.format('D')}`;
  }
  if (s.month() === e.month() && s.date() === e.date()) {
    return s.format('MMM D');
  }
  return `${s.format('MMM D')} – ${e.format('MMM D')}`;
}

export default function ExploreCardList({ events }) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef(null);

  const sorted = React.useMemo(
    () => [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [events]
  );

  // Reset visible count when the underlying filtered set changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sorted]);

  // Infinite scroll — observe the sentinel, bump visibleCount when in view
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    if (visibleCount >= sorted.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((n) => Math.min(n + PAGE_SIZE, sorted.length));
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visibleCount, sorted.length]);

  const shown = sorted.slice(0, visibleCount);

  return (
    <Box>
      <Stack spacing={0.75}>
        {shown.map((e) => {
          const stripeColor = continentColorFor(e.masteredCountryName);
          const categoryColor = colorFor(e.categoryFirst);
          const cat = categoryLabel(e.categoryFirst);
          return (
            <Paper
              key={e._id}
              elevation={1}
              onClick={() => router.push(`/event/${e._id}`)}
              sx={{
                display: 'flex',
                cursor: 'pointer',
                overflow: 'hidden',
                '&:active': { boxShadow: 3 },
              }}
            >
              <Box sx={{ width: 5, flexShrink: 0, background: stripeColor }} />
              <Box sx={{ p: 1, flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.25 }} noWrap>
                  {e.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                  {formatDateRange(e.startDate, e.endDate)}
                  {e.masteredCityName && ` · ${e.masteredCityName}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip
                    label={cat}
                    size="small"
                    sx={{ bgcolor: categoryColor, color: '#fff', fontSize: '0.65rem', height: 18 }}
                  />
                  {e.masteredCountryName && (
                    <Chip
                      label={e.masteredCountryName}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 18, borderColor: stripeColor, color: stripeColor }}
                    />
                  )}
                  {e.cost && (
                    <Chip
                      label={e.cost}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  )}
                  {e.isAiGenerated && (
                    <Chip
                      label="AI"
                      size="small"
                      title="AI-discovered event"
                      sx={{
                        fontSize: '0.6rem',
                        height: 18,
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Stack>
      <Box ref={sentinelRef} sx={{ height: 1 }} />
      {visibleCount < sorted.length && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          Loading more…
        </Typography>
      )}
    </Box>
  );
}

ExploreCardList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      categoryFirst: PropTypes.string,
      masteredCountryName: PropTypes.string,
      masteredCityName: PropTypes.string,
      cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      isAiGenerated: PropTypes.bool,
    })
  ).isRequired,
};
