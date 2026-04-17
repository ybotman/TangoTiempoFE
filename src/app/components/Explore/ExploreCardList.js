'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
import { colorFor, categoryLabel } from './exploreConstants';

// TIEMPO-404 Milestone D: mobile card-list fallback for /explore.
// Used below ~700px where the scatter plot becomes illegible.
// Sorted chronologically — matches how travelers plan trips (by date).

function formatDateRange(start, end) {
  const s = dayjs(start);
  const e = dayjs(end);
  if (s.year() !== e.year()) {
    return `${s.format('MMM D, YYYY')} – ${e.format('MMM D, YYYY')}`;
  }
  if (s.month() === e.month() && s.date() !== e.date()) {
    return `${s.format('MMM D')}–${e.format('D, YYYY')}`;
  }
  if (s.month() === e.month() && s.date() === e.date()) {
    return s.format('MMM D, YYYY');
  }
  return `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`;
}

export default function ExploreCardList({ events }) {
  const router = useRouter();

  const sorted = React.useMemo(
    () => [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [events]
  );

  return (
    <Stack spacing={1.5}>
      {sorted.map((e) => {
        const color = colorFor(e.categoryFirst);
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
              '&:hover': { boxShadow: 3 },
            }}
          >
            {/* Colored category stripe */}
            <Box sx={{ width: 6, flexShrink: 0, background: color }} />
            <Box sx={{ p: 1.5, flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }} noWrap>
                {e.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.25 }}>
                {formatDateRange(e.startDate, e.endDate)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.25 }}>
                {[e.masteredCityName, e.masteredCountryName].filter(Boolean).join(', ')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                <Chip
                  label={cat}
                  size="small"
                  sx={{ bgcolor: color, color: '#fff', fontSize: '0.7rem', height: 20 }}
                />
                {e.cost && (
                  <Chip
                    label={e.cost}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Stack>
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
    })
  ).isRequired,
};
