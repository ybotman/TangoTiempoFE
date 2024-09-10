import React from 'react';
import { Button, Stack, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const UserStateRole = () => {
    const { user, availableRoles, selectedRole, setSelectedRole, logOut } = useAuth();

    const handleRoleChange = (event) => {
        const newRole = event.target.value;
        console.log("Role changed to:", newRole);  // Debugging
        setSelectedRole(newRole);  // Update global selected role
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" color="textPrimary">
                        {user.displayName || user.email}
                    </Typography>

                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            label="Role"
                        >
                            {availableRoles.map((role) => (
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
                    {/* Login and Sign Up options */}
                </Stack>
            )}
        </Box>
    );
};

export default UserStateRole;