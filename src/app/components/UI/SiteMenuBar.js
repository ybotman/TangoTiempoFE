// SiteMenuBar.js
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import PostFilter from '@/components/UI/PostFilter';
import FAQModal from '@/components/Modals/FAQModal';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import SiteMenuBarUserDrawer from './SiteMenuBarUserDrawer';
import { RegionsContext } from '@/contexts/RegionsContext';

const SiteMenuBar = ({
  activeCategories,
  handleCategoryChange,
  categories,
}) => {
  const {
    FAQModalOpen,
    selectedRole,
    user,
    roles,
    handleRoleChange,
    closeFAQModal,
    logOut,
  } = useSiteMenuBar();

  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pulseRegionText, setPulseRegionText] = useState(false);

  // Access selectedRegion from RegionsContext
  const { selectedRegion } = useContext(RegionsContext);

  // Tooltip toggle for arrow effect if user is not logged in
  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => setShowTooltip((prev) => !prev), 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Toggle pulse effect for "Select Region" when no region is selected
  useEffect(() => {
    if (!selectedRegion) {
      const interval = setInterval(
        () => setPulseRegionText((prev) => !prev),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [selectedRegion]);

  const renderUserIcon = () =>
    user && (user.photoURL || user.displayName) ? (
      <Avatar
        alt={user.displayName || user.email}
        src={user.photoURL || '/defaultAvatar.png'}
        sx={{ width: 32, height: 32 }}
      />
    ) : (
      <AccountCircleIcon sx={{ width: 32, height: 32 }} />
    );

  return (
    <Box
      sx={{
        width: '100%',
        padding: '0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left Icons and Region Context */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setSidebarDrawerOpen(!sidebarDrawerOpen)}
        >
          <MenuIcon />
        </IconButton>

        {/* Region Context Display */}
        {selectedRegion ? (
          <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold' }}>
            {selectedRegion}
          </Typography>
        ) : (
          <Fade in={pulseRegionText} timeout={800}>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <ArrowBackIcon sx={{ fontSize: 20, mr: 0.5 }} />
              <Typography variant="body2" color="textSecondary">
                Select Region
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Centered PostFilter */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <PostFilter
          activeCategories={activeCategories}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
        />
      </Box>

      {/* Right Icons - User Account with conditional tooltip */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip
          title="Login here!"
          arrow
          open={!user && showTooltip}
          placement="left"
        >
          <IconButton onClick={() => setUserDrawerOpen(true)}>
            {renderUserIcon()}
          </IconButton>
        </Tooltip>
      </Box>

      {/* FAQ Modal */}
      <FAQModal open={FAQModalOpen} handleClose={closeFAQModal} />

      {/* Side Drawers */}
      <SidebarDrawer
        open={sidebarDrawerOpen}
        onClose={() => setSidebarDrawerOpen(false)}
      />
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
