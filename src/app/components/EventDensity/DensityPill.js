// TIEMPO-360: Single Density Pill Component
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Tooltip } from '@mui/material';

/**
 * Single pill showing count with color
 * Used both in 3-pill high-level and full category venue-level displays
 */
const DensityPill = ({
  count,
  color,
  label,
  tooltip,
  size = 'medium',
  showLabel = false,
}) => {
  if (count === 0) return null;

  const sizes = {
    small: { height: 18, fontSize: '0.65rem', px: 0.75, minWidth: 24 },
    medium: { height: 22, fontSize: '0.75rem', px: 1, minWidth: 28 },
    large: { height: 26, fontSize: '0.85rem', px: 1.25, minWidth: 32 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const pillContent = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: getContrastColor(color),
        borderRadius: '12px',
        height: sizeConfig.height,
        minWidth: sizeConfig.minWidth,
        px: sizeConfig.px,
        fontWeight: 600,
        fontSize: sizeConfig.fontSize,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        cursor: 'default',
        transition: 'transform 0.15s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 1,
        }}
      >
        {formatCount(count)}
      </Typography>
      {showLabel && label && (
        <Typography
          component="span"
          sx={{
            fontSize: '0.6rem',
            fontWeight: 500,
            ml: 0.5,
            opacity: 0.9,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top" enterDelay={300}>
        {pillContent}
      </Tooltip>
    );
  }

  return pillContent;
};

/**
 * Get contrasting text color for pill background
 */
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Format large counts (e.g., 1500 → 1.5k)
 */
function formatCount(count) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

DensityPill.propTypes = {
  count: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string,
  tooltip: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
};

export default DensityPill;
