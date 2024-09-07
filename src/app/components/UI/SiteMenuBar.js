import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import UserStateRole from './UserStateRole';
import PostFilter from '@/components/UI/PostFilter';
import useOrganizers from '@/hooks/useOrganizers';  // Import the organizer hook

const SiteMenuBar = ({
    regions, selectedRegion, setSelectedRegion, selectedDivision, setSelectedDivision, selectedCity, setSelectedCity,
    activeCategories, handleCategoryChange, categories, selectedOrganizer, handleOrganizerChange
}) => {
    console.log("Props in PostFilter: ", { categories, activeCategories, handleCategoryChange });
    const [anchorEl, setAnchorEl] = useState(null);
    const organizers = useOrganizers(selectedRegion);  // Fetch organizers based on the selected region
    const [sortedCategories, setSortedCategories] = useState(categories);  // Define state for sorted categories


    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSortedCategories = (sortedCategories) => {
        // Update state with sorted categories
        console.log('Received sorted categories:', sortedCategories); // this is good and working
        setSortedCategories(sortedCategories);
    };

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
        setSelectedDivision('');
        setSelectedCity('');
        handleOrganizerChange('');  // Reset organizer when the region changes
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
        setSelectedCity('');
    };

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

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
                        {selectedRegion && (
                            <MenuItem>Select Organizers</MenuItem>
                        )}
                        <MenuItem>Admin Page</MenuItem>
                        <MenuItem>Request Form</MenuItem>
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

                    {/* Organizer Dropdown - Only visible if region is selected */}
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

                <UserStateRole />
            </Box>

            {/* Bottom row with Category Filter */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <PostFilter
                    activeCategories={activeCategories}
                    handleCategoryChange={handleCategoryChange}
                    categories={categories} // was sorted categories and is not workoing
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