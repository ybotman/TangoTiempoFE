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