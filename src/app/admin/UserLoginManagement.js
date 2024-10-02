import { React, useEffect, useState } from 'react';
import { listOfAllRoles } from '@/utils/masterData';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';

/**
 * Component to manage and display user login information with roles.
 */
const ManageUserLogins = () => {
  const [userLogins, setUserLogins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user logins when the component loads
  useEffect(() => {
    const fetchUserLogins = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userLogins/all`
        );
        setUserLogins(response.data);
      } catch (error) {
        console.error('Error fetching user logins:', error);
      }
    };

    fetchUserLogins();
  }, []);

  // Fetch all available roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/roles`
        );
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  // Open modal and set the current user and roles
  const handleEditClick = (user) => {
    setCurrentUser(user);
    const userRoles = user.roleIds.map((role) => role._id);
    setSelectedUserRoles(userRoles);
    setErrorMessage(''); // Clear previous error message
    setOpenModal(true);
  };

  // Handle role selection change
  const handleRoleChange = (event) => {
    setSelectedUserRoles(event.target.value);
  };

  // Handle apply button click to update roles via PUT request
  const handleApply = async () => {
    if (selectedUserRoles.length === 0) {
      setErrorMessage('You must select at least one role.');
      return;
    }

    if (currentUser) {
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/userLogins/${currentUser.firebaseUserId}/roles`,
          { roleIds: selectedUserRoles }
        );

        if (response.status === 200) {
          const updatedRoleIds = response.data.updatedRoles; // The returned role objects
          const updatedRoleIdsWithNames = updatedRoleIds.map((roleId) => ({
            _id: roleId,
            roleName: roles.find((r) => r._id === roleId)?.roleName,
          }));
          console.log('Updated roles:', updatedRoleIdsWithNames);
          // Update user roles in the same format as the API
          setUserLogins((prevLogins) =>
            prevLogins.map((user) =>
              user.firebaseUserId === currentUser.firebaseUserId
                ? { ...user, roleIds: updatedRoleIdsWithNames }
                : user
            )
          );

          console.log('Roles updated successfully');
          setOpenModal(false);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.error('Error updating roles:', error.response.data.message);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    }
  };

  return (
    <Box>
      {userLogins.length > 0 ? (
        userLogins.map((login) => (
          <Box
            key={login.firebaseUserInfo.email}
            mb={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5">
                {login.firebaseUserInfo.displayName}
              </Typography>
              <Typography variant="body1">
                Email: {login.firebaseUserInfo.email}
              </Typography>
              <Typography variant="body1">
                Roles: {login.roleIds.map((role) => role.roleName).join(', ')}
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => handleEditClick(login)}>
              Edit
            </Button>
          </Box>
        ))
      ) : (
        <Typography variant="body1">No user logins available.</Typography>
      )}

      {/* Modal for editing roles */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="edit-roles-modal"
        aria-describedby="edit-roles-for-user"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: '400px',
          }}
        >
          <Typography id="edit-roles-modal" variant="h6" mb={2}>
            Edit Roles for {currentUser?.firebaseUserInfo.displayName}
          </Typography>

          {/* Error message if roles are not selected */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              onChange={handleRoleChange}
              label="Role"
            >
              {Object.values(listOfAllRoles).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ManageUserLogins;
