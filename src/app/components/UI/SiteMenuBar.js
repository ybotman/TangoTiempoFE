// SiteMenuBar.js

'use client';
import React from 'react';
import { listOfAllRoles } from '@/utils/masterData';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Menu,
  Divider,
  MenuItem,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PostFilter from '@/components/UI/PostFilter';
import FAQModal from '@/components/Modals/FAQModal';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar'; // Import the custom hook

const SiteMenuBar = ({
  activeCategories,
  handleCategoryChange,
  categories,
  selectedOrganizer,
  handleOrganizerChange,
}) => {
  const {
    anchorEl,
    FAQModalOpen,
    selectedRegion,
    selectedDivision,
    selectedCity,
    organizers,
    regions,
    roles,
    selectedRole,
    user,
    handleHamburgerMenuOpen,
    handleHamburgerMenuClose,
    handleRoleChange,
    handleRegionChange,
    handleDivisionChange,
    handleCityChange,
    openFAQModal,
    closeFAQModal,
    logOut,
  } = useSiteMenuBar();

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
              <MenuItem>Organizer Settings</MenuItem>
            )}
            {selectedRole === listOfAllRoles.REGIONAL_ORGANIZER && (
              <MenuItem>Location Management</MenuItem>
            )}
            {selectedRole === listOfAllRoles.REGIONAL_ADMIN && (
              <MenuItem>Add Organizers</MenuItem>
            )}
            <Divider />
            <MenuItem onClick={openFAQModal}>FAQ</MenuItem>
            <MenuItem>About TangoTiempo</MenuItem>
            <MenuItem onClick={() => (window.location.href = '/about-toby')}>
              About Toby
            </MenuItem>{' '}
            {/* Link to About Toby page */}
            <MenuItem onClick={() => (window.location.href = '/about')}>
              About
            </MenuItem>{' '}
            {/* Link to About page */}
            <MenuItem>Help</MenuItem>
          </Menu>

          {/* Region Dropdown */}
          <select value={selectedRegion || ''} onChange={handleRegionChange}>
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region.regionName} value={region.regionName}>
                {region.regionName}
              </option>
            ))}
          </select>

          {/* Division Dropdown */}
          {selectedRegion && (
            <select
              value={selectedDivision || ''}
              onChange={handleDivisionChange}
            >
              <option value="">Select Division</option>
              {regions
                .find((region) => region.regionName === selectedRegion)
                .divisions.map((division) => (
                  <option
                    key={division.divisionName}
                    value={division.divisionName}
                  >
                    {division.divisionName}
                  </option>
                ))}
            </select>
          )}

          {/* City Dropdown */}
          {selectedDivision && (
            <select value={selectedCity || ''} onChange={handleCityChange}>
              <option value="">Select City</option>
              {regions
                .find((region) => region.regionName === selectedRegion)
                .divisions.find(
                  (division) => division.divisionName === selectedDivision
                )
                .majorCities.map((city) => (
                  <option key={city._id} value={city.cityName}>
                    {city.cityName}
                  </option>
                ))}
            </select>
          )}

          {/* Organizer Dropdown (Show only if a region is selected) */}
          {selectedRegion && organizers && organizers.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <select
                value={selectedOrganizer || ''}
                onChange={(e) => handleOrganizerChange(e.target.value)}
                style={{
                  marginLeft: '20px',
                  textAlign: 'center',
                  backgroundColor: '#333', // Dark background
                  color: '#fff', // Light text
                  fontSize: '0.85rem', // Smaller font size
                  padding: '8px', // Padding for better spacing
                  border: '1px solid #fff', // White border to make it stand out
                  borderRadius: '4px', // Rounded corners
                }}
              >
                <option value="">Select Organizer</option>
                <option value="none">None</option>
                {organizers.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.shortName}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </Box>

        {/* User State and Role Dropdown */}
        {user ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" color="textPrimary">
              {user.displayName || user.email}
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedRole}
                onChange={handleRoleChange}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={logOut}
            >
              Log Out
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              href="/auth/login"
            >
              Log In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              href="/auth/signup"
            >
              Sign Up
            </Button>
          </Stack>
        )}
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
  selectedOrganizer: PropTypes.string.isRequired,
  handleOrganizerChange: PropTypes.func.isRequired,
};

export default SiteMenuBar;
