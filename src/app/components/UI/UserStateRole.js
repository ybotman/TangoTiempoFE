"use client";

import React, { useState, useEffect } from 'react';
import { Button, Stack, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const UserStateRole = () => {
    const { user, roles, loading, error, logOut } = useAuth(); // Get roles instead of role
    const [selectedRole, setSelectedRole] = useState('');

    // Set the initial selected role when roles are loaded
    useEffect(() => {
        if (roles && roles.length > 0) {
            setSelectedRole(roles[0]); // Set the first role as default
        }
    }, [roles]);

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" color="textPrimary">
                        {user.displayName || user.email}
                    </Typography>

                    {/* Dropdown to select the role */}
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            label="Role"
                        >
                            {roles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant="outlined" color="inherit" size="small" onClick={logOut}>
                        Log Out
                    </Button>
                </Stack>
            ) : (
                <Stack direction="row" spacing={1}>
                    <Link href="/auth/login" passHref>
                        <Button variant="contained" color="primary" size="small">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/auth/signup" passHref>
                        <Button variant="contained" color="secondary" size="small">
                            Sign Up
                        </Button>
                    </Link>
                </Stack>
            )}
        </Box>
    );
};

export default UserStateRole;
