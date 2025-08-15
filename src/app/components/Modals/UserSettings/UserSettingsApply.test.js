/**
 * UserSettingsApply.test.js
 * Test suite for UserSettingsApply component to verify error handling and resilience
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSettingsApply from './UserSettingsApply';

// Mock the hooks
jest.mock('@/hooks/useUsers', () => ({
  useUsers: jest.fn()
}));

jest.mock('@/hooks/useRoles', () => ({
  useRoles: jest.fn()
}));

jest.mock('@/hooks/useOrganizers', () => ({
  useOrganizers: jest.fn()
}));

// Import the mocked hooks
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useOrganizers } from '@/hooks/useOrganizers';

describe('UserSettingsApply Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    useUsers.mockReturnValue({
      userData: {
        _id: 'user123',
        firebaseUserId: 'firebase123',
        roleIds: [],
        localUserInfo: {
          firstName: 'Test',
          lastName: 'User',
          userDefaults: { region: 'region123' }
        }
      },
      updateUserData: jest.fn().mockResolvedValue({}),
      loading: false
    });
    
    useRoles.mockReturnValue({
      roles: [
        { _id: 'role123', roleName: 'RegionalOrganizer' }
      ],
      loading: false
    });
    
    useOrganizers.mockReturnValue({
      createOrganizer: jest.fn().mockResolvedValue({ _id: 'org123' })
    });
  });
  
  test('renders properly with valid data', () => {
    render(<UserSettingsApply />);
    
    expect(screen.getByText('Apply for Organizer/Artist')).toBeInTheDocument();
    expect(screen.getByText('By applying, you can manage events in your region.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  test('handles loading state correctly', () => {
    // Mock loading state
    useUsers.mockReturnValue({
      userData: null,
      updateUserData: jest.fn(),
      loading: true
    });
    
    render(<UserSettingsApply />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
  });

  test('handles null userData gracefully', () => {
    useUsers.mockReturnValue({
      userData: null,
      updateUserData: jest.fn(),
      loading: false
    });
    
    render(<UserSettingsApply />);
    
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();
  });

  test('handles missing roles data gracefully', () => {
    useRoles.mockReturnValue({
      roles: null,
      loading: false
    });
    
    render(<UserSettingsApply />);
    
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();
  });

  test('handles apply action correctly', async () => {
    const mockUpdateUserData = jest.fn().mockResolvedValue({});
    const mockCreateOrganizer = jest.fn().mockResolvedValue({ _id: 'org123' });
    
    useUsers.mockReturnValue({
      userData: {
        _id: 'user123',
        firebaseUserId: 'firebase123',
        roleIds: [],
        localUserInfo: {
          firstName: 'Test',
          lastName: 'User',
          userDefaults: { region: 'region123' }
        }
      },
      updateUserData: mockUpdateUserData,
      loading: false
    });
    
    useOrganizers.mockReturnValue({
      createOrganizer: mockCreateOrganizer
    });
    
    render(<UserSettingsApply />);
    
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      // Verify updateUserData was called with role update
      expect(mockUpdateUserData).toHaveBeenCalledWith({ roleIds: ['role123'] });
      
      // Verify createOrganizer was called with correct data
      expect(mockCreateOrganizer).toHaveBeenCalledWith(expect.objectContaining({
        linkedUserLogin: 'user123',
        firebaseUserId: 'firebase123',
        name: 'Test User'
      }));
      
      // Verify second updateUserData call with organizer ID
      expect(mockUpdateUserData).toHaveBeenCalledWith({
        regionalOrganizerInfo: expect.objectContaining({
          organizerId: 'org123',
          isApproved: false
        })
      });
      
      // Verify success message
      expect(screen.getByText('Your application has been submitted successfully!')).toBeInTheDocument();
    });
  });
  
  test('shows error message when API calls fail', async () => {
    const mockError = new Error('API failure');
    const mockUpdateUserData = jest.fn().mockRejectedValue(mockError);
    
    useUsers.mockReturnValue({
      userData: {
        _id: 'user123',
        roleIds: [],
        localUserInfo: {
          firstName: 'Test',
          lastName: 'User'
        }
      },
      updateUserData: mockUpdateUserData,
      loading: false
    });
    
    render(<UserSettingsApply />);
    
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByText('API failure')).toBeInTheDocument();
    });
  });

  test('shows existing organizer status when user already has organizer ID', () => {
    useUsers.mockReturnValue({
      userData: {
        _id: 'user123',
        roleIds: ['role123'],
        regionalOrganizerInfo: {
          organizerId: 'org123',
          isApproved: true
        },
        localUserInfo: {
          firstName: 'Test',
          lastName: 'User'
        }
      },
      updateUserData: jest.fn(),
      loading: false
    });
    
    render(<UserSettingsApply />);
    
    expect(screen.getByText('You have successfully applied as an Organizer/Artist.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
  });
});