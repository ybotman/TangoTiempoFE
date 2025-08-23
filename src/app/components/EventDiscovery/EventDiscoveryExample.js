'use client';

import React, { useContext } from 'react';
import {
  useEventDiscovery,
  useEventFilters,
  useLocationMode,
  useHasUnsavedChanges,
  usePreferencesState,
} from '@/contexts/EventDiscoveryContext';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Example component demonstrating EventDiscoveryContext usage
 */
export default function EventDiscoveryExample() {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const isAuthenticated = !!user;
  const { state, actions } = useEventDiscovery();
  const { filters, setFilters, resetFilters } = useEventFilters();
  const { locationMode, setLocationMode } = useLocationMode();
  const hasUnsavedChanges = useHasUnsavedChanges();
  const { isLoading, isSaving, error } = usePreferencesState();

  // Handle category filter change
  const handleCategoryChange = (category) => {
    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    
    setFilters({ categories: newCategories });
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setFilters({ searchTerm: e.target.value });
  };

  // Handle AI recommendations toggle
  const handleAIToggle = () => {
    setFilters({ aiRecommendations: !filters.aiRecommendations });
  };

  // Manual save (if needed)
  const handleManualSave = async () => {
    try {
      await actions.savePreferences();
// TIEMPO-276: Security cleanup - removed logging
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Event Discovery Example</h2>

      {/* Location Mode Selector */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Location Mode</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setLocationMode('map')}
            className={`px-4 py-2 rounded ${
              locationMode === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setLocationMode('cities')}
            className={`px-4 py-2 rounded ${
              locationMode === 'cities'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Cities View
          </button>
        </div>
        {locationMode === 'cities' && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Selected Cities: {state.selectedCityIds.join(', ') || 'None'}
            </p>
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['Milonga', 'Workshop', 'Festival', 'Class', 'Practica'].map((category) => (
            <label key={category} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Search</h3>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={handleSearchChange}
          placeholder="Search events..."
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* AI Recommendations */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.aiRecommendations}
            onChange={handleAIToggle}
            className="rounded"
          />
          <span>Show AI Recommendations</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset Filters
        </button>
        {isAuthenticated && (
          <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        )}
      </div>

      {/* Status Messages */}
      <div className="space-y-1">
        {hasUnsavedChanges && isAuthenticated && (
          <p className="text-sm text-orange-600">
            You have unsaved changes (auto-saving in 2 seconds)
          </p>
        )}
        {isLoading && (
          <p className="text-sm text-blue-600">Loading preferences...</p>
        )}
        {error && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}
        {!isAuthenticated && (
          <p className="text-sm text-gray-600">
            Sign in to save your preferences
          </p>
        )}
      </div>

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-500">
          Debug State
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(
            {
              locationMode: state.locationMode,
              selectedCities: state.selectedCities,
              filters: state.filters,
              hasUnsavedChanges: state.hasUnsavedChanges,
              preferences: state.preferences,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}