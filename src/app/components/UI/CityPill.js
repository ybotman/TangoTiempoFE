'use client';

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// TIEMPO-408 T1: shared location affordance.
// Promotes the hidden MapCenter action to primary chrome — clickable pill
// displaying the current city and a caret to signal it's a picker.
// Used on /calendar and /beginner; /explore shows it inert (future: "jump
// to Local" affordance).

export default function CityPill() {
  const { locationDisplayText, openMapCenterModal, isLoading } = useGeoLocation();

  const label = isLoading ? 'Locating…' : (locationDisplayText || 'Select Location');

  return (
    <Tooltip title={`Change location — currently ${label}`} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Chip
          icon={<LocationOnIcon fontSize="small" />}
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <span>{label}</span>
              <ArrowDropDownIcon fontSize="small" sx={{ ml: -0.25 }} />
            </Box>
          }
          onClick={() => openMapCenterModal?.()}
          clickable
          size="small"
          sx={{
            height: 30,
            fontWeight: 500,
            fontSize: '0.8rem',
            pr: 0.25,
            '& .MuiChip-label': { pr: 0.25 },
            maxWidth: { xs: 180, sm: 240 },
          }}
          aria-label={`Change location, currently ${label}`}
        />
      </Box>
    </Tooltip>
  );
}
