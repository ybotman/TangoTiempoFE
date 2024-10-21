// SiteMenuBar.js

'use client';
import React, { useState, useContext } from 'react';
//import Image from 'next/image';
import { listOfAllRoles } from '@/utils/masterData';
import PropTypes from 'prop-types';
import { Avatar } from '@mui/material';
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
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PostFilter from '@/components/UI/PostFilter';
import FAQModal from '@/components/Modals/FAQModal';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
//import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RegionsContext } from '@/contexts/RegionsContext';

const SiteMenuBar = ({
  activeCategories,
  handleCategoryChange,
  categories,
  selectedOrganizer,
  handleOrganizerChange,
  organizers,
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
  } = useSiteMenuBar();

  const {
    regions,
    selectedRegion,
    setSelectedRegion,
    //selectedDivision,
    //    setSelectedDivision,
    //selectedCity,
    setSelectedCity,
  } = useContext(RegionsContext);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectionLevel, setSelectionLevel] = useState(1); // 1: Region, 2: Division, 3: City
  const [localSelectedRegion, setLocalSelectedRegion] = useState(null);
  const [localSelectedDivision, setLocalSelectedDivision] = useState(null);
  const [setSelectedDivision, setLocalSelectedCity] = useState(null);

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
            {/* Implement your team menu logic here */}
            {/* ... */}
          </Menu>

          {/* Region Selection Icon */}
          <IconButton onClick={() => setDrawerOpen(true)}>
            {renderRegionIcon()}
          </IconButton>

          {/* Organizer Dropdown */}
          {selectedRegion && organizers && organizers.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '20px',
              }}
            >
              <FormControl variant="outlined" size="small">
                <InputLabel id="organizer-select-label">Organizer</InputLabel>
                <Select
                  labelId="organizer-select-label"
                  id="organizer-select"
                  value={selectedOrganizer || ''}
                  onChange={(e) => handleOrganizerChange(e.target.value)}
                  label="Organizer"
                >
                  <MenuItem value="">Select Organizer</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                  {organizers.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.shortName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

      {/* The Drawer component */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectionLevel(1);
          setLocalSelectedRegion(null);
          setLocalSelectedDivision(null);
        }}
      >
        <Box sx={{ width: '100%', padding: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectionLevel > 1 && (
              <IconButton
                onClick={() => {
                  if (selectionLevel === 2) {
                    setSelectionLevel(1);
                    setLocalSelectedRegion(null);
                  } else if (selectionLevel === 3) {
                    setSelectionLevel(2);
                    setLocalSelectedDivision(null);
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
              {selectionLevel === 1 && 'Select Region'}
              {selectionLevel === 2 && 'Select Division'}
              {selectionLevel === 3 && 'Select City'}
            </Typography>
          </Box>

          {/* Content */}
          {selectionLevel === 1 && (
            <List>
              {regions.map((region) => (
                <ListItem
                  button
                  key={region.regionCode}
                  onClick={() => {
                    setLocalSelectedRegion(region);
                    setSelectedAbbreviation(region.regionCode); // Update abbreviation
                    setSelectedRegion(region.regionName); // Update context
                    // Proceed to next level if divisions exist
                    if (region.divisions && region.divisions.length > 0) {
                      setSelectionLevel(2);
                    } else {
                      // No divisions, close drawer
                      setDrawerOpen(false);
                      setSelectionLevel(1);
                    }
                  }}
                >
                  <ListItemText primary={region.regionName} />
                </ListItem>
              ))}
            </List>
          )}
          {selectionLevel === 2 && localSelectedRegion && (
            <List>
              {localSelectedRegion.divisions.map((division) => (
                <ListItem
                  button
                  key={division.divisionCode}
                  onClick={() => {
                    setLocalSelectedDivision(division);
                    setSelectedAbbreviation(division.divisionCode); // Update abbreviation
                    setSelectedDivision(division.divisionName); // Update context
                    // Proceed to next level if cities exist
                    if (
                      division.majorCities &&
                      division.majorCities.length > 0
                    ) {
                      setSelectionLevel(3);
                    } else {
                      // No cities, close drawer
                      setDrawerOpen(false);
                      setSelectionLevel(1);
                    }
                  }}
                >
                  <ListItemText primary={division.divisionName} />
                </ListItem>
              ))}
            </List>
          )}
          {selectionLevel === 3 && localSelectedDivision && (
            <List>
              {localSelectedDivision.majorCities.map((city) => (
                <ListItem
                  button
                  key={city.cityCode}
                  onClick={() => {
                    setLocalSelectedCity(city);
                    setSelectedAbbreviation(city.cityCode); // Update abbreviation
                    setSelectedCity(city.cityName); // Update context
                    // Close the drawer
                    setDrawerOpen(false);
                    setSelectionLevel(1);
                  }}
                >
                  <ListItemText primary={city.cityName} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
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
  handleOrganizerChange: PropTypes.func.isRequired,
  organizers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      shortName: PropTypes.string.isRequired,
    })
  ),
};

export default SiteMenuBar;
