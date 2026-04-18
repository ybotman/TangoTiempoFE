'use client';

import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMode } from '@/hooks/useMode';

// TIEMPO-408: custom pill segmented control with sliding indicator.
// Mobile (<sm): hyper-compressed labels BEG / LOC / EXP so all three buttons
// fit on the row without crowding the brand + city pill.
// Desktop (>=sm): full labels.

const OPTIONS = [
  { value: 'beginner', label: 'Beginner', short: 'BEG' },
  { value: 'local',    label: 'Local',    short: 'LOC' },
  { value: 'explore',  label: 'Explore',  short: 'EXP' },
];

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const activeIdx = Math.max(0, OPTIONS.findIndex((o) => o.value === mode));
  const count = OPTIONS.length;

  return (
    <Box
      role="tablist"
      aria-label="display mode"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        p: '3px',
        borderRadius: 999,
        background: 'rgba(0, 0, 0, 0.06)',
        height: 34,
        minWidth: isMobile ? 168 : 260,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: 3,
          width: `calc((100% - 6px) / ${count})`,
          transform: `translateX(${activeIdx * 100}%)`,
          transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
          background: '#ffffff',
          borderRadius: 999,
          boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.06)',
          zIndex: 0,
        }}
      />
      {OPTIONS.map(({ value, label, short }, i) => {
        const selected = i === activeIdx;
        return (
          <Box
            key={value}
            role="tab"
            aria-selected={selected}
            aria-label={label}
            tabIndex={0}
            onClick={() => !selected && setMode(value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !selected) {
                e.preventDefault();
                setMode(value);
              }
            }}
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              minWidth: isMobile ? 52 : 80,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '0.72rem' : '0.82rem',
              fontWeight: selected ? 700 : 500,
              letterSpacing: isMobile ? 0.6 : 0.1,
              color: selected ? '#111' : 'rgba(0,0,0,0.62)',
              cursor: selected ? 'default' : 'pointer',
              userSelect: 'none',
              transition: 'color 180ms ease',
              '&:hover': { color: selected ? '#111' : 'rgba(0,0,0,0.82)' },
              outline: 'none',
              '&:focus-visible': {
                boxShadow: '0 0 0 2px rgba(25,118,210,.5)',
                borderRadius: 999,
              },
            }}
          >
            {isMobile ? short : label}
          </Box>
        );
      })}
    </Box>
  );
}
