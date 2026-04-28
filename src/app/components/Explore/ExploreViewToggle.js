'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

// TIEMPO-408 item 6: desktop toggle between the visx Gantt timeline and the
// new Leaflet world-map view.

export default function ExploreViewToggle({ view, onChange, showList = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ToggleButtonGroup
        size="small"
        value={view}
        exclusive
        onChange={(_e, next) => { if (next) onChange(next); }}
        sx={{
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            px: 1.25,
            py: 0.25,
            fontSize: '0.78rem',
            fontWeight: 600,
            gap: 0.5,
          },
        }}
      >
        {showList && (
          <Tooltip title="List view" arrow>
            <ToggleButton value="list" aria-label="list view">
              <FormatListBulletedIcon fontSize="small" />
              List
            </ToggleButton>
          </Tooltip>
        )}
        <Tooltip title="Timeline (Gantt)" arrow>
          <ToggleButton value="timeline" aria-label="timeline view">
            <TimelineIcon fontSize="small" />
            Timeline
          </ToggleButton>
        </Tooltip>
        <Tooltip title="World map" arrow>
          <ToggleButton value="map" aria-label="map view">
            <PublicIcon fontSize="small" />
            Map
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}

ExploreViewToggle.propTypes = {
  view: PropTypes.oneOf(['timeline', 'map', 'list']).isRequired,
  onChange: PropTypes.func.isRequired,
  showList: PropTypes.bool,
};
