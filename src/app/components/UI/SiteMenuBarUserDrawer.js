import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Avatar,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';
// import { useRoles } from '@/hooks/useRoles';

const SiteMenuBarUserDrawer = ({ userDrawerOpen, handleUserDrawerClose, showRoleMessage }) => {
  const { user, logOut } = useContext(AuthContext);
  const { roles, selectedRole, selectRole } = useContext(RoleContext);
  // Fetch roles using useRoles hook
  // const { roles: availableRoles } = useRoles();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [orderedUserRoles, setOrderedUserRoles] = useState([]);

  // Define the standard role display order for consistency
  const roleDisplayOrder = ['NamedUser', 'RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner'];

  // When user or roles change, sort user's roles based on the standard order
  useEffect(() => {
    if (roles && roles.length > 0) {
      // Create a copy of roles array
      const userRoles = [...roles];
      
      // Sort the roles based on display order, any roles not in the standard list will be at the end
      userRoles.sort((a, b) => {
        const indexA = roleDisplayOrder.indexOf(a);
        const indexB = roleDisplayOrder.indexOf(b);
        
        // If both roles are in the order list, sort by the order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only a is in the order list, a comes first
        else if (indexA !== -1) {
          return -1;
        }
        // If only b is in the order list, b comes first
        else if (indexB !== -1) {
          return 1;
        }
        // If neither is in the list, sort alphabetically
        else {
          return a.localeCompare(b);
        }
      });
      
      setOrderedUserRoles(userRoles);
    } else {
      setOrderedUserRoles([]);
    }
  }, [roles]);

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    selectRole(newRole);
    handleUserDrawerClose(); // Close drawer after selection
    showRoleMessage(newRole); // Trigger message independently
  };

  return (
    <Drawer anchor="right" open={userDrawerOpen} onClose={handleUserDrawerClose}>
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
            <Button variant="contained" color="primary" fullWidth href="/auth/login" sx={{ marginBottom: 2 }}>
              Sign In
            </Button>
            <Typography variant="body2" color="text.secondary" align="center">
              New to TangoTiempo? Create an account when you sign in.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                alt={user.displayName || user.email}
                src={user.photoURL || '/defaultAvatar.png'}
                sx={{ width: 56, height: 56 }}
              />
              <Typography variant="h6">{user.displayName || user.email}</Typography>
            </Stack>

            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1">Select Role:</Typography>
              <FormControl component="fieldset">
                <RadioGroup value={selectedRole || 'NamedUser'} onChange={handleRoleChange}>
                  {orderedUserRoles.map((role) => (
                    <FormControlLabel key={role} value={role} control={<Radio />} label={role} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => setLogoutConfirmOpen(true)}
            >
              Log Out
            </Button>

            <Dialog
              open={logoutConfirmOpen}
              onClose={() => setLogoutConfirmOpen(false)}
              aria-labelledby="logout-confirmation-dialog-title"
            >
              <DialogTitle id="logout-confirmation-dialog-title">Confirm Logout</DialogTitle>
              <DialogContent>
                <DialogContentText>Are you sure you want to log out?</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setLogoutConfirmOpen(false)} color="primary">
                  No
                </Button>
                <Button onClick={logOut} color="secondary" autoFocus>
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

SiteMenuBarUserDrawer.propTypes = {
  userDrawerOpen: PropTypes.bool.isRequired,
  handleUserDrawerClose: PropTypes.func.isRequired,
  showRoleMessage: PropTypes.func.isRequired,
};

export default SiteMenuBarUserDrawer;
