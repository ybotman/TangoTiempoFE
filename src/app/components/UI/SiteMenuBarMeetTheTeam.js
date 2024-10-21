import PropTypes from 'prop-types';
import {
  Menu,
  MenuItem,
  Popper,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const SiteMenuBarMeetTheTeam = ({
  teamMenuAnchorEl,
  openTeamMenu,
  handleTeamMenuOpen,
  handleTeamMenuClose,
  setOpenTeamMenu, // Add this
}) => (
  <>
    <MenuItem
      onMouseEnter={handleTeamMenuOpen}
      onMouseLeave={handleTeamMenuClose}
    >
      Meet the Team
      <ArrowRightIcon style={{ marginLeft: 'auto' }} />
    </MenuItem>

    <Popper
      open={openTeamMenu}
      anchorEl={teamMenuAnchorEl}
      placement="right-start"
      disablePortal
      onMouseEnter={() => setOpenTeamMenu(true)} // This now works
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
            <MenuItem onClick={() => (window.location.href = '/about-wailing')}>
              About Wailing
            </MenuItem>
            <MenuItem onClick={() => (window.location.href = '/about-tural')}>
              About Tural
            </MenuItem>
          </Menu>
        </ClickAwayListener>
      </Paper>
    </Popper>
  </>
);

// Adding prop-types for validation
SiteMenuBarMeetTheTeam.propTypes = {
  teamMenuAnchorEl: PropTypes.object,
  openTeamMenu: PropTypes.bool.isRequired,
  handleTeamMenuOpen: PropTypes.func.isRequired,
  handleTeamMenuClose: PropTypes.func.isRequired,
  setOpenTeamMenu: PropTypes.func.isRequired, // Add this
};

export default SiteMenuBarMeetTheTeam;
