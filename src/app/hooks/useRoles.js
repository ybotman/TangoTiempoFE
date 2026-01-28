// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID; // Get appId from environment

      // Migration: Now uses getApiBaseUrl() for BE/AF switching
      const response = await axios.get(`${getApiBaseUrl()}/api/roles`, {
        params: { appId }, // Add appId as a query parameter
      });

      setRoles(response.data.roles || response.data || []);
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
