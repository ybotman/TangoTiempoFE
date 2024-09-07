"use client";

import React, { useState, useEffect } from 'react';
import { Button, Stack, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const UserStateRole = () => {
    const { user, roles, loading, error, logOut, setRoles } = useAuth(); // Add setRoles function
    const [selectedRole, setSelectedRole] = useState('');

    // Set the initial selected role when roles are loaded
    useEffect(() => {
        if (roles && roles.length > 0 && !selectedRole) {  // Only set if no role is already selected
            setSelectedRole(roles[0].roleName); // Set the first roleName as default
            console.log("Initial role set to:", roles[0].roleName);  // Log initial role
        }
    }, [roles, selectedRole]);

    const handleRoleChange = (event) => {
        const newRole = event.target.value;
        console.log("Role changed to:", newRole);  // Log new role change
        setSelectedRole(newRole);

        // Update the role in useAuth (assuming role names are passed back globally)
        const updatedRoles = roles.map(role => {
            if (role.roleName === newRole) {
                return { ...role, selected: true };  // Mark the selected role as active
            }
            return role;
        });
        setRoles(updatedRoles); // Update roles globally
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
                                <MenuItem key={role.roleId} value={role.roleName}>
                                    {role.roleName}
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