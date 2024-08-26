import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import dynamic from 'next/dynamic';
import CategoryFilter from '@/components/UI/CategoryFilter';

const DynamicRouter = dynamic(() => import('next/router').then(mod => mod.useRouter), { ssr: false });

const SiteMenuBar = ({
    regions, selectedRegion, setSelectedRegion, selectedDivision, setSelectedDivision, selectedCity, setSelectedCity,
    selectedCategories,
    handleCategoryChange,
    categories,
    organizers,
    selectedOrganizer,
    handleOrganizerChange
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const router = isMounted ? DynamicRouter() : null;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSelectOrganizers = () => {
        handleMenuClose();
        handleOrganizerChange(selectedOrganizer);
    };

    const handleRequestForm = () => {
        handleMenuClose();
        // Handle request form logic here (TBD)
    };

    const handleAbout = () => {
        handleMenuClose();
        if (router) {
            router.push('/about');
        }
    };

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
        setSelectedDivision('');
        setSelectedCity('');
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
        setSelectedCity('');
    };

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

    if (!isMounted) return null;

    return (
        <div>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
                <MenuIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {/* Conditionally render the "Select Organizers" menu item */}
                {selectedRegion && (
                    <MenuItem onClick={handleSelectOrganizers}>Select Organizers</MenuItem>
                )}
                <MenuItem onClick={handleRequestForm}>Request Form</MenuItem>
                <MenuItem onClick={handleAbout}>About</MenuItem>
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


            {/* Category Filter */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <CategoryFilter
                    selectedCategories={selectedCategories}
                    handleCategoryChange={handleCategoryChange}
                    categories={categories}
                />
            </Box>
        </div>
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
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
    organizers: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedOrganizer: PropTypes.string.isRequired,
    handleOrganizerChange: PropTypes.func.isRequired,
};

export default SiteMenuBar;