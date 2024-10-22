// SiteMenuBar.js

'use client';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Avatar,
  Typography, // Keep Typography import, it's used in renderRegionIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import { RegionsContext } from '@/contexts/RegionsContext';
import PostFilter from '@/components/UI/PostFilter';
import FAQModal from '@/components/Modals/FAQModal';

// Import all modular components
import SiteMenuBarUserDrawer from './SiteMenuBarUserDrawer';
import SiteMenuBarRegionDrawer from './SiteMenuBarRegionDrawer';
import SiteMenuBarHamburger from './SiteMenuBarHamburger';

const SiteMenuBar = ({
  activeCategories,
  handleCategoryChange,
  categories,
  selectedOrganizer,
}) => {
  const {
    anchorEl,
    FAQModalOpen,
    selectedRole,
    user,
    roles,
    handleHamburgerMenuOpen,
    handleHamburgerMenuClose,
    handleRoleChange,
    openFAQModal,
    closeFAQModal,
    logOut,
    teamMenuAnchorEl,
    openTeamMenu, // Make sure openTeamMenu is included
    setOpenTeamMenu, // Make sure setOpenTeamMenu is included
    handleTeamMenuOpen,
    handleTeamMenuClose,
  } = useSiteMenuBar();

  //const [openSubMenu, setOpenSubMenu] = useState(false);

  const {
    regions,
    setSelectedRegion, // Keep only the necessary region-related functions
  } = useContext(RegionsContext);

  // State for the region selection drawer
  const [regionDrawerOpen, setRegionDrawerOpen] = useState(false);
  const [selectionLevel, setSelectionLevel] = useState(1);
  const [localSelectedRegion, setLocalSelectedRegion] = useState(null);
  const [localSelectedDivision, setLocalSelectedDivision] = useState(null);

  // State for the user management drawer
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);

  // For replacing the icon with abbreviation
  const [selectedAbbreviation, setSelectedAbbreviation] = useState(null);

  // For the US map icon or the abbreviation
  const renderRegionIcon = () => {
    if (selectedAbbreviation) {
      return (
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {selectedAbbreviation}
        </Typography>
      );
    } else {
      return (
        <Avatar
          alt="Select Region"
          src="/USARegions.png"
          sx={{ width: 24, height: 24 }}
        />
      );
    }
  };

  // User icon (person icon for unauthenticated, avatar for authenticated)
  const renderUserIcon = () => {
    if (user && (user.photoURL || user.displayName)) {
      return (
        <Avatar
          alt={user.displayName || user.email}
          src={user.photoURL || '/defaultAvatar.png'}
          sx={{ width: 32, height: 32 }}
        />
      );
    } else {
      return <AccountCircleIcon sx={{ width: 32, height: 32 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', padding: '0 0' }}>
      {/* Top row with main menu items and user state */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Hamburger Menu */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleHamburgerMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          {/* Hamburger Menu Component */}
          <SiteMenuBarHamburger
            anchorEl={anchorEl}
            handleHamburgerMenuClose={handleHamburgerMenuClose}
            openFAQModal={openFAQModal}
            selectedRole={selectedRole}
            handleTeamMenuOpen={handleTeamMenuOpen}
            handleTeamMenuClose={handleTeamMenuClose}
            teamMenuAnchorEl={teamMenuAnchorEl}
            openTeamMenu={openTeamMenu} // Updated
            setOpenTeamMenu={setOpenTeamMenu} // Updated
          />

          {/* Region Selection Icon */}
          <IconButton onClick={() => setRegionDrawerOpen(true)}>
            {renderRegionIcon()}
          </IconButton>
        </Box>

        {/* User Icon */}
        <IconButton onClick={() => setUserDrawerOpen(true)}>
          {renderUserIcon()}
        </IconButton>
      </Box>

      {/* Bottom row with Category Filter */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <PostFilter
          activeCategories={activeCategories}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
          selectedOrganizer={selectedOrganizer}
        />
      </Box>

      {/* Help Modal */}
      <FAQModal open={FAQModalOpen} handleClose={closeFAQModal} />

      {/* Region Selection Drawer */}
      <SiteMenuBarRegionDrawer
        regionDrawerOpen={regionDrawerOpen}
        setRegionDrawerOpen={setRegionDrawerOpen}
        regions={regions}
        selectionLevel={selectionLevel}
        setSelectionLevel={setSelectionLevel}
        localSelectedRegion={localSelectedRegion}
        setLocalSelectedRegion={setLocalSelectedRegion}
        localSelectedDivision={localSelectedDivision}
        setLocalSelectedDivision={setLocalSelectedDivision}
        setSelectedRegion={setSelectedRegion}
        setSelectedAbbreviation={setSelectedAbbreviation}
      />

      {/* User Management Drawer */}
      <SiteMenuBarUserDrawer
        userDrawerOpen={userDrawerOpen}
        handleUserDrawerClose={() => setUserDrawerOpen(false)}
        user={user}
        roles={roles}
        selectedRole={selectedRole}
        handleRoleChange={handleRoleChange}
        logOut={logOut}
      />
    </Box>
  );
};

SiteMenuBar.propTypes = {
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOrganizer: PropTypes.string,
};

export default SiteMenuBar;
