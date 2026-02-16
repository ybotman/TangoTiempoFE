import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
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
import { useActivityLogger } from '@/hooks/useActivityLogger';
// TIEMPO-319: Removed fetchAllGeolocationData import - no longer needed for logout

// Define the standard role display order for consistency (static constant)
const ROLE_DISPLAY_ORDER = ['NamedUser', 'RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner'];

const SiteMenuBarUserDrawer = ({ userDrawerOpen, handleUserDrawerClose, showRoleMessage, readOnly = false }) => {
  const router = useRouter();
  const { user, logOut } = useContext(AuthContext);
  const { roles, selectedRole, selectRole } = useContext(RoleContext);
  const { logAuthEvent, logRoleChange, logActivity } = useActivityLogger();
  // Fetch roles using useRoles hook
  // const { roles: availableRoles } = useRoles();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [orderedUserRoles, setOrderedUserRoles] = useState([]);

  // Define role display mapping (backend role -> display name)
  const roleDisplayMap = {
    'NamedUser': 'Milonger@',
    'RegionalOrganizer': 'Organizer/Artist',
    'RegionalAdmin': 'RegionalAdmin', 
    'SystemAdmin': 'SystemAdmin',
    'SystemOwner': 'SystemOwner'
  };



  // Helper function to get conditional message for Regional Organizer
  const getConditionalMessage = (roInfo) => {
    if (!roInfo) return null;
    
    if (roInfo.isApproved && !roInfo.isEnabled) {
      return "Update your Organizer Settings to enable your organizer role.";
    } else if (!roInfo.isApproved) {
      return "You can apply to add events for free";
    }
    return null;
  };

  // When user or roles change, sort user's roles based on the standard order
  useEffect(() => {
    if (roles && roles.length > 0) {
      // Create a copy of roles array
      const userRoles = [...roles];
      
      // Sort the roles based on display order, any roles not in the standard list will be at the end
      userRoles.sort((a, b) => {
        const indexA = ROLE_DISPLAY_ORDER.indexOf(a);
        const indexB = ROLE_DISPLAY_ORDER.indexOf(b);
        
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

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    const previousRole = selectedRole;
    
    // Get display names for logging
    const previousRoleDisplay = roleDisplayMap[previousRole] || previousRole;
    const newRoleDisplay = roleDisplayMap[newRole] || newRole;
    
    // Log the role change with detailed information
    await logRoleChange(previousRole, newRole, {
      changedBy: 'user', // User initiated change
      location: 'UserDrawer',
      previousRoleDisplay: previousRoleDisplay,
      newRoleDisplay: newRoleDisplay,
      userId: user?.uid,
      userEmail: user?.email,
      userName: user?.displayName || `${user?.localUserInfo?.firstName} ${user?.localUserInfo?.lastName}`.trim() || 'Unknown User',
      timestamp: new Date().toISOString()
    });
    
    // Also log as a generic activity for better tracking
    await logActivity('ROLE_SELECTION', 'user_role', user?.uid, {
      from: previousRole,
      to: newRole,
      fromDisplay: previousRoleDisplay,
      toDisplay: newRoleDisplay,
      action: 'manual_switch',
      interface: 'drawer_menu'
    });
    
    selectRole(newRole);
    
    // TIEMPO-282: Redirect from Boston calendar to main calendar when switching to Regional Organizer
    if (typeof window !== 'undefined' && 
        window.location.pathname === '/calendar/boston' && 
        newRole === 'RegionalOrganizer') {
      router.push('/calendar');
    }
    
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
            <Typography variant="body2" color="text.secondary" align="center" sx={{ marginBottom: 2 }}>
              Are you new to TangoTiempo?
            </Typography>
            <Button variant="contained" color="primary" fullWidth href="/auth/login" sx={{ marginBottom: 1 }}>
              Sign In
            </Button>
            <Button variant="outlined" color="primary" fullWidth href="/auth/signup">
              Create Account
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
              <Box>
                <Typography variant="h6">{user.displayName || user.email}</Typography>
              </Box>
            </Stack>


            {readOnly ? (
              <Box sx={{ marginTop: 2, padding: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  👋 Welcome to Boston Tango Calendar!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  This calendar shows events in the Boston area.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Want to explore other regions or add your own events? Visit{' '}
                  <a
                    href="https://www.tangotiempo.com/calendar"
                    style={{ color: '#1976d2', fontWeight: 'bold' }}
                  >
                    tangotiempo.com
                  </a>
                  {' '}to set your location and access full features.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ marginTop: 2 }}>
                <Typography variant="subtitle1">Settings</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Choose your active role
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup value={selectedRole || 'NamedUser'} onChange={handleRoleChange}>
                    {orderedUserRoles.map((role) => (
                      <FormControlLabel
                        key={role}
                        value={role}
                        control={<Radio />}
                        label={roleDisplayMap[role] || role}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={() => setLogoutConfirmOpen(true)}
            >
              Log Out
            </Button>

            {/* Conditional Messages */}
            {getConditionalMessage(user.backendInfo?.regionalOrganizerInfo) && (
              <Box sx={{ marginTop: 2, padding: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {getConditionalMessage(user.backendInfo?.regionalOrganizerInfo)}
                </Typography>
              </Box>
            )}

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
                <Button
                  onClick={async () => {
                    // Track logout to Azure Functions (fire and forget)
                    // TIEMPO-319: Removed geolocation fetch - not needed, we have Firebase ID
                    const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';
                    try {
                      const token = user?.token || (await user?.getIdToken?.());

                      fetch(`${afUrl}/api/user/logout-track`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                          timezoneOffset: -new Date().getTimezoneOffset()
                          // No geolocation data - backend has Firebase ID from token
                        })
                      }).catch(err => console.warn('[Logout Tracking] Failed:', err.message));
                    } catch (err) {
                      console.warn('[Logout Tracking] Failed:', err.message);
                    }

                    // Log the logout event to Express Backend (existing)
                    await logAuthEvent('LOGOUT', true, {
                      userRole: selectedRole,
                      userId: user?.uid
                    });

                    // Perform the logout
                    logOut();
                  }}
                  color="secondary"
                  autoFocus>
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
  readOnly: PropTypes.bool,
};

export default SiteMenuBarUserDrawer;
