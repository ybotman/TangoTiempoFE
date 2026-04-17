'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, ButtonGroup, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { REGIONS, regionFor } from './exploreConstants';

// TIEMPO-404 Milestone B: region presets + per-country checkboxes.
// Selection state lives in parent (ExplorePage) so filtered events
// can flow to both the timeline and the density bar.

export default function CountryFilter({ availableCountries, selected, onChange }) {
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const handleToggle = (country) => {
    const next = new Set(selectedSet);
    if (next.has(country)) next.delete(country);
    else next.add(country);
    onChange(Array.from(next));
  };

  const applyPreset = (preset) => {
    if (preset === 'All') {
      onChange([...availableCountries]);
      return;
    }
    const regionCountries = REGIONS[preset] || [];
    const intersection = availableCountries.filter((c) => regionCountries.includes(c));
    onChange(intersection);
  };

  // Group available countries by region for display
  const grouped = React.useMemo(() => {
    const g = { Americas: [], Europe: [], 'Asia-Pacific': [], Other: [] };
    availableCountries.forEach((c) => {
      g[regionFor(c)].push(c);
    });
    return g;
  }, [availableCountries]);

  return (
    <Box sx={{ mb: 2 }}>
      <ButtonGroup size="small" variant="outlined" sx={{ mb: 1 }}>
        {['Americas', 'Europe', 'Asia-Pacific', 'All'].map((preset) => (
          <Button key={preset} onClick={() => applyPreset(preset)}>
            {preset}
          </Button>
        ))}
      </ButtonGroup>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {Object.entries(grouped).map(([region, list]) => {
          if (list.length === 0) return null;
          return (
            <Box key={region} sx={{ minWidth: 180 }}>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                {region}
              </Typography>
              <FormGroup>
                {list.map((country) => (
                  <FormControlLabel
                    key={country}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedSet.has(country)}
                        onChange={() => handleToggle(country)}
                      />
                    }
                    label={<Typography variant="body2">{country}</Typography>}
                    sx={{ my: -0.5 }}
                  />
                ))}
              </FormGroup>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

CountryFilter.propTypes = {
  availableCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
