import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CategoryFilter from '@/components/UI/CategoryFilter';

const SiteMenuBar = ({
    regions,
    selectedRegion = "",
    setSelectedRegion,
    selectedDivision = "",
    setSelectedDivision,
    selectedCity = "",
    setSelectedCity,
    selectedCategories = "",
    handleCategoryChange,
    categories }) => {

    const handleRegionChange = (event) => {
        console.log("Region changed:", event.target.value);
        setSelectedRegion(event.target.value);
        setSelectedDivision(''); // Reset division and city when region changes
        setSelectedCity('');
    };

    const handleDivisionChange = (event) => {
        console.log("Division changed:", event.target.value);
        setSelectedDivision(event.target.value);
        setSelectedCity(''); // Reset city when division changes
    };

    const handleCityChange = (event) => {
        console.log("City changed:", event.target.value);
        setSelectedCity(event.target.value);
    };

    return (
        <div>
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
};


export default SiteMenuBar;