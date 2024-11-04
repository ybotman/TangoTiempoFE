'use client';

import { useEffect, useState } from 'react';
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
import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_BE_URL;

export default function SystemAdminUserLogin() {
  const [userLogins, setUserLogins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [originalUserData, setOriginalUserData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, roleResponse, organizerResponse] =
          await Promise.all([
            axios.get(`${apiBaseUrl}/api/userlogins/all`),
            axios.get(`${apiBaseUrl}/api/roles`),
            axios.get(`${apiBaseUrl}/api/organizers`),
          ]);

        const userLoginsData = userResponse.data.map((user) => ({
          ...user,
          roleIds: user.roleIds.map((role) => role._id),
        }));

        setUserLogins(userLoginsData);
        setRoles(roleResponse.data);
        setOrganizers(organizerResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleRole = (user, roleId) => {
    const isRoleAssigned = user.roleIds.includes(roleId);
    const updatedRoleIds = isRoleAssigned
      ? user.roleIds.filter((id) => id !== roleId)
      : [...user.roleIds, roleId];

    setUserLogins((prev) =>
      prev.map((u) =>
        u.firebaseUserId === user.firebaseUserId
          ? { ...u, roleIds: updatedRoleIds }
          : u
      )
    );
  };

  const handleFieldChange = (user, field, value) => {
    setUserLogins((prev) =>
      prev.map((u) =>
        u.firebaseUserId === user.firebaseUserId
          ? { ...u, localUserInfo: { ...u.localUserInfo, [field]: value } }
          : u
      )
    );
  };

  const handleOrganizerChange = (user, organizerId) => {
    setUserLogins((prev) =>
      prev.map((u) =>
        u.firebaseUserId === user.firebaseUserId
          ? {
              ...u,
              regionalOrganizerInfo: {
                ...u.regionalOrganizerInfo,
                organizerId,
              },
            }
          : u
      )
    );
  };

  const handleApprovalChange = (user, isApproved) => {
    setUserLogins((prev) =>
      prev.map((u) =>
        u.firebaseUserId === user.firebaseUserId
          ? {
              ...u,
              regionalOrganizerInfo: {
                ...u.regionalOrganizerInfo,
                isApproved,
              },
            }
          : u
      )
    );
  };

  const handleAccordionChange = (userId) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const toggleEditMode = (userId) => {
    if (editUserId === userId) {
      setEditUserId(null);
      setOriginalUserData((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } else {
      setEditUserId(userId);
      const user = userLogins.find((u) => u.firebaseUserId === userId);
      setOriginalUserData((prev) => ({
        ...prev,
        [userId]: JSON.parse(JSON.stringify(user)),
      }));
    }
  };

  const getRoleNames = (user) => {
    return user.roleIds
      .map((roleId) => {
        const role = roles.find((role) => role._id === roleId);
        return role ? role.roleName : null;
      })
      .filter(Boolean)
      .join(', ');
  };

  const hasUnsavedChanges = (user) => {
    const originalData = originalUserData[user.firebaseUserId];
    if (!originalData) return false;

    return (
      user.localUserInfo.firstName !== originalData.localUserInfo.firstName ||
      user.localUserInfo.lastName !== originalData.localUserInfo.lastName ||
      user.localUserInfo.loginUserName !==
        originalData.localUserInfo.loginUserName ||
      JSON.stringify(user.roleIds.sort()) !==
        JSON.stringify(originalData.roleIds.sort()) ||
      user.regionalOrganizerInfo.organizerId !==
        originalData.regionalOrganizerInfo.organizerId ||
      user.regionalOrganizerInfo.isApproved !==
        originalData.regionalOrganizerInfo.isApproved
    );
  };

  const handleSaveChanges = async (user) => {
    try {
      await axios.put(`${apiBaseUrl}/api/userlogins/updateUserInfo`, {
        firebaseUserId: user.firebaseUserId,
        firstName: user.localUserInfo.firstName,
        lastName: user.localUserInfo.lastName,
        loginUserName: user.localUserInfo.loginUserName,
      });

      await axios.put(
        `${apiBaseUrl}/api/userlogins/${user.firebaseUserId}/roles`,
        {
          roleIds: user.roleIds,
        }
      );

      toggleEditMode(user.firebaseUserId);
    } catch (error) {
      console.error('Error saving user changes:', error);
    }
  };

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
