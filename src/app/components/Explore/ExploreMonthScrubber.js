'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import dayjs from 'dayjs';

// TIEMPO-408 item 6: rolling 12-month scrubber. "All" + next 12 months
// starting from current. Clicking filters event set; re-click clears.

export default function ExploreMonthScrubber({ selectedMonthKey, onChange }) {
  const months = React.useMemo(() => {
    const out = [];
    const base = dayjs().startOf('month');
    for (let i = 0; i < 12; i += 1) {
      const m = base.add(i, 'month');
      out.push({
        key: m.format('YYYY-MM'),
        short: m.format('MMM'),
        year: m.format('YYYY'),
        showYear: i === 0 || m.month() === 0,
      });
    }
    return out;
  }, []);

  const handleClick = (key) => {
    onChange(selectedMonthKey === key ? null : key);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.4,
        overflowX: 'auto',
        px: 0.5,
        py: 0.75,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'rgba(0,0,0,0.015)',
      }}
    >
      <Pill
        selected={selectedMonthKey === null}
        onClick={() => onChange(null)}
        primary="All"
        secondary="12 mo"
        wide
      />
      {months.map((m) => (
        <Pill
          key={m.key}
          selected={selectedMonthKey === m.key}
          onClick={() => handleClick(m.key)}
          primary={m.short}
          secondary={m.showYear ? m.year : null}
        />
      ))}
    </Box>
  );
}

function Pill({ primary, secondary, selected, onClick, wide = false }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wide ? 56 : 44,
        height: 38,
        px: 0.75,
        borderRadius: 1.5,
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0,
        transition: 'all 150ms ease',
        background: selected ? '#3b82f6' : 'transparent',
        color: selected ? '#fff' : 'text.primary',
        border: '1px solid',
        borderColor: selected ? '#2563eb' : 'transparent',
        '&:hover': {
          background: selected ? '#3b82f6' : 'rgba(59,130,246,0.08)',
        },
      }}
    >
      <Box sx={{ fontSize: '0.78rem', fontWeight: selected ? 700 : 600, lineHeight: 1 }}>
        {primary}
      </Box>
      {secondary && (
        <Box sx={{ fontSize: '0.56rem', opacity: 0.8, mt: '2px', lineHeight: 1, letterSpacing: 0.2 }}>
          {secondary}
        </Box>
      )}
    </Box>
  );
}

ExploreMonthScrubber.propTypes = {
  selectedMonthKey: PropTypes.string, // 'YYYY-MM' or null for All
  onChange: PropTypes.func.isRequired,
};
