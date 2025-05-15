/**
 * UserSettingsFavorites.test.js
 * Test suite for UserSettingsFavorites component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSettingsFavorites from './UserSettingsFavorites';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a basic theme for testing MUI components
const theme = createTheme();

// Setup test renderer with ThemeProvider
const renderWithTheme = (ui, options) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>,
    options
  );
};

describe('UserSettingsFavorites Component', () => {
  // Sample test data
  const sampleUserData = {
    localUserInfo: {
      favoriteOrganizers: [
        { _id: 'org1', name: 'Organizer 1', fullName: 'Test Organizer 1' },
        { _id: 'org2', name: 'Organizer 2', fullName: 'Test Organizer 2' }
      ],
      subscribedEvents: [
        { _id: 'event1', title: 'Event 1' },
        { _id: 'event2', title: 'Event 2' }
      ]
    }
  };

  test('renders properly with valid data', () => {
    const mockUpdateUserData = jest.fn();
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={sampleUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Check headings
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Subscribed Events')).toBeInTheDocument();
    expect(screen.getByText('Favorite Organizers')).toBeInTheDocument();
    
    // Check events and organizers are displayed
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Test Organizer 1')).toBeInTheDocument();
    expect(screen.getByText('Test Organizer 2')).toBeInTheDocument();
    
    // Save button should be disabled initially (no changes)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('handles null userData gracefully', () => {
    const mockUpdateUserData = jest.fn();
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={null} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Check that empty state messages are shown
    expect(screen.getByText('No subscribed events.')).toBeInTheDocument();
    expect(screen.getByText('No favorite organizers.')).toBeInTheDocument();
  });

  test('handles empty arrays gracefully', () => {
    const mockUpdateUserData = jest.fn();
    const emptyUserData = {
      localUserInfo: {
        favoriteOrganizers: [],
        subscribedEvents: []
      }
    };
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={emptyUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Check that empty state messages are shown
    expect(screen.getByText('No subscribed events.')).toBeInTheDocument();
    expect(screen.getByText('No favorite organizers.')).toBeInTheDocument();
  });

  test('handles missing localUserInfo gracefully', () => {
    const mockUpdateUserData = jest.fn();
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={{}} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Check that empty state messages are shown
    expect(screen.getByText('No subscribed events.')).toBeInTheDocument();
    expect(screen.getByText('No favorite organizers.')).toBeInTheDocument();
  });

  test('removes an organizer when delete button is clicked', () => {
    const mockUpdateUserData = jest.fn();
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={sampleUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Find delete buttons (using the aria-label)
    const deleteButtons = screen.getAllByLabelText('remove');
    
    // Click the first delete button for organizers
    fireEvent.click(deleteButtons[2]); // Index 2 should be the first organizer delete button
    
    // Save button should be enabled after change
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    
    // Organizer 1 should be removed
    expect(screen.queryByText('Test Organizer 1')).not.toBeInTheDocument();
    
    // Other organizer should still be there
    expect(screen.getByText('Test Organizer 2')).toBeInTheDocument();
  });

  test('removes an event when delete button is clicked', () => {
    const mockUpdateUserData = jest.fn();
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={sampleUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Find delete buttons (using the aria-label)
    const deleteButtons = screen.getAllByLabelText('remove');
    
    // Click the first delete button for events
    fireEvent.click(deleteButtons[0]); // Index 0 should be the first event delete button
    
    // Save button should be enabled after change
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    
    // Event 1 should be removed
    expect(screen.queryByText('Event 1')).not.toBeInTheDocument();
    
    // Other event should still be there
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  test('calls updateUserData with correct data when Save is clicked', async () => {
    const mockUpdateUserData = jest.fn().mockResolvedValue({});
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={sampleUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Find delete buttons (using the aria-label)
    const deleteButtons = screen.getAllByLabelText('remove');
    
    // Remove one event and one organizer
    fireEvent.click(deleteButtons[0]); // Remove Event 1
    fireEvent.click(deleteButtons[2]); // Remove Organizer 1
    
    // Click Save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    // Check that updateUserData was called with the correct parameters
    await waitFor(() => {
      expect(mockUpdateUserData).toHaveBeenCalledWith({
        favoriteOrganizers: ['org2'], // Only org2 remains
        subscribedEvents: ['event2'], // Only event2 remains
      });
    });
  });

  test('handles updateUserData errors', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const mockUpdateUserData = jest.fn().mockRejectedValue(new Error('Update failed'));
    
    renderWithTheme(
      <UserSettingsFavorites 
        userData={sampleUserData} 
        updateUserData={mockUpdateUserData} 
      />
    );
    
    // Delete an item to enable the Save button
    const deleteButtons = screen.getAllByLabelText('remove');
    fireEvent.click(deleteButtons[0]);
    
    // Click Save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    // Wait for the error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error updating favorites:', expect.any(Error));
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});