import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CategoryFilter from '@/components/UI/CategoryFilter';
import { useEvents } from '@/hooks/useEvents';

const SiteMenuBar = ({ regions, selectedCategories, handleCategoryChange, categories }) => {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const events = useEvents(selectedRegion, selectedDivision, selectedCity);

    const handleRegionChange = (event) => {
        setSelectedRegion(event.target.value);
        setSelectedDivision(''); // Reset division and city when region changes
        setSelectedCity('');
    };

    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
        setSelectedCity(''); // Reset city when division changes
    };

    return (
        <div>
            {/* Region Dropdown */}
            <select value={selectedRegion} onChange={handleRegionChange}>
                <option value="">Select Region</option>
                {regions.map(region => (
                    <option key={region.regionName} value={region.regionName}>
                        {region.regionName}
                    </option>
                ))}
            </select>

            {/* Division Dropdown */}
            {selectedRegion && (
                <select value={selectedDivision} onChange={handleDivisionChange}>
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
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
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

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
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
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SiteMenuBar;