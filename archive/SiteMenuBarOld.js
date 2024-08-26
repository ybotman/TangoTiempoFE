import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

import CategoryFilter from '@/components/UI/CategoryFilter';

const SiteMenuBar = ({
    //  selectedRegion,
    //  setSelectedRegion,
    regions,
    //selectedOrganizers,
    //handleOrganizerChange,
    //organizers,
    selectedCategories,
    handleCategoryChange,
    categories
}) => {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    //  const [selectedCategory, setSelectedCategory] = useState('');

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
                    <option key={region.regionCode} value={region.regionCode}>
                        {region.regionName}
                    </option>
                ))}
            </select>

            {/* Division Dropdown */}
            {selectedRegion && (
                <select value={selectedDivision} onChange={handleDivisionChange}>
                    <option value="">Select Division</option>
                    {regions.find(region => region.regionCode === selectedRegion)
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
                    {regions.find(region => region.regionCode === selectedRegion)
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

// Defining prop types for type checking
SiteMenuBar.propTypes = {
    selectedRegion: PropTypes.string.isRequired,
    setSelectedRegion: PropTypes.func.isRequired,
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
    selectedOrganizers: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleOrganizerChange: PropTypes.func.isRequired,
    organizers: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SiteMenuBar;


/* old

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import UserStateRole from '@/components/UI/UserStateRole';
import CategoryFilter from '@/components/UI/CategoryFilter';
import Box from '@mui/material/Box';


const SiteMenuBar = ({
    selectedRegion,
    setSelectedRegion,
    regions,
    selectedOrganizers,
    handleOrganizerChange,
    organizers,
    selectedCategories,
    handleCategoryChange,
    categories
}) => {
    const [currentRole, setCurrentRole] = useState('anonymous');

    return (
        <AppBar position="static" sx={{ backgroundColor: 'black' }}>
            <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 1 }}>

                    <UserStateRole
                        currentRole={currentRole} setCurrentRole={setCurrentRole} />

                    <Select
                        value={selectedRegion || ""}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        style={{ color: 'white', marginLeft: '10px' }}
                        displayEmpty
                    >
                        <MenuItem value=""><em>Select Region</em></MenuItem>
                        {regions.map((region) => (
                            <MenuItem key={region._id} value={region.regionName}>{region.regionName}</MenuItem>
                        ))}
                    </Select>

                    <Select
                        multiple
                        value={selectedOrganizers}
                        onChange={handleOrganizerChange}
                        renderValue={() => 'Filter Organizers'}
                        style={{ color: 'white', marginLeft: '10px' }}
                        displayEmpty
                    >
                        {organizers.map((organizer) => (
                            <MenuItem key={organizer._id} value={organizer._id}>
                                <Checkbox checked={selectedOrganizers.includes(organizer._id)} />
                                <ListItemText primary={organizer.organizerName} />
                            </MenuItem>
                        ))}
                    </Select>

                </Box>

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <CategoryFilter
                        selectedCategories={selectedCategories}
                        handleCategoryChange={handleCategoryChange}
                        categories={categories}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

SiteMenuBar.propTypes = {
    selectedRegion: PropTypes.string,
    setSelectedRegion: PropTypes.func.isRequired,
    regions: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedOrganizers: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleOrganizerChange: PropTypes.func.isRequired,
    organizers: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SiteMenuBar;
*/