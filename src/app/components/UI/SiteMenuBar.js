// SiteMenuBar.js

'use client';
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { listOfAllRoles } from '@/utils/masterData';
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
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import { RegionsContext } from '@/contexts/RegionsContext';
import PostFilter from '@/components/UI/PostFilter';
import FAQModal from '@/components/Modals/FAQModal';

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
    setSelectedDivision,
    setSelectedCity,
  } = useContext(RegionsContext);

  // State for the region selection drawer
  const [regionDrawerOpen, setRegionDrawerOpen] = useState(false);
  const [selectionLevel, setSelectionLevel] = useState(1); // 1: Region, 2: Division, 3: City
  const [localSelectedRegion, setLocalSelectedRegion] = useState(null);
  const [localSelectedDivision, setLocalSelectedDivision] = useState(null);
  //const [localSelectedCity, setLocalSelectedCity] = useState(null);

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

  // Handler for opening the user drawer
  const handleUserIconClick = () => {
    setUserDrawerOpen(true);
  };

  // Handler for closing the user drawer
  const handleUserDrawerClose = () => {
    setUserDrawerOpen(false);
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
          <IconButton onClick={() => setRegionDrawerOpen(true)}>
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

        {/* User Icon */}
        <IconButton onClick={handleUserIconClick}>
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
      <Drawer
        anchor="top"
        open={regionDrawerOpen}
        onClose={() => {
          setRegionDrawerOpen(false);
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
                    setSelectedDivision(null);
                    setSelectedCity(null);
                    // Proceed to next level if divisions exist
                    if (region.divisions && region.divisions.length > 0) {
                      setSelectionLevel(2);
                    } else {
                      // No divisions, close drawer
                      setRegionDrawerOpen(false);
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
                    setSelectedCity(null);
                    // Proceed to next level if cities exist
                    if (
                      division.majorCities &&
                      division.majorCities.length > 0
                    ) {
                      setSelectionLevel(3);
                    } else {
                      // No cities, close drawer
                      setRegionDrawerOpen(false);
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
                    //setLocalSelectedCity(city);
                    setSelectedAbbreviation(city.cityCode); // Update abbreviation
                    setSelectedCity(city.cityName); // Update context
                    // Close the drawer
                    setRegionDrawerOpen(false);
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

      {/* User Management Drawer */}
      <Drawer
        anchor="Right"
        open={userDrawerOpen}
        onClose={handleUserDrawerClose}
      >
        <Box sx={{ width: 300, padding: 2 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            <Typography variant="h6">User Management</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleUserDrawerClose}>
              <ArrowBackIcon />
            </IconButton>
          </Box>

          {/* Content */}
          {!user ? (
            // Logged Out State
            <Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                href="/auth/login"
                sx={{ marginBottom: 1 }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                href="/auth/signup"
                sx={{ marginBottom: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          ) : (
            // Logged In State
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  alt={user.displayName || user.email}
                  src={user.photoURL || '/defaultAvatar.png'}
                  sx={{ width: 56, height: 56 }}
                />
                <Typography variant="h6">
                  {user.displayName || user.email}
                </Typography>
              </Stack>

              {/* Role Management */}
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="subtitle1">Select Role:</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e)}
                  >
                    {roles.map((role) => (
                      <FormControlLabel
                        key={role}
                        value={role}
                        control={<Radio />}
                        label={role}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 1 }}
                  disabled
                >
                  Request New Role
                </Button>
              </Box>

              {/* Admin Communication */}
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="subtitle1">Message Admin:</Typography>
                <TextField
                  placeholder="Feature coming soon..."
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  disabled
                />
              </Box>

              {/* Logout Button */}
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ marginTop: 2 }}
                onClick={logOut}
              >
                Log Out
              </Button>
            </Box>
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
