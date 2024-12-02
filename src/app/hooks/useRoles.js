// src/hooks/useRoles.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        'Fetching roles from:',
        `${process.env.NEXT_PUBLIC_BE_URL}/api/roles`
      );
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/roles`
      );
      console.log('Roles fetched:', response.data);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(error);
    } finally {
      setLoading(false);
      console.log('Finished fetching roles. Loading is now false.');
    }
  }, []);

  const getRoleByName = useCallback(
    (roleName) => {
      return roles.find((role) => role.roleName === roleName);
    },
    [roles]
  );

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    getRoleByName,
  };
};
