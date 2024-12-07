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

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError(error);
    } finally {
      setLoading(false);
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
