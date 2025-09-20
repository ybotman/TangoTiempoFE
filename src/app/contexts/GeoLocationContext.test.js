'use client';

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { GeoLocationProvider, useGeoLocation } from './GeoLocationContext';

// Mock the hooks and contexts used by GeoLocationContext
jest.mock('@/hooks/useGeoLocations', () => ({
  useGeoLocations: () => ({
    latitude: 42.3601,
    longitude: -71.0589,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/contexts/LocationAPIContext', () => ({
  useLocationAPI: () => ({
    fetchNearestCity: jest.fn(),
    fetchCities: jest.fn(),
    fetchRegions: jest.fn(),
    fetchDivisions: jest.fn(),
    loading: false,
    error: null,
  }),
}));


// Test component that uses the GeoLocationContext
const TestComponent = () => {
  const { selectedLocation, locationDisplayText } = useGeoLocation();
  return (
    <div>
      <div data-testid="region">{selectedLocation.region.name}</div>
      <div data-testid="division">{selectedLocation.division.name}</div>
      <div data-testid="city">{selectedLocation.city.name}</div>
      <div data-testid="display-text">{locationDisplayText}</div>
    </div>
  );
};

describe('GeoLocationContext', () => {
  it('provides correct location information', async () => {
    await act(async () => {
      render(
        <GeoLocationProvider>
          <TestComponent />
        </GeoLocationProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('region')).toHaveTextContent('Northeast');
      expect(screen.getByTestId('division')).toHaveTextContent('New England');
      expect(screen.getByTestId('city')).toHaveTextContent('Boston');
      expect(screen.getByTestId('display-text')).toHaveTextContent('Boston, New England, Northeast');
    });
  });
});