//app/hooks/useCategories.js
// Migration: Quinn - 2026-01-22 - Now uses apiUrlResolver for BE/AF switching

import { useState, useEffect } from 'react';
import { dedupeFetch } from '@/utils/dedupeFetch';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
      const apiBase = getApiBaseUrl();
      const fullUrl = `${apiBase}/api/categories`;
      // DIAGNOSTIC: log everything for intermittent empty-dropdown bug
      console.log('[useCategories] FIRE', { apiBase, appId, appIdType: typeof appId, fullUrl });
      try {
        const response = await dedupeFetch(fullUrl, {
          params: { appId },
        });
        console.log('[useCategories] RESPONSE', {
          status: response?.status,
          dataType: typeof response?.data,
          dataIsArray: Array.isArray(response?.data),
          dataKeys: response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
            ? Object.keys(response.data)
            : null,
          categoriesCount: Array.isArray(response?.data?.categories)
            ? response.data.categories.length
            : (Array.isArray(response?.data) ? response.data.length : 'n/a'),
        });
        if (Array.isArray(response.data)) {
          setCategories(response.data);
          console.log('[useCategories] SET (direct array):', response.data.length);
        } else if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
          console.log('[useCategories] SET (wrapped):', response.data.categories.length);
        } else {
          console.error('[useCategories] Invalid categories data format:', response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error('[useCategories] Error fetching categories:', error?.message, error?.response?.status, error?.response?.data);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useCategories;
