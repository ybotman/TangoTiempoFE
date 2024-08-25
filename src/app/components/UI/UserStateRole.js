"use client";

import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';  // Import useAuth hook

const UserStateRole = () => {
  const { user, role, loading, error, logOut } = useAuth(); // Use logOut from useAuth

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {user ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body1" color="textPrimary">
            {user.displayName || user.email} ({role})
          </Typography>
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
