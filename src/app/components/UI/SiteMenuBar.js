// src/components/UI/SiteMenuBar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import UserStateRole from '@/components/UI/UserStateRole';


const SiteMenuBar = ({ selectedRegion, setSelectedRegion, regions, selectedOrganizers, handleOrganizerChange, organizers }) => {
    return (
        <AppBar position="static" sx={{ backgroundColor: 'black' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Welcome:
                </Typography>
                <Select
                    value={selectedRegion || ""}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    style={{ color: 'white' }}
                    displayEmpty
                >
                    <MenuItem value="">
                        <em>Select a Region</em>
                    </MenuItem>
                    {regions.map((region) => (
                        <MenuItem key={region._id} value={region.regionName}>
                            {region.regionName}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    multiple
                    value={selectedOrganizers}
                    onChange={handleOrganizerChange}
                    renderValue={() => 'Select Organizers'}  // Always show placeholder text
                    style={{ color: 'white' }}
                    displayEmpty
                >
                    {organizers.map((organizer) => (
                        <MenuItem key={organizer._id} value={organizer._id}>
                            <Checkbox checked={selectedOrganizers.includes(organizer._id)} />
                            <ListItemText primary={organizer.organizerName} />
                        </MenuItem>
                    ))}
                </Select>
                <UserStateRole />
            </Toolbar>
        </AppBar>
    );
};

export default SiteMenuBar;