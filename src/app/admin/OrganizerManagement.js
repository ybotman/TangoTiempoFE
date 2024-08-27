"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, TextField, Select, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';

function ManageOrganizers() {
    const [organizers, setOrganizers] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [organizerResponse, regionResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organizers/all`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/regions`)
                ]);
                setOrganizers(organizerResponse.data);
                setRegions(regionResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    const handleRegionChange = (regionId) => {
        setSelectedOrganizer({ ...selectedOrganizer, organizerRegion: regionId });
        const region = regions.find(r => r._id === regionId);
        setSelectedRegion(region);
        setSelectedDivision(null); // Clear division and city selections
        setSelectedOrganizer({ ...selectedOrganizer, organizerDivision: "", organizerCity: "" });
    };

    const handleDivisionChange = (divisionId) => {
        setSelectedOrganizer({ ...selectedOrganizer, organizerDivision: divisionId });
        const division = selectedRegion.divisions.find(d => d._id === divisionId);
        setSelectedDivision(division);
        setSelectedOrganizer({ ...selectedOrganizer, organizerCity: "" }); // Clear city selection
    };

    const handleCityChange = (cityId) => {
        setSelectedOrganizer({ ...selectedOrganizer, organizerCity: cityId });
    };

    const handleOpen = (organizer) => {
        setSelectedOrganizer(organizer);
        const region = regions.find(r => r._id === organizer.organizerRegion);
        setSelectedRegion(region);
        if (region) {
            const division = region.divisions.find(d => d._id === organizer.organizerDivision);
            setSelectedDivision(division);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedOrganizer(null);
        setSelectedRegion(null);
        setSelectedDivision(null);
        setOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedOrganizer({ ...selectedOrganizer, [name]: value });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/organizers/${selectedOrganizer._id}`,
                selectedOrganizer
            );
            setOrganizers(organizers.map(org => (org._id === response.data._id ? response.data : org)));
            handleClose();
        } catch (error) {
            console.error('Error updating organizer:', error);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6">Manage Organizers</Typography>
            {organizers.map((organizer) => (
                <Box key={organizer._id} sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1">{organizer.name}</Typography>
                    <Button size="small" onClick={() => handleOpen(organizer)}>View / Edit</Button>
                </Box>
            ))}

            {selectedOrganizer && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{ width: 360, bgcolor: 'background.paper', margin: 'auto', padding: 2 }}>
                        <Typography id="modal-title" variant="h6" sx={{ marginBottom: 2 }}>
                            Edit Organizer
                        </Typography>
                        <TextField
                            label="Name"
                            name="name"
                            value={selectedOrganizer.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Short Name"
                            name="shortName"
                            value={selectedOrganizer.shortName}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Firebase ID"
                            name="firebaseUserId"
                            value={selectedOrganizer.firebaseUserId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <Select
                            label="Region"
                            name="organizerRegion"
                            value={selectedOrganizer.organizerRegion || ""}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            fullWidth
                            margin="dense"
                        >
                            {regions.map(region => (
                                <MenuItem key={region._id} value={region._id}>
                                    {region.regionName}
                                </MenuItem>
                            ))}
                        </Select>
                        <Select
                            label="Division"
                            name="organizerDivision"
                            value={selectedOrganizer.organizerDivision || ""}
                            onChange={(e) => handleDivisionChange(e.target.value)}
                            fullWidth
                            margin="dense"
                            disabled={!selectedRegion}
                        >
                            {selectedRegion?.divisions.map(division => (
                                <MenuItem key={division._id} value={division._id}>
                                    {division.divisionName}
                                </MenuItem>
                            ))}
                        </Select>
                        <Select
                            label="City"
                            name="organizerCity"
                            value={selectedOrganizer.organizerCity || ""}
                            onChange={(e) => handleCityChange(e.target.value)}
                            fullWidth
                            margin="dense"
                            disabled={!selectedDivision}
                        >
                            {selectedDivision?.majorCities.map(city => (
                                <MenuItem key={city._id} value={city._id}>
                                    {city.cityName}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            label="URL"
                            name="url"
                            value={selectedOrganizer.url}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={selectedOrganizer.description}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={selectedOrganizer.phone}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Public Email"
                            name="publicEmail"
                            value={selectedOrganizer.publicEmail}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Login ID"
                            name="loginId"
                            value={selectedOrganizer.loginId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Payment Tier"
                            name="paymentTier"
                            value={selectedOrganizer.paymentTier}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                        />
                        <Button onClick={handleSave} variant="contained" size="small" sx={{ mt: 2 }}>
                            Save
                        </Button>
                    </Box>
                </Modal>
            )}
        </Box>
    );
}
export default ManageOrganizers;