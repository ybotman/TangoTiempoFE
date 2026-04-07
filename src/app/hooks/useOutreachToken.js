// src/hooks/useOutreachToken.js
// Manages outreach token lifecycle: URL detection, sessionStorage persistence,
// API resolution, and prefill data exposure.
// Backend endpoints are placeholder until Fulton delivers them.

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';

const SESSION_KEY_TOKEN = 'outreach_orgToken';
const SESSION_KEY_REF = 'outreach_ref';

export const useOutreachToken = () => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null);
  const [ref, setRef] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [tokenMeta, setTokenMeta] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const resolvedRef = useRef(false);

  // Step 1: Detect token from URL or sessionStorage (survives auth redirect)
  useEffect(() => {
    const urlToken = searchParams.get('orgToken');
    const urlRef = searchParams.get('ref');

    if (urlToken) {
      // Token in URL — persist to sessionStorage for auth redirect survival
      sessionStorage.setItem(SESSION_KEY_TOKEN, urlToken);
      if (urlRef) sessionStorage.setItem(SESSION_KEY_REF, urlRef);
      setToken(urlToken);
      setRef(urlRef || 'outreach');
    } else {
      // No token in URL — check sessionStorage (returning from auth redirect)
      const savedToken = sessionStorage.getItem(SESSION_KEY_TOKEN);
      const savedRef = sessionStorage.getItem(SESSION_KEY_REF);
      if (savedToken) {
        setToken(savedToken);
        setRef(savedRef || 'outreach');
      }
    }
  }, [searchParams]);

  // Step 2: Resolve token via backend API
  const resolveToken = useCallback(async (tokenValue) => {
    if (!tokenValue || resolvedRef.current) return;
    resolvedRef.current = true;

    setResolving(true);
    setTokenError(null);

    try {
      const response = await axios.get(
        `${getApiBaseUrl()}/api/outreach/resolve-token`,
        {
          params: { token: tokenValue },
          timeout: 10000
        }
      );

      if (response.data?.valid) {
        setPrefillData(response.data.prefill || {});
        setTokenMeta(response.data.metadata || {});
      } else {
        setTokenError(response.data?.reason || 'invalid_token');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setTokenError('token_not_found');
      } else if (error.response?.status === 410) {
        setTokenError('token_expired');
      } else if (error.response?.status === 409) {
        setTokenError('token_already_used');
      } else {
        // Backend not available yet (expected during scaffolding)
        console.warn('[useOutreachToken] resolve-token endpoint not available:', error.message);
        setTokenError('endpoint_unavailable');
      }
    } finally {
      setResolving(false);
    }
  }, []);

  // Step 3: Track outreach events
  const trackEvent = useCallback(async (eventName, extraData = {}) => {
    if (!token) return;

    try {
      await axios.post(
        `${getApiBaseUrl()}/api/outreach/track`,
        {
          token,
          event: eventName,
          timestamp: new Date().toISOString(),
          ...extraData
        },
        { timeout: 5000 }
      );
    } catch (error) {
      // Tracking is fire-and-forget — don't block UX
      console.warn('[useOutreachToken] track endpoint not available:', error.message);
    }
  }, [token]);

  // Step 4: Clean up sessionStorage after successful submission
  const clearToken = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY_TOKEN);
    sessionStorage.removeItem(SESSION_KEY_REF);
    setToken(null);
    setRef(null);
    setPrefillData(null);
    setTokenMeta(null);
  }, []);

  // Auto-resolve when token is available
  useEffect(() => {
    if (token && !resolvedRef.current) {
      resolveToken(token);
    }
  }, [token, resolveToken]);

  return {
    // State
    hasOutreachToken: !!token,
    token,
    ref,
    prefillData,
    tokenMeta,
    resolving,
    tokenError,

    // Actions
    resolveToken,
    trackEvent,
    clearToken
  };
};
