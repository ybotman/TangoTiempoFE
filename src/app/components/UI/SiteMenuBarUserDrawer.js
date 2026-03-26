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
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AuthContext } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import MessagesModal from '@/components/Modals/Messages/MessagesModal';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
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
  const { messages, unreadCount, acknowledgeMessage, loading: messagesLoading } = useMessages();
  // Fetch roles using useRoles hook
  // const { roles: availableRoles } = useRoles();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
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
                      <React.Fragment key={role}>
                        <FormControlLabel
                          value={role}
                          control={<Radio />}
                          label={roleDisplayMap[role] || role}
                        />
                        {/* Spotlighter coming soon - appears after NamedUser (Milonger@) */}
                        {role === 'NamedUser' && (
                          <FormControlLabel
                            value="Spotlighter"
                            control={<Radio disabled />}
                            label={
                              <Typography
                                component="span"
                                sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                              >
                                Spotlighter <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>(coming soon)</Typography>
                              </Typography>
                            }
                            disabled
                            sx={{ opacity: 0.6 }}
                          />
                        )}
                      </React.Fragment>
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

            {/* Messages Section - only show if there are messages */}
            {messages.length > 0 && (
            <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ padding: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MailOutlineIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2">
                  Messages
                </Typography>
                {unreadCount > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                      fontSize: '0.65rem'
                    }}
                  >
                    {unreadCount} unread
                  </Typography>
                )}
                <Box sx={{ flex: 1 }} />
                {/* New Message button - SA/SO only, Coming Soon */}
                {(selectedRole === 'SystemAdmin' || selectedRole === 'SystemOwner') && (
                  <Tooltip title="Coming Soon - Voice & Text Compose" arrow>
                    <span>
                      <IconButton
                        size="small"
                        disabled
                        sx={{ opacity: 0.5 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Role: <strong>{roleDisplayMap[selectedRole] || selectedRole || 'None'}</strong>
              </Typography>

              {/* Scrollable Message List */}
              <Box sx={{
                maxHeight: 200,
                overflowY: 'auto',
                backgroundColor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}>
                {messagesLoading ? (
                  <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: 'block', textAlign: 'center' }}>
                    Loading messages...
                  </Typography>
                ) : messages.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: 'block', textAlign: 'center', fontStyle: 'italic' }}>
                    No messages for this role
                  </Typography>
                ) : (
                  messages.map((msg, index) => (
                    <Box
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessageIndex(index);
                        setMessageModalOpen(true);
                      }}
                      sx={{
                        p: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                        backgroundColor: msg.receipt?.acknowledgedAt ? 'transparent' : 'primary.50',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { backgroundColor: 'action.hover' },
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        {msg.receipt?.acknowledgedAt ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mt: 0.3 }} />
                        ) : (
                          <MailIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.3 }} />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: msg.receipt?.acknowledgedAt ? 'normal' : 'bold' }}>
                            {msg.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {msg.body}
                          </Typography>
                        </Box>
                        {/* Dismiss button */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeMessage(msg.id);
                          }}
                          sx={{
                            p: 0.5,
                            opacity: msg.receipt?.acknowledgedAt ? 0.3 : 1,
                          }}
                          title={msg.receipt?.acknowledgedAt ? 'Already read' : 'Dismiss'}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
            </>
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

      {/* Message Detail Modal */}
      <MessagesModal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        messages={selectedMessageIndex !== null ? [messages[selectedMessageIndex]] : []}
        onAcknowledge={(msgId) => {
          acknowledgeMessage(msgId);
          setMessageModalOpen(false);
        }}
        currentIndex={0}
      />
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
