/**
 * CreateEventDetailsGrants.js
 * TIEMPO-388: Grants tab for Edit Event Modal
 *
 * Contains the Organizers section (moved from BASIC tab):
 * - Author (original creator) - read-only
 * - Owner - dropdown for RA, read-only for RO
 * - Alternate (shown on calendar)
 * - Granted (not shown, can edit)
 */

import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import { useOrganizers } from '@/hooks/useOrganizers';

const CreateEventDetailsGrants = ({ eventData, setEventData, editMode = false, organizer = null }) => {
  const { user, selectedRole } = useContext(AuthContext);

  // Fetch ALL organizers for dropdown (no filtering) - use type-ahead for usability
  const { organizers, loading: loadingOrganizers } = useOrganizers({ skipLocationFilter: true });

  // Handle organizer selection from Autocomplete (for RegionalAdmin)
  const handleOrganizerChange = (event, newValue) => {
    if (!newValue) {
      setEventData(prevData => ({
        ...prevData,
        ownerOrganizerID: '',
        ownerOrganizerName: '',
        ownerOrganizerShortName: ''
      }));
      return;
    }
    setEventData(prevData => ({
      ...prevData,
      ownerOrganizerID: newValue._id,
      ownerOrganizerName: newValue.fullName || '',
      ownerOrganizerShortName: newValue.shortName || newValue.fullName || ''
    }));
  };

  // Handle alternate organizer selection from Autocomplete (for RO and RA)
  const handleAlternateOrganizerChange = (event, newValue) => {
    if (!newValue) {
      setEventData(prevData => ({
        ...prevData,
        alternateOrganizerID: '',
        alternateOrganizerName: ''
      }));
      return;
    }
    setEventData(prevData => ({
      ...prevData,
      alternateOrganizerID: newValue._id,
      alternateOrganizerName: newValue.fullName || newValue.shortName || ''
    }));
  };

  // Handle granted organizer selection from Autocomplete (for RO and RA)
  // Granted organizer can edit the event but is NOT shown on event display
  const handleGrantedOrganizerChange = (event, newValue) => {
    if (!newValue) {
      setEventData(prevData => ({
        ...prevData,
        grantedOrganizerID: '',
        grantedOrganizerName: ''
      }));
      return;
    }
    setEventData(prevData => ({
      ...prevData,
      grantedOrganizerID: newValue._id,
      grantedOrganizerName: newValue.fullName || newValue.shortName || ''
    }));
  };

  // Memoize selected organizer objects for Autocomplete
  const selectedOrganizer = useMemo(() => {
    if (!eventData.ownerOrganizerID) return null;
    return organizers.find(org => org._id === eventData.ownerOrganizerID) || null;
  }, [eventData.ownerOrganizerID, organizers]);

  const selectedAlternateOrganizer = useMemo(() => {
    if (!eventData.alternateOrganizerID) return null;
    return organizers.find(org => org._id === eventData.alternateOrganizerID) || null;
  }, [eventData.alternateOrganizerID, organizers]);

  const selectedGrantedOrganizer = useMemo(() => {
    if (!eventData.grantedOrganizerID) return null;
    return organizers.find(org => org._id === eventData.grantedOrganizerID) || null;
  }, [eventData.grantedOrganizerID, organizers]);

  // Only show for RO or RA roles
  if (selectedRole !== 'RegionalAdmin' && selectedRole !== 'RegionalOrganizer') {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          Organizer settings are only available for Regional Organizers and Regional Admins.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Event Organizers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage who owns and can edit this event.
      </Typography>

      <Grid container spacing={2}>
        {/* Column 1: Author (grey) then Owner */}
        <Grid item xs={12} sm={6}>
          <Grid container spacing={2}>
            {/* Author - read-only, grey */}
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Author (original creator)"
                value={
                  // First check if event has author data
                  eventData.authorOrganizerShortName ||
                  eventData.authorOrganizerName ||
                  // For NEW events only: fall back to logged-in user's organizer
                  (!editMode ? (
                    organizer?.shortName ||
                    organizer?.fullName ||
                    user?.backendInfo?.regionalOrganizerInfo?.organizerShortName ||
                    user?.backendInfo?.regionalOrganizerInfo?.organizerName ||
                    user?.displayName ||
                    'You'
                  ) : '(Not recorded)')
                }
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{ bgcolor: 'grey.200', '& .MuiInputBase-input': { color: 'text.secondary', fontStyle: 'italic' } }}
                helperText="The original creator of this event (read-only)"
              />
            </Grid>

            {/* Owner - dropdown for RA, read-only for RO */}
            <Grid item xs={12}>
              {selectedRole === 'RegionalAdmin' ? (
                <Autocomplete
                  size="small"
                  options={organizers}
                  loading={loadingOrganizers}
                  value={selectedOrganizer}
                  onChange={handleOrganizerChange}
                  getOptionLabel={(option) => {
                    if (!option || typeof option !== 'object') return '';
                    const name = option.fullName || option.organizerName || option.name || '';
                    const short = option.shortName || option.organizerShortName || '';
                    return short ? `${name} (${short})` : name;
                  }}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter(option => {
                      const fullName = (option.fullName || option.organizerName || option.name || '').toLowerCase();
                      const shortName = (option.shortName || option.organizerShortName || '').toLowerCase();
                      return fullName.includes(searchTerm) || shortName.includes(searchTerm);
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Owner *"
                      size="small"
                      required
                      error={!eventData.ownerOrganizerID}
                      helperText="The organizer who owns this event"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingOrganizers ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                  disablePortal
                />
              ) : (
                <TextField
                  size="small"
                  label="Owner"
                  value={eventData.ownerOrganizerShortName || eventData.ownerOrganizerName || organizer?.shortName || 'Loading...'}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ bgcolor: 'action.hover' }}
                  helperText="Your organizer profile (read-only for RO)"
                />
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Column 2: Alternate then Granted */}
        <Grid item xs={12} sm={6}>
          <Grid container spacing={2}>
            {/* Alternate - shown on calendar */}
            <Grid item xs={12}>
              <Autocomplete
                size="small"
                options={organizers}
                loading={loadingOrganizers}
                value={selectedAlternateOrganizer}
                onChange={handleAlternateOrganizerChange}
                getOptionLabel={(option) => {
                  if (!option || typeof option !== 'object') return '';
                  const name = option.fullName || option.organizerName || option.name || '';
                  const short = option.shortName || option.organizerShortName || '';
                  return short ? `${name} (${short})` : name;
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(option => {
                    const fullName = (option.fullName || option.organizerName || option.name || '').toLowerCase();
                    const shortName = (option.shortName || option.organizerShortName || '').toLowerCase();
                    return fullName.includes(searchTerm) || shortName.includes(searchTerm);
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Alternate (shown on calendar)"
                    size="small"
                    helperText="Display a different organizer name on the calendar"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOrganizers ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                fullWidth
                disablePortal
              />
            </Grid>

            {/* Granted - not shown, can edit */}
            <Grid item xs={12}>
              <Autocomplete
                size="small"
                options={organizers}
                loading={loadingOrganizers}
                value={selectedGrantedOrganizer}
                onChange={handleGrantedOrganizerChange}
                getOptionLabel={(option) => {
                  if (!option || typeof option !== 'object') return '';
                  const name = option.fullName || option.organizerName || option.name || '';
                  const short = option.shortName || option.organizerShortName || '';
                  return short ? `${name} (${short})` : name;
                }}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(option => {
                    const fullName = (option.fullName || option.organizerName || option.name || '').toLowerCase();
                    const shortName = (option.shortName || option.organizerShortName || '').toLowerCase();
                    return fullName.includes(searchTerm) || shortName.includes(searchTerm);
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Granted (not shown, can edit)"
                    size="small"
                    helperText="Grant another organizer permission to edit this event"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOrganizers ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                fullWidth
                disablePortal
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

CreateEventDetailsGrants.propTypes = {
  eventData: PropTypes.shape({
    ownerOrganizerID: PropTypes.string,
    ownerOrganizerName: PropTypes.string,
    ownerOrganizerShortName: PropTypes.string,
    authorOrganizerName: PropTypes.string,
    authorOrganizerShortName: PropTypes.string,
    alternateOrganizerID: PropTypes.string,
    alternateOrganizerName: PropTypes.string,
    grantedOrganizerID: PropTypes.string,
    grantedOrganizerName: PropTypes.string
  }).isRequired,
  setEventData: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  organizer: PropTypes.shape({
    shortName: PropTypes.string,
    fullName: PropTypes.string
  })
};

export default CreateEventDetailsGrants;
