"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, TextField, CircularProgress, Switch } from '@mui/material';
import axios from 'axios';

function ManageUserLogins() {
    const [userLogins, setUserLogins] = useState([]);
    const [selectedUserLogin, setSelectedUserLogin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchUserLogins() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userlogins/all`);
                setUserLogins(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user logins:', error);
                setLoading(false);
            }
        }

        fetchUserLogins();
    }, []);

    const handleOpen = (userLogin = null) => {
        setSelectedUserLogin(
            userLogin || {
                localUserInfo: {
                    loginUserName: "",
                    firstName: "",
                    lastName: "",
                    icon: "",
                    defaultedCity: ""
                },
                localOrganizerInfo: {
                    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizers', required: true },
                    allowedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cities' }],
                    allowedDivisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Divisions' }],
                    allowedRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Regions' }]
                },

                localAdminInfo: {
                    adminRegions: [],
                    adminDivisions: [],
                    adminCities: []
                },
                active: true,
            }
        );
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedUserLogin(null);
        setOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUserLogin({ ...selectedUserLogin, [name]: value });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/userLogins/${selectedUserLogin._id}`,
                selectedUserLogin
            );
            setUserLogins(userLogins.map(ul => (ul._id === response.data._id ? response.data : ul)));
            handleClose();
        } catch (error) {
            console.error('Error updating user login:', error);
        }
    };

    const handleToggleActive = async (userLoginId, active) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/userLogins/${userLoginId}`,
                { active }
            );
            setUserLogins(userLogins.map(ul => (ul._id === response.data._id ? response.data : ul)));
        } catch (error) {
            console.error('Error updating active flag:', error);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6">Manage User Logins</Typography>
            {userLogins.map((userLogin) => (
                <Box key={userLogin._id} sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>{userLogin.localUserInfo.loginUserName}</Typography>
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>{userLogin.localUserInfo.firstName} {userLogin.localUserInfo.lastName}</Typography>
                    <Typography variant="subtitle1" sx={{ marginRight: 1 }}>Active:</Typography>
                    <Switch
                        checked={userLogin.active}
                        onChange={(e) => handleToggleActive(userLogin._id, e.target.checked)}
                        color="primary"
                    />
                    <Button size="small" onClick={() => handleOpen(userLogin)}>View / Edit</Button>
                </Box>
            ))}

            {selectedUserLogin && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{ width: 360, bgcolor: 'background.paper', margin: 'auto', padding: 2 }}>
                        <Typography id="modal-title" variant="h6" sx={{ marginBottom: 2 }}>
                            Edit User Login
                        </Typography>
                        <TextField
                            label="Login User Name"
                            name="loginUserName"
                            value={selectedUserLogin.localUserInfo.loginUserName || ""}
                            onChange={(e) => handleInputChange({ ...e, name: 'localUserInfo.loginUserName' })}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={selectedUserLogin.localUserInfo.firstName || ""}
                            onChange={(e) => handleInputChange({ ...e, name: 'localUserInfo.firstName' })}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={selectedUserLogin.localUserInfo.lastName || ""}
                            onChange={(e) => handleInputChange({ ...e, name: 'localUserInfo.lastName' })}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Icon"
                            name="icon"
                            value={selectedUserLogin.localUserInfo.icon || ""}
                            onChange={(e) => handleInputChange({ ...e, name: 'localUserInfo.icon' })}
                            fullWidth
                            margin="dense"
                        />
                        {/* Additional fields for Organizer and Admin Info */}
                        <Button onClick={handleSave} variant="contained" size="small" sx={{ mt: 2 }}>
                            Save
                        </Button>
                    </Box>
                </Modal>
            )}
        </Box>
    );
}

export default ManageUserLogins;