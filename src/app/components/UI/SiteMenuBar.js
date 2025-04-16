import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Avatar, Tooltip, Typography, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import PostFilter from '@/components/UI/PostFilter';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import SiteMenuBarUserDrawer from './SiteMenuBarUserDrawer';

const SiteMenuBar = ({ activeCategories, handleCategoryChange, categories }) => {
  const { selectedRole, user, roles, handleRoleChange, logOut } = useSiteMenuBar();

  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Snackbar state for role change message
  const [roleMessageOpen, setRoleMessageOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState('');

  const showRoleMessage = (roleName) => {
    setSelectedRoleName(roleName);
    setRoleMessageOpen(true);
  };

  const handleRoleMessageClose = () => {
    setRoleMessageOpen(false);
  };

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => setShowTooltip((prev) => !prev), 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
      {/* Left Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setSidebarDrawerOpen(!sidebarDrawerOpen)}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <PostFilter
          activeCategories={activeCategories}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Login here!" arrow open={!user && showTooltip} placement="left">
          <IconButton onClick={() => setUserDrawerOpen(true)}>{renderUserIcon()}</IconButton>
        </Tooltip>
      </Box>

      <SidebarDrawer open={sidebarDrawerOpen} onClose={() => setSidebarDrawerOpen(false)} />
      <SiteMenuBarUserDrawer
        userDrawerOpen={userDrawerOpen}
        handleUserDrawerClose={() => setUserDrawerOpen(false)}
        user={user}
        roles={roles}
        selectedRole={selectedRole}
        handleRoleChange={handleRoleChange}
        logOut={logOut}
        showRoleMessage={showRoleMessage} // Pass showRoleMessage callback
      />

      <Snackbar
        open={roleMessageOpen}
        onClose={handleRoleMessageClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleRoleMessageClose} severity="info" sx={{ backgroundColor: 'green.300', color: 'black' }}>
          You have changed role to: {selectedRoleName}
        </Alert>
      </Snackbar>
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
