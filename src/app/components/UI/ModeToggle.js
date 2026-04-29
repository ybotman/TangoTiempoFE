'use client';

import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMode } from '@/hooks/useMode';

// TIEMPO-408: custom pill segmented control with sliding indicator.
// TIEMPO-413: 4-wide — order is LOCAL -> ORG -> EXPLORE -> BEGINNER.
// Each mode has its own color; selected state uses the color prominently.
// Mobile: bigger abbreviation + tiny full-word caption below.
// Desktop: full label only.

const OPTIONS = [
  { value: 'local',     label: 'Local',     short: 'LOC', color: '#3b82f6' }, // blue — home/familiar
  { value: 'organizer', label: 'Organizer', short: 'ORG', color: '#8b5cf6' }, // purple — community/who
  { value: 'explore',   label: 'Explore',   short: 'EXP', color: '#f59e0b' }, // amber — travel/adventure
  { value: 'beginner',  label: 'Beginner',  short: 'BEG', color: '#22c55e' }, // green — welcoming
];

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const rawIdx = OPTIONS.findIndex((o) => o.value === mode);
  const hasActive = rawIdx >= 0;
  const activeIdx = hasActive ? rawIdx : 0;
  const count = OPTIONS.length;
  const activeColor = OPTIONS[activeIdx]?.color || '#3b82f6';

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
        height: isMobile ? 44 : 34,
        minWidth: isMobile ? 200 : 340,
      }}
    >
      {/* Sliding white pill. Hidden when no tab is active (non-mode route). */}
      {hasActive && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 3,
            bottom: 3,
            left: 3,
            width: `calc((100% - 6px) / ${count})`,
            transform: `translateX(${activeIdx * 100}%)`,
            transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease',
            background: '#ffffff',
            borderRadius: 999,
            boxShadow: `0 1px 2px rgba(0,0,0,.08), 0 0 0 2px ${activeColor}`,
            zIndex: 0,
          }}
        />
      )}
      {OPTIONS.map(({ value, label, short, color }, i) => {
        const selected = hasActive && i === activeIdx;
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
              minWidth: isMobile ? 54 : 78,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? 0 : 0,
              cursor: selected ? 'default' : 'pointer',
              userSelect: 'none',
              color: selected ? color : `${color}99`, // 60% alpha when unselected
              transition: 'color 180ms ease, font-weight 180ms ease',
              '&:hover': { color: selected ? color : color },
              outline: 'none',
              '&:focus-visible': {
                boxShadow: '0 0 0 2px rgba(25,118,210,.5)',
                borderRadius: 999,
              },
            }}
          >
            {isMobile ? (
              <>
                <Box sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  lineHeight: 1,
                }}>
                  {short}
                </Box>
                <Box sx={{
                  fontSize: '0.55rem',
                  fontWeight: selected ? 600 : 400,
                  letterSpacing: 0.3,
                  opacity: 0.9,
                  mt: '2px',
                  lineHeight: 1,
                }}>
                  {label}
                </Box>
              </>
            ) : (
              <Box sx={{
                fontSize: '0.82rem',
                fontWeight: selected ? 700 : 500,
                letterSpacing: 0.2,
              }}>
                {label}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
