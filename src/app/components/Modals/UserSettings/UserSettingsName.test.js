/**
 * UserSettingsName.test.js
 * Test suite for UserSettingsName component to verify error handling and resilience
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSettingsName from './UserSettingsName';
import { GeoLocationContext } from '@/contexts/GeoLocationContext';

// Mock the GeoLocationContext
const mockGeoLocationContext = {
  regions: [{ id: 'region1', name: 'Test Region' }],
  cities: [{ id: 'city1', name: 'Test City' }],
  venues: [{ id: 'venue1', name: 'Test Venue' }]
};

// Setup test utility function
const renderComponent = (props = {}) => {
  const defaultProps = {
    userData: {
      localUserInfo: {
        firstName: 'Test',
        lastName: 'User',
        userDefaults: {}
      }
    },
    updateUserData: jest.fn(),
    ...props
  };

  return render(
    <GeoLocationContext.Provider value={mockGeoLocationContext}>
      <UserSettingsName {...defaultProps} />
    </GeoLocationContext.Provider>
  );
};

describe('UserSettingsName Component', () => {
  test('renders properly with valid userData', () => {
    renderComponent();
    
    expect(screen.getByText('Update Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('Test');
    expect(screen.getByLabelText('Last Name')).toHaveValue('User');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('handles null userData gracefully', () => {
    renderComponent({ userData: null });
    
    expect(screen.getByText('Update Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('');
    expect(screen.getByLabelText('Last Name')).toHaveValue('');
  });

  test('handles undefined localUserInfo gracefully', () => {
    renderComponent({ userData: {} });
    
    expect(screen.getByLabelText('First Name')).toHaveValue('');
    expect(screen.getByLabelText('Last Name')).toHaveValue('');
  });

  test('enables Save button when form is modified', () => {
    renderComponent();
    
    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'New Name' } });
    
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  test('calls updateUserData with correct data on save', async () => {
    const mockUpdateUserData = jest.fn().mockResolvedValue({});
    renderComponent({ updateUserData: mockUpdateUserData });
    
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    
    fireEvent.change(firstNameInput, { target: { value: 'New Name' } });
    fireEvent.change(lastNameInput, { target: { value: 'New Last' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    await waitFor(() => {
      expect(mockUpdateUserData).toHaveBeenCalledWith({
        firstName: 'New Name',
        lastName: 'New Last',
        userDefaults: {}
      });
    });
  });

  test('shows error message when update fails', async () => {
    const mockUpdateUserData = jest.fn().mockRejectedValue(new Error('API Error'));
    renderComponent({ updateUserData: mockUpdateUserData });
    
    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'New Name' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});