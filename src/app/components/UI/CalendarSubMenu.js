// components/UI/CalendarSubMenu.js

import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';

const CalendarSubMenu = ({ menuAnchor, handleClose, menuItems, onActionSelected }) => {
  // Calculate position that keeps menu within viewport
  const getAdjustedPosition = () => {
    if (!menuAnchor) return undefined;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimate menu dimensions
    const menuWidth = 200; // Approximate width
    const menuHeight = menuItems.length * 48 + 16; // 48px per item + padding
    
    let adjustedX = menuAnchor.mouseX;
    let adjustedY = menuAnchor.mouseY;
    
    // Adjust if menu would overflow right edge
    if (adjustedX + menuWidth > viewportWidth) {
      adjustedX = Math.max(10, viewportWidth - menuWidth - 10);
    }
    
    // Adjust if menu would overflow bottom edge
    if (adjustedY + menuHeight > viewportHeight) {
      adjustedY = Math.max(10, viewportHeight - menuHeight - 10);
    }
    
    return { top: adjustedY, left: adjustedX };
  };

  return (
    <Menu
      open={!!menuAnchor}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={getAdjustedPosition()}
      disableRestoreFocus
      slotProps={{
        root: {
          slotProps: {
            backdrop: {
              // Prevent aria-hidden on backdrop when menu items have focus
              invisible: false,
            },
          },
        },
      }}
    >
      {menuItems.map((item, index) => (
        <MenuItem key={index} onClick={() => onActionSelected(item.action)}>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

CalendarSubMenu.propTypes = {
  menuAnchor: PropTypes.shape({
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
  }),
  handleClose: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
    })
  ).isRequired,
  onActionSelected: PropTypes.func.isRequired,
};

export default CalendarSubMenu;
