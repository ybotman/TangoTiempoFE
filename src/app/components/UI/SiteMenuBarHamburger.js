import React from 'react';
import PropTypes from 'prop-types'; // Importing PropTypes
import { Menu, MenuItem, Divider } from '@mui/material';
import { listOfAllRoles } from '@/utils/masterData';

const SiteMenuBarHamburger = ({
  anchorEl,
  handleHamburgerMenuClose,
  openFAQModal,
  selectedRole,
  handleTeamMenuOpen,
  handleTeamMenuClose,
  teamMenuAnchorEl,
  openTeamMenu, // Updated to openTeamMenu
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleHamburgerMenuClose}
    >
      {/* Conditional menu items based on roles */}
      {selectedRole === listOfAllRoles.NAMED_USER && (
        <MenuItem>User Settings</MenuItem>
      )}
      {selectedRole === listOfAllRoles.REGIONAL_ORGANIZER && (
        <>
          <MenuItem>Organizer Settings</MenuItem>
          <MenuItem>Location Management</MenuItem>
        </>
      )}
      {selectedRole === listOfAllRoles.REGIONAL_ADMIN && (
        <MenuItem>Add Organizers</MenuItem>
      )}

      {/* Divider */}
      <Divider />

      {/* FAQ */}
      <MenuItem onClick={openFAQModal}>FAQ</MenuItem>

      {/* About TangoTiempo */}
      <MenuItem>About TangoTiempo</MenuItem>

      {/* The Team with a nested menu */}
      <Menu
        anchorEl={teamMenuAnchorEl}
        open={openTeamMenu} // Updated
        onClose={handleTeamMenuClose}
      >
        <MenuItem onClick={handleTeamMenuOpen}>Meet the Team</MenuItem>
        {/* Add nested team menu items here */}
      </Menu>

      {/* Divider */}
      <Divider />

      {/* Help */}
      <MenuItem>Help</MenuItem>
    </Menu>
  );
};

// Adding prop-types for validation
SiteMenuBarHamburger.propTypes = {
  anchorEl: PropTypes.object,
  handleHamburgerMenuClose: PropTypes.func.isRequired,
  openFAQModal: PropTypes.func.isRequired,
  selectedRole: PropTypes.string.isRequired,
  handleTeamMenuOpen: PropTypes.func.isRequired,
  handleTeamMenuClose: PropTypes.func.isRequired,
  teamMenuAnchorEl: PropTypes.object,
  openTeamMenu: PropTypes.bool.isRequired, // Updated prop-type
};

export default SiteMenuBarHamburger;
