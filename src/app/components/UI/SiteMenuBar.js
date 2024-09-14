// app/components/UI/SiteMenuBar.js

"use client";

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PostFilter from "@/components/UI/PostFilter";
import { AuthContext } from '@/contexts/AuthContext';
import { RegionsContext } from '@/contexts/RegionsContext';
import { PostFilterContext } from '@/contexts/PostFilterContext';

const SiteMenuBar = ({
  regions,
  activeCategories,
  handleCategoryChange,
  categories,
  selectedOrganizer,
  handleOrganizerChange,
}) => {
    console.log('SiteMenuBar rendering');
 
  const { user, availableRoles, logOut, selectedRole, setSelectedRole } = useContext(AuthContext);
  console.log('AuthContext values:', { user, logOut, selectedRole });
 
  const { selectedRegion, setSelectedRegion, selectedDivision, setSelectedDivision, selectedCity, setSelectedCity } = useContext(RegionsContext);
   console.log('RegionsContext values:', { selectedRegion, selectedDivision, selectedCity });
 
  const { organizers } = useContext(PostFilterContext);
    console.log('PostFilterContext values:', { organizers });

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleRegionChange = (event) => {
    const value = event.target.value;
    console.log("handleRegionChange:", value);
    setSelectedRegion(value);
    setSelectedDivision("");
    setSelectedCity("");
  };

  const handleDivisionChange = (event) => {
    const value = event.target.value;
    console.log("handleDivisionChange:", value);
    setSelectedDivision(value);
    setSelectedCity("");
  };

  const handleCityChange = (event) => {
    const value = event.target.value;
    console.log("handleCityChange:", value);
    setSelectedCity(value);
  };

  return (
    <Box sx={{ width: "100%", padding: "0 0" }}>
      {/* Top row with main menu items and user state */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Hamburger Menu */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {/* Conditional menu items based on roles */}
            {availableRoles.includes("NamedUser") && <MenuItem>User Settings</MenuItem>}
            {availableRoles.includes("RegionalOrganizer") && <MenuItem>Organizer Settings</MenuItem>}
            {availableRoles.includes("RegionalOrganizer") && <MenuItem>Location Management</MenuItem>}
            {availableRoles.includes("RegionalAdmin") && <MenuItem>Add Organizers</MenuItem>}
            {availableRoles.includes("RegionalAdmin") && <MenuItem>Manage Locations</MenuItem>}
            {availableRoles.includes("SystemOwner") && <MenuItem>Full Menu Access (All Roles)</MenuItem>}
            {availableRoles.includes("Anonymous") && <MenuItem>Login/Signup Options</MenuItem>}
            <MenuItem>About</MenuItem>
          </Menu>

          {/* Region Dropdown */}
          <select value={selectedRegion || ""} onChange={handleRegionChange}>
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
              value={selectedDivision || ""}
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
            <select value={selectedCity || ""} onChange={handleCityChange}>
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

          {/* Organizer Dropdown */}
           {selectedRegion && organizers && organizers.length > 0 && (
           <select
              value={selectedOrganizer || ""}
              onChange={(e) => handleOrganizerChange(e.target.value)}
            >
              <option value="">Select Organizer</option>
              <option value="none">None</option>
              {organizers.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.shortName}
                </option>
              ))}
            </select>
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
                {availableRoles.map((role) => (
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
          width: "100%",
          display: "flex",
          justifyContent: "center",
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
    </Box>
  );
};

SiteMenuBar.propTypes = {
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      regionName: PropTypes.string.isRequired,
      divisions: PropTypes.arrayOf(
        PropTypes.shape({
          divisionName: PropTypes.string.isRequired,
          majorCities: PropTypes.arrayOf(
            PropTypes.shape({
              _id: PropTypes.string.isRequired,
              cityName: PropTypes.string.isRequired,
            })
          ).isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
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