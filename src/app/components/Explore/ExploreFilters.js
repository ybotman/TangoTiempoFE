'use client';

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, Popper, Paper, ClickAwayListener, Grow, Grid } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PublicIcon from '@mui/icons-material/Public';
import { CATEGORY_COLORS, CONTINENT_COLORS, REGIONS } from './exploreConstants';

// TIEMPO-404 D.3: Popper-dropdown filter UX matching /calendar's PostFilter pattern.
// Two dropdowns — Category type + Region — replace the inline ButtonGroups.

const CATEGORY_PRESETS = ['Festival', 'Marathon', 'Encuentro', 'Workshop'];
const REGION_PRESETS = ['Americas', 'Europe', 'Asia-Pacific'];

function PresetOption({ children, selected, color, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 0.75,
        borderRadius: 1.5,
        cursor: 'pointer',
        textAlign: 'center',
        border: '1px solid',
        borderColor: selected && color ? 'transparent' : selected ? 'primary.main' : 'divider',
        backgroundColor: selected && color ? color : selected ? 'primary.main' : 'transparent',
        color: selected ? '#fff' : 'text.primary',
        fontSize: '0.75rem',
        fontWeight: selected ? 600 : 500,
        userSelect: 'none',
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          borderColor: color || 'primary.main',
        },
      }}
    >
      {children}
    </Box>
  );
}

PresetOption.propTypes = {
  children: PropTypes.node,
  selected: PropTypes.bool,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

function Dropdown({ icon: Icon, tooltip, active, children }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title={tooltip} arrow>
        <IconButton
          ref={anchorRef}
          onClick={() => setOpen((o) => !o)}
          sx={{ color: active ? 'primary.main' : 'action.active' }}
          size="small"
        >
          <Icon />
        </IconButton>
      </Tooltip>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" transition sx={{ zIndex: 1400 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={180}>
            <Paper
              elevation={3}
              sx={{
                mt: 1,
                p: 1.5,
                minWidth: 240,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Box>{children(() => setOpen(false))}</Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}

Dropdown.propTypes = {
  icon: PropTypes.elementType.isRequired,
  tooltip: PropTypes.string.isRequired,
  active: PropTypes.bool,
  children: PropTypes.func.isRequired,
};

// Detect which region preset, if any, matches the current country selection.
function detectActiveRegion(selectedCountries, availableCountries) {
  if (!selectedCountries || !availableCountries.length) return 'All';
  if (selectedCountries.length === availableCountries.length) return 'All';
  for (const [region, list] of Object.entries(REGIONS)) {
    const intersect = availableCountries.filter((c) => list.includes(c));
    if (intersect.length === 0) continue;
    const match = intersect.length === selectedCountries.length
      && intersect.every((c) => selectedCountries.includes(c));
    if (match) return region;
  }
  return null; // custom selection (e.g. from legacy cookie)
}

export default function ExploreFilters({
  category,
  onCategoryChange,
  availableCountries,
  selectedCountries,
  onCountriesChange,
}) {
  const activeRegion = detectActiveRegion(selectedCountries, availableCountries);

  const applyRegion = (preset) => {
    if (preset === 'All') {
      onCountriesChange([...availableCountries]);
      return;
    }
    const list = REGIONS[preset] || [];
    onCountriesChange(availableCountries.filter((c) => list.includes(c)));
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
      {/* Category type dropdown */}
      <Dropdown icon={LocalOfferIcon} tooltip="Event type" active={category !== null}>
        {(close) => (
          <Grid container spacing={0.75}>
            <Grid item xs={6}>
              <PresetOption selected={category === null} onClick={() => { onCategoryChange(null); close(); }}>
                All
              </PresetOption>
            </Grid>
            {CATEGORY_PRESETS.map((c) => (
              <Grid item xs={6} key={c}>
                <PresetOption
                  selected={category === c}
                  color={CATEGORY_COLORS[c]}
                  onClick={() => { onCategoryChange(c); close(); }}
                >
                  {c}
                </PresetOption>
              </Grid>
            ))}
          </Grid>
        )}
      </Dropdown>

      {/* Region dropdown */}
      <Dropdown icon={PublicIcon} tooltip="Region" active={activeRegion !== 'All' && activeRegion !== null}>
        {(close) => (
          <Grid container spacing={0.75}>
            <Grid item xs={6}>
              <PresetOption selected={activeRegion === 'All'} onClick={() => { applyRegion('All'); close(); }}>
                All
              </PresetOption>
            </Grid>
            {REGION_PRESETS.map((r) => (
              <Grid item xs={6} key={r}>
                <PresetOption
                  selected={activeRegion === r}
                  color={CONTINENT_COLORS[r]}
                  onClick={() => { applyRegion(r); close(); }}
                >
                  {r}
                </PresetOption>
              </Grid>
            ))}
          </Grid>
        )}
      </Dropdown>
    </Box>
  );
}

ExploreFilters.propTypes = {
  category: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCountriesChange: PropTypes.func.isRequired,
};
