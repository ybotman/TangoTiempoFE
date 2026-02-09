// TIEMPO-360: Density Pill Group Component
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import DensityPill from './DensityPill';
import {
  PILL_COLORS,
  CATEGORY_COLORS,
  ALL_CATEGORIES,
  useHighLevelPills,
} from './densityConstants';

/**
 * Group of pills for a single location
 * - High-level (zoom <= city): 3 pills (Social, Events, Discovered)
 * - Venue-level (zoom > city): Full category breakdown
 */
const DensityPillGroup = ({
  data,
  zoom,
  locationName,
  onClick,
  size = 'medium',
}) => {
  const isHighLevel = useHighLevelPills(zoom);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        p: 0.5,
        borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        } : {},
      }}
    >
      {/* Pills row */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {isHighLevel ? (
          <HighLevelPills data={data} size={size} />
        ) : (
          <VenueLevelPills data={data} size={size} />
        )}
      </Box>

      {/* Location name (optional) */}
      {locationName && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.25,
            fontSize: '0.6rem',
            fontWeight: 500,
            color: 'text.secondary',
            maxWidth: 80,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {locationName}
        </Typography>
      )}
    </Box>
  );
};

/**
 * High-level 3-pill display: Social (Blue), Events (Purple), Discovered (Green)
 * Shows labels instead of counts
 */
const HighLevelPills = ({ data, size }) => {
  const { socialCount = 0, eventCount = 0, discoveredCount = 0 } = data;

  return (
    <>
      {socialCount > 0 && (
        <DensityPill
          count={1}
          label="Mil/Pra"
          color={PILL_COLORS.social}
          tooltip={`${socialCount} Milongas & Practicas`}
          size={size}
          showLabel={true}
          hideCount={true}
        />
      )}
      {eventCount > 0 && (
        <DensityPill
          count={1}
          label="Festival+"
          color={PILL_COLORS.events}
          tooltip={`${eventCount} Encuentros, Festivals, Marathons & Workshops`}
          size={size}
          showLabel={true}
          hideCount={true}
        />
      )}
      {discoveredCount > 0 && (
        <DensityPill
          count={1}
          label="BOT"
          color={PILL_COLORS.discovered}
          tooltip={`${discoveredCount} BOT-Curated Events`}
          size={size}
          showLabel={true}
          hideCount={true}
        />
      )}
    </>
  );
};

HighLevelPills.propTypes = {
  data: PropTypes.shape({
    socialCount: PropTypes.number,
    eventCount: PropTypes.number,
    discoveredCount: PropTypes.number,
  }).isRequired,
  size: PropTypes.string,
};

/**
 * Venue-level full category display
 */
const VenueLevelPills = ({ data, size }) => {
  const { categoryCounts = {} } = data;

  return (
    <>
      {ALL_CATEGORIES.map((category) => {
        const count = categoryCounts[category] || 0;
        if (count === 0) return null;

        return (
          <DensityPill
            key={category}
            count={count}
            color={CATEGORY_COLORS[category] || CATEGORY_COLORS.Unknown}
            tooltip={`${count} ${category}${count !== 1 ? 's' : ''}`}
            size={size === 'medium' ? 'small' : size}
          />
        );
      })}
    </>
  );
};

VenueLevelPills.propTypes = {
  data: PropTypes.shape({
    categoryCounts: PropTypes.object,
  }).isRequired,
  size: PropTypes.string,
};

DensityPillGroup.propTypes = {
  data: PropTypes.shape({
    socialCount: PropTypes.number,
    eventCount: PropTypes.number,
    discoveredCount: PropTypes.number,
    categoryCounts: PropTypes.object,
  }).isRequired,
  zoom: PropTypes.number.isRequired,
  locationName: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default DensityPillGroup;
