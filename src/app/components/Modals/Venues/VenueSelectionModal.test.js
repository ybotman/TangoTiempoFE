/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueSelectionModal } from './VenueSelectionModal';
import { useVenueSelection } from '@/hooks/useVenueSelection';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// Mock dynamic imports since React-Leaflet requires client-side only components
jest.mock('next/dynamic', () => () => {
  return {
    __esModule: true,
    default: function Mock() {
      return <div data-testid="mocked-leaflet-component">Leaflet Component</div>;
    },
  };
});

// Mock hooks
jest.mock('@/hooks/useVenueSelection');
jest.mock('@/contexts/GeoLocationContext');

describe('VenueSelectionModal', () => {
  // Setup default mock returns
  beforeEach(() => {
    useGeoLocation.mockReturnValue({
      selectedLocation: {
        city: { id: 'city123', name: 'Boston', latitude: 42.3601, longitude: -71.0589 }
      }
    });
    
    useVenueSelection.mockReturnValue({
      filteredVenues: [
        { _id: 'venue1', name: 'Test Venue 1', latitude: 42.36, longitude: -71.05 },
        { _id: 'venue2', name: 'Test Venue 2', latitude: 42.37, longitude: -71.06 }
      ],
      selectedVenue: null,
      venueCategory: 'all',
      useDivisionScope: false,
      loading: false,
      error: null,
      selectVenue: jest.fn(),
      refreshVenues: jest.fn(),
      handleVenueCategoryChange: jest.fn(),
      handleScopeChange: jest.fn(),
      hasSelectedCity: true
    });
  });

  it('renders the modal with title when open', () => {
    render(<VenueSelectionModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText('Select Venue')).toBeInTheDocument();
  });

  it('shows "select city first" message when no city is selected', () => {
    useVenueSelection.mockReturnValue({
      ...useVenueSelection(),
      hasSelectedCity: false
    });
    
    render(<VenueSelectionModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText('Please select a city first')).toBeInTheDocument();
  });

  it('shows loading state when venues are being loaded', () => {
    useVenueSelection.mockReturnValue({
      ...useVenueSelection(),
      loading: true
    });
    
    render(<VenueSelectionModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText('Loading venues...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    useVenueSelection.mockReturnValue({
      ...useVenueSelection(),
      error: 'Failed to load venues',
      loading: false
    });
    
    render(<VenueSelectionModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText(/error loading venues/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<VenueSelectionModal open={true} onClose={onCloseMock} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});