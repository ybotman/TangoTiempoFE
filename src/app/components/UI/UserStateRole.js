import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { Box } from '@mui/material';

const UserStateRole = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
    </Box>
  );
};

export default UserStateRole;
