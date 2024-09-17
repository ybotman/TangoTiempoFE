// components/UI/CalendarSubMenu.js

import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';

const CalendarSubMenu = ({
  menuAnchor,
  handleClose,
  menuItems,
  onActionSelected,
}) => {
  return (
    <Menu
      open={!!menuAnchor}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        menuAnchor !== null
          ? { top: menuAnchor.mouseY, left: menuAnchor.mouseX }
          : undefined
      }
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
