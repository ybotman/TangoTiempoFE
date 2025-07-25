'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

/**
 * Default filter values
 */
const DEFAULT_FILTERS = {
  categories: [],
  venues: [],
  organizers: [],
  searchTerm: '',
  aiRecommendations: false,
};

/**
 * Initial state
 */
const initialState = {
  locationMode: 'map',
  selectedCityIds: [],
  filters: DEFAULT_FILTERS,
  preferences: null,
  hasUnsavedChanges: false,
  isLoadingPreferences: false,
  isSavingPreferences: false,
  preferencesError: null,
};

/**
 * Event discovery reducer
 */
function eventDiscoveryReducer(state, action) {
  switch (action.type) {
    case 'SET_LOCATION_MODE':
      return {
        ...state,
        locationMode: action.payload,
        hasUnsavedChanges: true,
      };

    case 'SET_SELECTED_CITIES':
      return {
        ...state,
        selectedCityIds: action.payload,
        hasUnsavedChanges: true,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
        hasUnsavedChanges: true,
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        hasUnsavedChanges: true,
      };

    case 'LOAD_PREFERENCES_START':
      return {
        ...state,
        isLoadingPreferences: true,
        preferencesError: null,
      };

    case 'LOAD_PREFERENCES_SUCCESS':
      return {
        ...state,
        preferences: action.payload,
        locationMode: action.payload.locationMode,
        filters: action.payload.defaultFilters,
        isLoadingPreferences: false,
        hasUnsavedChanges: false,
      };

    case 'LOAD_PREFERENCES_ERROR':
      return {
        ...state,
        isLoadingPreferences: false,
        preferencesError: action.payload,
      };

    case 'SAVE_PREFERENCES_START':
      return {
        ...state,
        isSavingPreferences: true,
        preferencesError: null,
      };

    case 'SAVE_PREFERENCES_SUCCESS':
      return {
        ...state,
        isSavingPreferences: false,
        hasUnsavedChanges: false,
        preferences: {
          ...state.preferences,
          locationMode: state.locationMode,
          defaultFilters: state.filters,
        },
      };

    case 'SAVE_PREFERENCES_ERROR':
      return {
        ...state,
        isSavingPreferences: false,
        preferencesError: action.payload,
      };

    case 'SET_HAS_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Event discovery context
 */
const EventDiscoveryContext = createContext(undefined);

/**
 * Event discovery provider component
 */
export function EventDiscoveryProvider({ children }) {
  const [state, dispatch] = useReducer(eventDiscoveryReducer, initialState);
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const isAuthenticated = !!user;
  const saveTimeoutRef = useRef();

  /**
   * Load user preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated || !user?.preferences?.eventDiscovery) {
      return;
    }

    dispatch({ type: 'LOAD_PREFERENCES_START' });

    try {
      const preferences = user.preferences.eventDiscovery;
      dispatch({ type: 'LOAD_PREFERENCES_SUCCESS', payload: preferences });
    } catch (error) {
      console.error('Failed to load event discovery preferences:', error);
      dispatch({
        type: 'LOAD_PREFERENCES_ERROR',
        payload: 'Failed to load preferences',
      });
    }
  }, [isAuthenticated, user]);

  /**
   * Save user preferences
   */
  const savePreferences = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    dispatch({ type: 'SAVE_PREFERENCES_START' });

    try {
      const preferences = {
        locationMode: state.locationMode,
        defaultFilters: state.filters,
        // savedSearches: [], // TODO: Implement saved searches
      };

      // TODO: Implement API call to save preferences
      // await api.updateUserPreferences({ eventDiscovery: preferences });

      dispatch({ type: 'SAVE_PREFERENCES_SUCCESS' });
    } catch (error) {
      console.error('Failed to save event discovery preferences:', error);
      dispatch({
        type: 'SAVE_PREFERENCES_ERROR',
        payload: 'Failed to save preferences',
      });
    }
  }, [isAuthenticated, user, state.locationMode, state.filters, state.preferences]);

  /**
   * Auto-save preferences with debouncing
   */
  useEffect(() => {
    if (!state.hasUnsavedChanges || !isAuthenticated) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      savePreferences();
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.hasUnsavedChanges, isAuthenticated, savePreferences]);

  /**
   * Load preferences when user logs in
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPreferences();
    }
  }, [isAuthenticated, user, loadPreferences]);

  /**
   * Action handlers
   */
  const actions = useMemo(
    () => ({
      setLocationMode: (mode) => {
        dispatch({ type: 'SET_LOCATION_MODE', payload: mode });
      },
      setSelectedCities: (cityIds) => {
        dispatch({ type: 'SET_SELECTED_CITIES', payload: cityIds });
      },
      setFilters: (filters) => {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      },
      resetFilters: () => {
        dispatch({ type: 'RESET_FILTERS' });
      },
      savePreferences,
      loadPreferences,
    }),
    [savePreferences, loadPreferences]
  );

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <EventDiscoveryContext.Provider value={value}>
      {children}
    </EventDiscoveryContext.Provider>
  );
}

EventDiscoveryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use event discovery context
 */
export function useEventDiscovery() {
  const context = useContext(EventDiscoveryContext);
  if (!context) {
    throw new Error('useEventDiscovery must be used within EventDiscoveryProvider');
  }
  return context;
}

/**
 * Hook to use event filters
 */
export function useEventFilters() {
  const { state, actions } = useEventDiscovery();
  return {
    filters: state.filters,
    setFilters: actions.setFilters,
    resetFilters: actions.resetFilters,
  };
}

/**
 * Hook to use location mode
 */
export function useLocationMode() {
  const { state, actions } = useEventDiscovery();
  return {
    locationMode: state.locationMode,
    setLocationMode: actions.setLocationMode,
    selectedCityIds: state.selectedCityIds,
  };
}

/**
 * Hook to check if user has unsaved changes
 */
export function useHasUnsavedChanges() {
  const { state } = useEventDiscovery();
  return state.hasUnsavedChanges;
}

/**
 * Hook to get preference loading/saving state
 */
export function usePreferencesState() {
  const { state } = useEventDiscovery();
  return {
    isLoading: state.isLoadingPreferences,
    isSaving: state.isSavingPreferences,
    error: state.preferencesError,
    preferences: state.preferences,
  };
}