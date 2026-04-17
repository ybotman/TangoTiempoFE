'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, ButtonGroup } from '@mui/material';

// TIEMPO-404 D.2: category preset filter. Shared by desktop + mobile.
// "All" = no category filter. Others narrow to that single category.

const PRESETS = ['Festival', 'Marathon', 'Encuentro', 'Workshop', 'All'];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <Box sx={{ mb: 1 }}>
      <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <Button
            key={p}
            onClick={() => onChange(p === 'All' ? null : p)}
            variant={(p === 'All' && selected === null) || selected === p ? 'contained' : 'outlined'}
          >
            {p}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}

CategoryFilter.propTypes = {
  selected: PropTypes.string, // category name or null for "All"
  onChange: PropTypes.func.isRequired,
};
