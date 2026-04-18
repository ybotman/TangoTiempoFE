'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useMode } from '@/hooks/useMode';

// TIEMPO-408: custom pill segmented control — less MUI-default, more modern.
// Single rounded track, animated selected indicator, clean type.

const OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'local', label: 'Local' },
  { value: 'explore', label: 'Explore' },
];

export default function ModeToggle() {
  const { mode, setMode } = useMode();
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
        height: 36,
        minWidth: 260,
      }}
    >
      {/* Sliding selected indicator */}
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
      {OPTIONS.map(({ value, label }, i) => {
        const selected = i === activeIdx;
        return (
          <Box
            key={value}
            role="tab"
            aria-selected={selected}
            tabIndex={0}
            onClick={() => !selected && setMode(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!selected) setMode(value);
              }
            }}
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              minWidth: 80,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: selected ? 600 : 500,
              letterSpacing: 0.1,
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
            {label}
          </Box>
        );
      })}
    </Box>
  );
}
