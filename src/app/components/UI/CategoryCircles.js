// CategoryCircles.js - Display three category circles for events
import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Box } from '@mui/material';
import { categoryColors } from '@/utils/categoryColors';

const CategoryCircles = ({ eventProps }) => {
  if (!eventProps) return null;

  const {
    categoryFirst,
    categorySecond,
    categoryThird
  } = eventProps;

  // Helper function to get circle style
  const getCircleStyle = (category, isPrimary = false) => {
    const color = category ? (categoryColors[category] || categoryColors.Unknown) : 'transparent';
    const size = isPrimary ? 8 : 6;
    const opacity = category ? 1 : 0; // Invisible if no category
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      opacity: opacity,
      display: 'inline-block',
      marginRight: '2px',
      border: category ? '1px solid rgba(0,0,0,0.1)' : 'none',
      flexShrink: 0,
      visibility: category ? 'visible' : 'hidden' // Invisible but maintains space
    };
  };

  // Create circle components with tooltips
  const CircleWithTooltip = ({ category, isPrimary, label }) => {
    const circleStyle = getCircleStyle(category, isPrimary);
    const tooltipTitle = category || `No ${label} Category`;
    
    return (
      <Tooltip 
        title={tooltipTitle} 
        arrow 
        placement="top"
        enterDelay={500}
        leaveDelay={200}
      >
        <Box
          component="span"
          sx={circleStyle}
          aria-label={`${label}: ${tooltipTitle}`}
          role="img"
        />
      </Tooltip>
    );
  };

  // PropTypes for internal component
  CircleWithTooltip.propTypes = {
    category: PropTypes.string,
    isPrimary: PropTypes.bool,
    label: PropTypes.string.isRequired,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginTop: '2px',
        flexWrap: 'nowrap'
      }}
      aria-label="Event Categories"
    >
      <CircleWithTooltip 
        category={categoryFirst} 
        isPrimary={true} 
        label="Primary Category" 
      />
      <CircleWithTooltip 
        category={categorySecond} 
        isPrimary={false} 
        label="Secondary Category" 
      />
      <CircleWithTooltip 
        category={categoryThird} 
        isPrimary={false} 
        label="Tertiary Category" 
      />
    </Box>
  );
};

// PropTypes validation
CategoryCircles.propTypes = {
  eventProps: PropTypes.shape({
    categoryFirst: PropTypes.string,
    categorySecond: PropTypes.string,
    categoryThird: PropTypes.string,
  }),
};

export default CategoryCircles;