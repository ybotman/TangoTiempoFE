'use client';

import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Alert } from '@mui/material';
import { useMode } from '@/hooks/useMode';

const OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'local', label: 'Local' },
  { value: 'explore', label: 'Explore' },
];

export default function ModeToggle() {
  const { mode, setMode } = useMode();

  const handleChange = (_event, newMode) => {
    if (newMode && newMode !== mode) setMode(newMode);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', my: 0.5 }}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleChange}
        size="small"
        color="primary"
        aria-label="display mode"
      >
        {OPTIONS.map(({ value, label }) => (
          <ToggleButton key={value} value={value} sx={{ px: 2, textTransform: 'none' }}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {mode === 'beginner' && (
        <Alert severity="info" sx={{ mt: 1, py: 0, fontSize: '0.8rem' }}>
          Beginner mode coming soon — showing Local calendar for now.
        </Alert>
      )}
    </Box>
  );
}
