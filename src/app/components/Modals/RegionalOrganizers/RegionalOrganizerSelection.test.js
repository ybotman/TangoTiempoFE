/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegionalOrganizerSelection from './RegionalOrganizerSelection';

// Mock the hooks
jest.mock('@/hooks/useOrganizers', () => ({
  useOrganizers: jest.fn(() => ({
    organizers: [
      { _id: 'org1', name: 'Organizer 1', isEventOrganizer: true },
      { _id: 'org2', name: 'Organizer 2', isEventOrganizer: true },
      { _id: 'org3', name: 'Organizer 3', isEventOrganizer: true }
    ],
    fetchLoading: false,
    error: null
  }))
}));

jest.mock('@/contexts/GeoLocationContext', () => ({
  useGeoLocation: jest.fn(() => ({
    selectedLocation: {
      city: { id: 'city1', name: 'Test City' }
    }
  }))
}));

describe('RegionalOrganizerSelection', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectOrganizers = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal title', () => {
    render(
      <RegionalOrganizerSelection
        open={true}
        onClose={mockOnClose}
        selectedOrganizers={[]}
        onSelectOrganizers={mockOnSelectOrganizers}
      />
    );
    
    // Check that the modal title is rendered
    expect(screen.getByText('Select Organizers')).toBeInTheDocument();
  });
  
  it('applies selection when Apply button is clicked', () => {
    render(
      <RegionalOrganizerSelection
        open={true}
        onClose={mockOnClose}
        selectedOrganizers={[]}
        onSelectOrganizers={mockOnSelectOrganizers}
      />
    );
    
    // Click Apply button
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    // Verify that onSelectOrganizers was called
    expect(mockOnSelectOrganizers).toHaveBeenCalled();
    
    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('closes modal when Cancel button is clicked', () => {
    render(
      <RegionalOrganizerSelection
        open={true}
        onClose={mockOnClose}
        selectedOrganizers={[]}
        onSelectOrganizers={mockOnSelectOrganizers}
      />
    );
    
    // Click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
    
    // Verify that onSelectOrganizers was NOT called
    expect(mockOnSelectOrganizers).not.toHaveBeenCalled();
  });
});