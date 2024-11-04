// @/hooks/useUserLogins.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_BE_URL;

export const useUserLogins = () => {
  const [userLogins, setUserLogins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [originalUserData, setOriginalUserData] = useState({});

  // Fetch data from the API on component mount
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

  const toggleRole = useCallback(
    (user, roleId) => {
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
    },
    [userLogins]
  );

  const handleFieldChange = useCallback(
    (user, field, value) => {
      setUserLogins((prev) =>
        prev.map((u) =>
          u.firebaseUserId === user.firebaseUserId
            ? { ...u, localUserInfo: { ...u.localUserInfo, [field]: value } }
            : u
        )
      );
    },
    [userLogins]
  );

  const handleOrganizerChange = useCallback(
    (user, organizerId) => {
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
    },
    [userLogins]
  );

  const handleApprovalChange = useCallback(
    (user, isApproved) => {
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
    },
    [userLogins]
  );

  const handleAccordionChange = useCallback((userId) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  }, []);

  const toggleEditMode = useCallback(
    (userId) => {
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
    },
    [userLogins, editUserId]
  );

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

  return {
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
  };
};
