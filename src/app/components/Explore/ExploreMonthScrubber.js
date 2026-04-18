'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import dayjs from 'dayjs';

// TIEMPO-408 item 6: rolling 12-month scrubber with paging arrows.
// - Default window: now → +12mo (offset 0)
// - << pages backward 6 months (floor at offset 0)
// - >> pages forward 6 months (cap at 30 months — max horizon ~3.5 years)
// - 'All' pill clears month-specific filter (keeps current window)
// - Month pill click filters to that specific month; re-click clears

const STEP = 6;      // months per << or >> click
const MAX_OFFSET = 30; // max forward offset
const WINDOW_MONTHS = 12;

export default function ExploreMonthScrubber({
  selectedMonthKey,
  onMonthChange,
  offsetMonths = 0,
  onOffsetChange,
}) {
  const months = React.useMemo(() => {
    const out = [];
    const base = dayjs().startOf('month').add(offsetMonths, 'month');
    for (let i = 0; i < WINDOW_MONTHS; i += 1) {
      const m = base.add(i, 'month');
      out.push({
        key: m.format('YYYY-MM'),
        short: m.format('MMM'),
        year: m.format('YY'),
        showYear: i === 0 || m.month() === 0,
      });
    }
    return out;
  }, [offsetMonths]);

  const handleMonthClick = (key) => {
    onMonthChange(selectedMonthKey === key ? null : key);
  };

  const canGoBack = offsetMonths > 0;
  const canGoForward = offsetMonths < MAX_OFFSET;

  const shift = (delta) => {
    const next = Math.max(0, Math.min(MAX_OFFSET, offsetMonths + delta));
    if (next !== offsetMonths) {
      onOffsetChange(next);
      // Clear month-specific filter when paging (the selected month often
      // falls out of the new window — avoid surprising empty states)
      if (selectedMonthKey) onMonthChange(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        overflowX: 'auto',
        px: 0.5,
        py: 0.75,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'rgba(0,0,0,0.015)',
      }}
    >
      <Tooltip title={canGoBack ? 'Earlier months' : 'At start of window'} arrow>
        <span>
          <IconButton
            size="small"
            onClick={() => shift(-STEP)}
            disabled={!canGoBack}
            aria-label="earlier months"
            sx={{ flexShrink: 0 }}
          >
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Pill
        selected={selectedMonthKey === null}
        onClick={() => onMonthChange(null)}
        primary="All"
        secondary={offsetMonths > 0 ? `+${offsetMonths}mo` : '12 mo'}
        wide
      />
      {months.map((m) => (
        <Pill
          key={m.key}
          selected={selectedMonthKey === m.key}
          onClick={() => handleMonthClick(m.key)}
          primary={m.short}
          secondary={m.showYear ? `'${m.year}` : null}
        />
      ))}

      <Tooltip title={canGoForward ? 'Later months' : 'At end of horizon'} arrow>
        <span>
          <IconButton
            size="small"
            onClick={() => shift(STEP)}
            disabled={!canGoForward}
            aria-label="later months"
            sx={{ flexShrink: 0 }}
          >
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
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
  selectedMonthKey: PropTypes.string,
  onMonthChange: PropTypes.func.isRequired,
  offsetMonths: PropTypes.number,
  onOffsetChange: PropTypes.func.isRequired,
};
