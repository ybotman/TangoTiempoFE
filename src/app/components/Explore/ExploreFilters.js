'use client';

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, Popper, Paper, ClickAwayListener, Grow, Checkbox } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PublicIcon from '@mui/icons-material/Public';
import { CATEGORY_COLORS, continentColorFor } from './exploreConstants';

// TIEMPO-408 pass 2: Left filter = Category multi-select. Right filter = Country.
// TIEMPO-416: Country is now multi-select too, symmetric with Category.

const CATEGORY_PRESETS = ['Festival', 'Marathon', 'Encuentro', 'Workshop'];

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
                p: 1.25,
                minWidth: 220,
                maxHeight: 360,
                overflowY: 'auto',
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

function Row({ onClick, selected, color, children }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.5,
        py: 0.25,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': { background: 'rgba(0,0,0,0.04)' },
      }}
    >
      <Checkbox checked={selected} size="small" sx={{ p: 0.5 }} />
      {color && (
        <Box sx={{ width: 10, height: 10, borderRadius: '2px', background: color, flexShrink: 0 }} />
      )}
      <Box sx={{ fontSize: '0.82rem', fontWeight: selected ? 600 : 400 }}>
        {children}
      </Box>
    </Box>
  );
}

Row.propTypes = {
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.node,
};

export default function ExploreFilters({
  selectedCategories,
  onCategoriesChange,
  availableCountries,
  selectedCountries,
  onCountriesChange,
}) {
  const catCount = selectedCategories.size;
  const catActive = catCount > 0;
  const countryCount = selectedCountries.size;
  const countryActive = countryCount > 0;

  const toggleCategory = (c) => {
    const next = new Set(selectedCategories);
    if (next.has(c)) next.delete(c); else next.add(c);
    onCategoriesChange(next);
  };

  const toggleCountry = (c) => {
    const next = new Set(selectedCountries);
    if (next.has(c)) next.delete(c); else next.add(c);
    onCountriesChange(next);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
      <Dropdown icon={LocalOfferIcon} tooltip={catActive ? `${catCount} categor${catCount === 1 ? 'y' : 'ies'} selected` : 'Categories'} active={catActive}>
        {() => (
          <>
            <Row onClick={() => onCategoriesChange(new Set())} selected={!catActive}>All categories</Row>
            {CATEGORY_PRESETS.map((c) => (
              <Row
                key={c}
                selected={selectedCategories.has(c)}
                color={CATEGORY_COLORS[c]}
                onClick={() => toggleCategory(c)}
              >
                {c}
              </Row>
            ))}
          </>
        )}
      </Dropdown>

      <Dropdown icon={PublicIcon} tooltip={countryActive ? `${countryCount} countr${countryCount === 1 ? 'y' : 'ies'} selected` : 'Country'} active={countryActive}>
        {() => (
          <>
            <Row
              selected={!countryActive}
              onClick={() => onCountriesChange(new Set())}
            >
              All countries
            </Row>
            {availableCountries.map((c) => (
              <Row
                key={c}
                selected={selectedCountries.has(c)}
                color={continentColorFor(c)}
                onClick={() => toggleCountry(c)}
              >
                {c}
              </Row>
            ))}
          </>
        )}
      </Dropdown>

      {/* Active-chip summary to reinforce current filter state (desktop+mobile) */}
      {(catActive || countryActive) && (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {catActive && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, flexWrap: 'wrap' }}>
              {Array.from(selectedCategories).map((c) => (
                <Box
                  key={c}
                  sx={{
                    px: 0.75, py: 0.15, borderRadius: 999,
                    bgcolor: CATEGORY_COLORS[c] || '#6b7280',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                >
                  {c}
                </Box>
              ))}
            </Box>
          )}
          {countryActive && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, flexWrap: 'wrap' }}>
              {Array.from(selectedCountries).map((c) => (
                <Box
                  key={c}
                  sx={{
                    px: 0.75, py: 0.15, borderRadius: 999,
                    border: '1px solid',
                    borderColor: continentColorFor(c),
                    color: continentColorFor(c),
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                >
                  {c}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

ExploreFilters.propTypes = {
  selectedCategories: PropTypes.instanceOf(Set).isRequired,
  onCategoriesChange: PropTypes.func.isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCountries: PropTypes.instanceOf(Set).isRequired,
  onCountriesChange: PropTypes.func.isRequired,
};
