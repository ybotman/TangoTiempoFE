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
import { useUsers } from '@/hooks/useUsers';

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
        filters: {
          ...state.filters,
          aiRecommendations: action.payload.aiRecommendations || false,
          categories: action.payload.categories || [],
          venues: action.payload.venues || [],
          organizers: action.payload.organizers || [],
          searchTerm: action.payload.searchTerm || '',
        },
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
  
  // Get userData and updateUserData from useUsers hook
  const { userData, updateUserData } = useUsers();

  /**
   * Load user preferences
   */
  const loadPreferences = useCallback(() => {
    if (!isAuthenticated || !userData?.localUserInfo?.userDefaults) {
      return;
    }

    dispatch({ type: 'LOAD_PREFERENCES_START' });

    try {
      const userDefaults = userData.localUserInfo.userDefaults;
      
      // Load AI preference from searchSettings
      const aiRecommendations = userDefaults.searchSettings?.includeAiGenerated || false;
      
      // Load event discovery filters if they exist
      const eventFilters = userDefaults.eventDiscoveryFilters || {};
      
      const preferences = {
        aiRecommendations,
        categories: eventFilters.categories || [],
        venues: eventFilters.venues || [],
        organizers: eventFilters.organizers || [],
        searchTerm: eventFilters.searchTerm || '',
      };
      
      dispatch({ type: 'LOAD_PREFERENCES_SUCCESS', payload: preferences });
    } catch (error) {
      console.error('Failed to load event discovery preferences:', error);
      dispatch({
        type: 'LOAD_PREFERENCES_ERROR',
        payload: 'Failed to load preferences',
      });
    }
  }, [isAuthenticated, userData]);

  /**
   * Save user preferences
   */
  const savePreferences = useCallback(async () => {
    if (!isAuthenticated || !user || !updateUserData) {
      return;
    }

    dispatch({ type: 'SAVE_PREFERENCES_START' });

    try {
      // Prepare the update data structure
      const updateData = {
        localUserInfo: {
          userDefaults: {
            // Update AI preference in searchSettings
            searchSettings: {
              includeAiGenerated: state.filters.aiRecommendations
            },
            // Store other event discovery filters
            eventDiscoveryFilters: {
              categories: state.filters.categories,
              venues: state.filters.venues,
              organizers: state.filters.organizers,
              searchTerm: state.filters.searchTerm
            }
          }
        }
      };

      // Call the updateUserData function from useUsers hook
      await updateUserData(updateData);
      
      // TIEMPO-276: Security cleanup - removed preferences logging
      dispatch({ type: 'SAVE_PREFERENCES_SUCCESS' });
    } catch (error) {
      console.error('Failed to save event discovery preferences:', error);
      dispatch({
        type: 'SAVE_PREFERENCES_ERROR',
        payload: error.message || 'Failed to save preferences',
      });
    }
  }, [isAuthenticated, user, state.filters, updateUserData]);

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
   * Load preferences when user logs in or userData changes
   */
  useEffect(() => {
    if (isAuthenticated && userData) {
      loadPreferences();
    }
  }, [isAuthenticated, userData, loadPreferences]);

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