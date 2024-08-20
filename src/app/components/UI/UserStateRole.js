"use client";

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const UserStateRole = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);  // Clear user state on logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {user ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body1" color="textPrimary">
            {user.displayName || user.email}
          </Typography>
          <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
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
