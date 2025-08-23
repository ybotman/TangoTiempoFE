// @/components/Modals/RegionalOrganizers/RegionalOrganizersDelegated.js
'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, CircularProgress, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import Select from '@mui/material/Select';
import axios from 'axios';

const RegionalOrganizersDelegated = ({ organizerId = '', delegatedOrganizerIds = [], organizers = [], updateOrganizer }) => {
  // Ensure delegatedOrganizerIds is always a valid array
  const safeOrganizerIds = Array.isArray(delegatedOrganizerIds) ? delegatedOrganizerIds : [];

  // Log for debugging
  // TIEMPO-276: Security cleanup - removed logging
  const [delegatedOrganizers, setDelegatedOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');

  const fetchOrganizerById = async (organizerId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organizer:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Reset state when component mounts or dependencies change
    setError(null);

    const fetchDelegatedOrganizers = async () => {
      if (!organizerId) {
        setError('No organizer ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Only proceed if we have valid delegated organizer IDs
        if (safeOrganizerIds.length > 0) {
          const fetchedOrganizers = await Promise.all(
            safeOrganizerIds.map(async (id) => {
              if (!id) return null; // Skip empty IDs

              try {
                const organizer = await fetchOrganizerById(id);
                return organizer || null;
              } catch (error) {
                console.error(`Failed to fetch organizer with id ${id}`, error);
                return null;
              }
            })
          );
          setDelegatedOrganizers(fetchedOrganizers.filter((org) => org !== null));
        } else {
          // No delegated organizers to fetch
          setDelegatedOrganizers([]);
        }
      } catch (error) {
        console.error('Error fetching delegated organizers:', error);
        setError('Failed to load delegated organizers');
      } finally {
        setLoading(false);
      }
    };

    // Always call the function, but it will handle empty arrays internally
    fetchDelegatedOrganizers();
  }, [safeOrganizerIds, organizerId]);

  // Safely filter available organizers
  const availableOrganizers = Array.isArray(organizers)
    ? organizers.filter(
        (org) => org && org._id && org._id !== organizerId && !safeOrganizerIds.includes(org._id)
      )
    : [];

  const handleAddDelegatedOrganizer = async () => {
    if (!selectedOrganizerId || !organizerId) {
      setError('Cannot add organizer: missing data');
      return;
    }

    const updatedDelegatedIds = [...safeOrganizerIds, selectedOrganizerId];
    try {
      await updateOrganizer(organizerId, {
        delegatedOrganizerIds: updatedDelegatedIds,
      });
      setSelectedOrganizerId('');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error adding delegated organizer:', error);
      setError('Failed to add delegated organizer');
    }
  };

  const handleRemoveDelegatedOrganizer = async (idToRemove) => {
    if (!idToRemove || !organizerId) {
      setError('Cannot remove organizer: missing data');
      return;
    }

    const updatedDelegatedIds = safeOrganizerIds.filter((id) => id !== idToRemove);
    try {
      await updateOrganizer(organizerId, {
        delegatedOrganizerIds: updatedDelegatedIds,
      });
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error removing delegated organizer:', error);
      setError('Failed to remove delegated organizer');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Delegated Organizers</Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : delegatedOrganizers.length > 0 ? (
        delegatedOrganizers.map((org, index) =>
          org ? (
            <Box key={org._id || index} display="flex" alignItems="center" gap={1} mt={2} flexWrap="wrap">
              <Box flexGrow={1}>
                <Typography variant="body1">
                  <strong>Full Name:</strong> {org.fullName || 'No Full Name Available'}
                </Typography>
                <Typography variant="body1">
                  <strong>Short Name:</strong> {org.shortName || 'No Short Name Available'}
                </Typography>
              </Box>
              <Button variant="contained" color="secondary" onClick={() => handleRemoveDelegatedOrganizer(org._id)}>
                Remove
              </Button>
            </Box>
          ) : (
            <Typography key={index} variant="body1" color="error">
              Failed to load delegated organizer details.
            </Typography>
          )
        )
      ) : (
        <Typography>No delegated organizers assigned.</Typography>
      )}

      {/* UI for adding a delegated organizer */}
      <Box display="flex" gap={2} mt={3} alignItems="center" flexWrap="wrap">
        <FormControl variant="outlined" sx={{ minWidth: 200, flexGrow: 1 }}>
          <InputLabel id="select-organizer-label">Select Organizer</InputLabel>
          <Select
            labelId="select-organizer-label"
            value={selectedOrganizerId}
            onChange={(e) => setSelectedOrganizerId(e.target.value)}
            label="Select Organizer"
          >
            {availableOrganizers.map((org) => (
              <MenuItem key={org._id} value={org._id}>
                {org.fullName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDelegatedOrganizer}
          disabled={!selectedOrganizerId}
        >
          + Add Delegated Organizer
        </Button>
      </Box>
    </Box>
  );
};

RegionalOrganizersDelegated.propTypes = {
  organizerId: PropTypes.string,
  delegatedOrganizerIds: PropTypes.arrayOf(PropTypes.string),
  organizers: PropTypes.arrayOf(PropTypes.object),
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersDelegated;
