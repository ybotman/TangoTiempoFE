import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';

const RegionalOrganizersDelegated = ({
  organizerId,
  delegatedOrganizerIds,
  organizers = [],
  updateOrganizer,
}) => {
  const [delegatedOrganizers, setDelegatedOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');

  const fetchOrganizerById = async (organizerId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers/${organizerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching organizer:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchDelegatedOrganizers = async () => {
      setLoading(true);
      try {
        const fetchedOrganizers = await Promise.all(
          delegatedOrganizerIds.map(async (id) => {
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
      } catch (error) {
        console.error('Error fetching delegated organizers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (delegatedOrganizerIds && delegatedOrganizerIds.length > 0) {
      fetchDelegatedOrganizers();
    } else {
      setDelegatedOrganizers([]);
      setLoading(false);
    }
  }, [delegatedOrganizerIds]);

  const availableOrganizers = organizers.filter(
    (org) => org._id !== organizerId && !delegatedOrganizerIds.includes(org._id)
  );

  const handleAddDelegatedOrganizer = async () => {
    const updatedDelegatedIds = [...delegatedOrganizerIds, selectedOrganizerId];
    try {
      await updateOrganizer(organizerId, {
        delegatedOrganizerIds: updatedDelegatedIds,
      });
      setSelectedOrganizerId('');
    } catch (error) {
      console.error('Error adding delegated organizer:', error);
    }
  };

  const handleRemoveDelegatedOrganizer = async (idToRemove) => {
    const updatedDelegatedIds = delegatedOrganizerIds.filter(
      (id) => id !== idToRemove
    );
    try {
      await updateOrganizer(organizerId, {
        delegatedOrganizerIds: updatedDelegatedIds,
      });
    } catch (error) {
      console.error('Error removing delegated organizer:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Delegated Organizers</Typography>

      {loading ? (
        <CircularProgress />
      ) : delegatedOrganizers.length > 0 ? (
        delegatedOrganizers.map((org, index) =>
          org ? (
            <Box
              key={org._id || index}
              display="flex"
              alignItems="center"
              gap={1}
              mt={2}
            >
              <Box display="flex" flexDirection="column">
                <Typography variant="body1">
                  <strong>Full Name:</strong>{' '}
                  {org.fullName || org.name || 'No Full Name Available'}
                </Typography>
                <Typography variant="body1">
                  <strong>Short Name:</strong>{' '}
                  {org.shortName || 'No Short Name Available'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemoveDelegatedOrganizer(org._id)}
              >
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
      <Box display="flex" gap={2} mt={3} alignItems="center">
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="select-organizer-label">Select Organizer</InputLabel>
          <Select
            labelId="select-organizer-label"
            value={selectedOrganizerId}
            onChange={(e) => setSelectedOrganizerId(e.target.value)}
            label="Select Organizer"
          >
            {availableOrganizers.map((org) => (
              <MenuItem key={org._id} value={org._id}>
                {org.fullName || org.name}
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
  organizerId: PropTypes.string.isRequired,
  delegatedOrganizerIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  organizers: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateOrganizer: PropTypes.func.isRequired,
};

export default RegionalOrganizersDelegated;
