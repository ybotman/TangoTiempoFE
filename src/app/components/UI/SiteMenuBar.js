"use client";  // Mark it as a client component

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';  // Import the new hook
import PostFilter from '@/components/UI/PostFilter';

const SiteMenuBar = ({
    regions, selectedRegion, setSelectedRegion, selectedDivision, setSelectedDivision, selectedCity, setSelectedCity,
    activeCategories, handleCategoryChange, categories, selectedOrganizer, handleOrganizerChange
}) => {
    const {
        anchorEl, handleMenuOpen, handleMenuClose, sortedCategories, handleSortedCategories,
        organizers, selectedRole, availableRoles, user, logOut,
        handleRegionChange, handleDivisionChange, handleCityChange, handleRoleChange
    } = useSiteMenuBar({
        regions, setSelectedRegion, setSelectedDivision, setSelectedCity, handleOrganizerChange
    });

    // Ensure that the component re-renders when selectedRole changes
    useEffect(() => {
        console.log("Selected Role changed:", selectedRole);  // Debug to ensure role change is being logged
    }, [selectedRole]);  // This effect runs every time `selectedRole` changes

    return (
        <Box sx={{ width: '100%', padding: '0 0' }}>
            {/* Top row with main menu items and user state */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {/* Conditionally show menu items based on role */}
                        {selectedRole === 'NamedUser' && <MenuItem>User Settings (TBD)</MenuItem>}
                        {selectedRole === 'RegionalOrganizer' && <MenuItem>Organizer Settings (TBD)</MenuItem>}
                        {selectedRole === 'RegionalAdmin' && (
                            <>
                                <MenuItem>Add Organizer (TBD)</MenuItem>
                                <MenuItem>Add Locations (TBD)</MenuItem>
                            </>
                        )}
                        {selectedRole === 'SystemOwner' && <MenuItem>Admin Dashboard</MenuItem>}
                        {/* Always available items */}
                        <MenuItem>Organizer Request</MenuItem>
                        <MenuItem>About</MenuItem>
                    </Menu>

                    {/* Region Dropdown */}
                    <select value={selectedRegion || ""} onChange={handleRegionChange}>
                        <option value="">Select Region</option>
                        {regions.map(region => (
                            <option key={region.regionName} value={region.regionName}>
                                {region.regionName}
                            </option>
                        ))}
                    </select>

                    {/* Division Dropdown */}
                    {selectedRegion && (
                        <select value={selectedDivision || ""} onChange={handleDivisionChange}>
                            <option value="">Select Division</option>
                            {regions.find(region => region.regionName === selectedRegion)
                                .divisions.map(division => (
                                    <option key={division.divisionName} value={division.divisionName}>
                                        {division.divisionName}
                                    </option>
                                ))}
                        </select>
                    )}

                    {/* City Dropdown */}
                    {selectedDivision && (
                        <select value={selectedCity || ""} onChange={handleCityChange}>
                            <option value="">Select City</option>
                            {regions.find(region => region.regionName === selectedRegion)
                                .divisions.find(division => division.divisionName === selectedDivision)
                                .majorCities.map(city => (
                                    <option key={city._id} value={city.cityName}>
                                        {city.cityName}
                                    </option>
                                ))}
                        </select>
                    )}

                    {/* Organizer Dropdown */}
                    {selectedRegion && organizers.length > 0 && (
                        <select value={selectedOrganizer || ""} onChange={(e) => handleOrganizerChange(e.target.value)}>
                            <option value="">Select Organizer</option>
                            <option value="none">None</option>
                            {organizers.map(org => (
                                <option key={org._id} value={org._id}>
                                    {org.shortName}
                                </option>
                            ))}
                        </select>
                    )}
                </Box>

                {/* Role Dropdown - User can switch roles */}
                {user && availableRoles.length > 0 && (
                    <Box sx={{ marginLeft: 2 }}>
                        <select value={selectedRole} onChange={handleRoleChange}>
                            {availableRoles.map(role => (
                                <option key={role.roleId} value={role.roleName}>
                                    {role.roleName}
                                </option>
                            ))}
                        </select>
                        <button onClick={logOut}>Log Out</button>
                    </Box>
                )}
            </Box>

            {/* Bottom row with Category Filter */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <PostFilter
                    activeCategories={activeCategories}
                    handleCategoryChange={handleCategoryChange}
                    categories={categories}
                    selectedOrganizer={selectedOrganizer}
                    handleSortedCategories={handleSortedCategories}
                />
            </Box>
        </Box>
    );
};

SiteMenuBar.propTypes = {
    regions: PropTypes.arrayOf(PropTypes.shape({
        regionCode: PropTypes.string.isRequired,
        regionName: PropTypes.string.isRequired,
        divisions: PropTypes.arrayOf(PropTypes.shape({
            divisionName: PropTypes.string.isRequired,
            majorCities: PropTypes.arrayOf(PropTypes.shape({
                cityName: PropTypes.string.isRequired,
                _id: PropTypes.string.isRequired,
            })).isRequired,
        })).isRequired,
    })).isRequired,
    selectedRegion: PropTypes.string.isRequired,
    setSelectedRegion: PropTypes.func.isRequired,
    selectedDivision: PropTypes.string.isRequired,
    setSelectedDivision: PropTypes.func.isRequired,
    selectedCity: PropTypes.string.isRequired,
    setSelectedCity: PropTypes.func.isRequired,
    activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedOrganizer: PropTypes.string.isRequired,
    handleOrganizerChange: PropTypes.func.isRequired,
};

export default SiteMenuBar;