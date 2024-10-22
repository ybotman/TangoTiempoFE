import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  MenuItem,
  Divider,
  Popper,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { listOfAllRoles } from '@/utils/masterData';

const SiteMenuBarHamburger = ({
  anchorEl,
  handleHamburgerMenuClose,
  openFAQModal,
  selectedRole,
  handleTeamMenuOpen,
  handleTeamMenuClose,
  teamMenuAnchorEl,
  openTeamMenu, // Team menu state from useSiteMenuBar
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

      {/* Meet the Team section */}
      <MenuItem
        onMouseEnter={handleTeamMenuOpen}
        onMouseLeave={handleTeamMenuClose}
      >
        Meet the Team
        <ArrowRightIcon style={{ marginLeft: 'auto' }} />
      </MenuItem>

      {/* Nested team menu */}
      <Popper
        open={openTeamMenu}
        anchorEl={teamMenuAnchorEl}
        placement="right-start"
        disablePortal
        onMouseEnter={handleTeamMenuOpen}
        onMouseLeave={handleTeamMenuClose}
      >
        <Paper>
          <ClickAwayListener onClickAway={handleTeamMenuClose}>
            <Menu
              anchorEl={teamMenuAnchorEl}
              open={openTeamMenu}
              onClose={handleTeamMenuClose}
            >
              <MenuItem onClick={() => (window.location.href = '/about-toby')}>
                About Toby
              </MenuItem>
              <MenuItem
                onClick={() => (window.location.href = '/about-wailing')}
              >
                About Wailing
              </MenuItem>
              <MenuItem onClick={() => (window.location.href = '/about-tural')}>
                About Tural
              </MenuItem>
            </Menu>
          </ClickAwayListener>
        </Paper>
      </Popper>

      {/* Divider */}
      <Divider />

      {/* Help */}
      <MenuItem>Help</MenuItem>
      <MenuItem onClick={() => (window.location.href = '/versions')}>
        Version History
      </MenuItem>
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
  openTeamMenu: PropTypes.bool.isRequired, // Updated prop-type for team menu
};

export default SiteMenuBarHamburger;
