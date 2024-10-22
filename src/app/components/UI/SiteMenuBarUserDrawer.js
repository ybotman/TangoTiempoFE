import React from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Avatar,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SiteMenuBarUserDrawer = ({
  userDrawerOpen,
  handleUserDrawerClose,
  user,
  roles,
  selectedRole,
  handleRoleChange,
  logOut,
}) => {
  return (
    <Drawer
      anchor="right"
      open={userDrawerOpen}
      onClose={handleUserDrawerClose}
    >
      <Box sx={{ width: 300, padding: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h6">User Management</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={handleUserDrawerClose}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {!user ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              href="/auth/login"
              sx={{ marginBottom: 1 }}
            >
              Log In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              href="/auth/signup"
              sx={{ marginBottom: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                alt={user.displayName || user.email}
                src={user.photoURL || '/defaultAvatar.png'}
                sx={{ width: 56, height: 56 }}
              />
              <Typography variant="h6">
                {user.displayName || user.email}
              </Typography>
            </Stack>

            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1">Select Role:</Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e)}
                >
                  {roles.map((role) => (
                    <FormControlLabel
                      key={role}
                      value={role}
                      control={<Radio />}
                      label={role}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ marginTop: 1 }}
                disabled
              >
                Request New Role
              </Button>
            </Box>

            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1">Message Admin:</Typography>
              <TextField
                placeholder="Feature coming soon..."
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                disabled
              />
            </Box>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={logOut}
            >
              Log Out
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

// Adding prop-types for validation
SiteMenuBarUserDrawer.propTypes = {
  userDrawerOpen: PropTypes.bool.isRequired,
  handleUserDrawerClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedRole: PropTypes.string.isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired,
};

export default SiteMenuBarUserDrawer;
