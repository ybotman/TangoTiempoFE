'use client';

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useUserLogins } from '@/hooks/useUserLogins';

export default function SystemAdminUserLogin() {
  const {
    userLogins,
    roles,
    organizers,
    loading,
    expandedUserId,
    editUserId,
    toggleRole,
    handleFieldChange,
    handleOrganizerChange,
    handleApprovalChange,
    handleAccordionChange,
    toggleEditMode,
    getRoleNames,
    hasUnsavedChanges,
    handleSaveChanges,
  } = useUserLogins();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Logins
      </Typography>
      {Array.isArray(userLogins) && userLogins.length > 0 ? (
        userLogins.map((user) => {
          const isExpanded = expandedUserId === user.firebaseUserId;
          const isEditing = editUserId === user.firebaseUserId;

          return (
            <Accordion
              key={user.firebaseUserId}
              expanded={isExpanded}
              onChange={() => handleAccordionChange(user.firebaseUserId)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {`${user.localUserInfo.firstName} ${user.localUserInfo.lastName} (${user.localUserInfo.loginUserName})`}
                </Typography>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEditMode(user.firebaseUserId);
                  }}
                  variant="outlined"
                  color={isEditing ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ ml: 2 }}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} alignItems="center">
                  {isEditing ? (
                    <>
                      <Grid item xs={4}>
                        <TextField
                          label="First Name"
                          value={user.localUserInfo.firstName}
                          onChange={(e) =>
                            handleFieldChange(user, 'firstName', e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Last Name"
                          value={user.localUserInfo.lastName}
                          onChange={(e) =>
                            handleFieldChange(user, 'lastName', e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Username"
                          value={user.localUserInfo.loginUserName}
                          onChange={(e) =>
                            handleFieldChange(
                              user,
                              'loginUserName',
                              e.target.value
                            )
                          }
                          fullWidth
                        />
                      </Grid>

                      {/* Organizer dropdown */}
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Organizer:
                        </Typography>
                        <Select
                          fullWidth
                          value={user.regionalOrganizerInfo.organizerId || ''}
                          onChange={(e) =>
                            handleOrganizerChange(user, e.target.value)
                          }
                        >
                          {organizers.map((organizer) => (
                            <MenuItem key={organizer._id} value={organizer._id}>
                              {organizer.shortName}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>

                      {/* Approval switch */}
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                user.regionalOrganizerInfo.isApproved || false
                              }
                              onChange={(e) =>
                                handleApprovalChange(user, e.target.checked)
                              }
                              color="primary"
                            />
                          }
                          label="Is Approved"
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          First Name:
                        </Typography>
                        <Typography>{user.localUserInfo.firstName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Last Name:
                        </Typography>
                        <Typography>{user.localUserInfo.lastName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Username:
                        </Typography>
                        <Typography>
                          {user.localUserInfo.loginUserName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Roles:
                        </Typography>
                        <Typography>{getRoleNames(user)}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                {isEditing && (
                  <Accordion sx={{ mt: 2 }} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" color="textSecondary">
                        Roles
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {roles.map((role) => (
                          <Box key={role._id}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={user.roleIds.includes(role._id)}
                                  onChange={() => toggleRole(user, role._id)}
                                  color="primary"
                                />
                              }
                              label={role.roleName}
                            />
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {isEditing && (
                  <Button
                    onClick={() => handleSaveChanges(user)}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={!hasUnsavedChanges(user)}
                  >
                    Save Changes
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Typography>No user data available</Typography>
      )}
    </Box>
  );
}
