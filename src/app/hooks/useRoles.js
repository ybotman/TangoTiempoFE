import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/roles`, {
        params: { appId }, // Add appId as a query parameter
      });

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
