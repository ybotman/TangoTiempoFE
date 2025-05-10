'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  Box,
  Typography,
  Switch,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useOrganizers } from '@/hooks/useOrganizers';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

const RegionalOrganizerSelection = ({ open, onClose, selectedOrganizers = [], onSelectOrganizers }) => {
  // State for selected organizers (internally managed, will be passed back on "Apply")
  const [internalSelected, setInternalSelected] = useState(selectedOrganizers || []);
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for "Recently Active" toggle
  const [recentlyActiveOnly, setRecentlyActiveOnly] = useState(false);
  
  // Get location context and organizers data
  const { selectedLocation } = useGeoLocation();
  const { organizers, fetchLoading: loading, error } = useOrganizers();
  
  // When modal opens, reset internal state to match props
  useEffect(() => {
    if (open) {
      setInternalSelected(selectedOrganizers || []);
    }
  }, [open, selectedOrganizers]);
  
  // Define "recently active" as organizers with events in the last 3 months (90 days)
  const isRecentlyActive = (organizer) => {
    // This would ideally use a lastEventDate field, but for now we'll assume all are active
    // In a real implementation, we'd check if organizer.lastEventDate > (now - 90 days)
    return organizer.isEventOrganizer === true;
  };
  
  // Filter organizers based on search term and "Recently Active" toggle
  const filteredOrganizers = useMemo(() => {
    if (!Array.isArray(organizers)) return [];
    
    return organizers.filter(organizer => {
      // Filter by isEventOrganizer flag first
      if (organizer.isEventOrganizer !== true) return false;
      
      // Apply search filter
      const nameMatch = (organizer.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const shortNameMatch = (organizer.shortName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply recently active filter if enabled
      const activeMatch = !recentlyActiveOnly || isRecentlyActive(organizer);
      
      return (nameMatch || shortNameMatch) && activeMatch;
    });
  }, [organizers, searchTerm, recentlyActiveOnly]);
  
  // Handler for checkbox changes
  const handleCheckboxChange = (organizerId) => {
    setInternalSelected(prev => {
      if (prev.includes(organizerId)) {
        return prev.filter(id => id !== organizerId);
      } else {
        return [...prev, organizerId];
      }
    });
  };
  
  // Handler for "Select All" button
  const handleSelectAll = () => {
    const allIds = filteredOrganizers.map(org => org._id);
    setInternalSelected(allIds);
  };
  
  // Handler for "Clear All" button
  const handleClearAll = () => {
    setInternalSelected([]);
  };
  
  // Handler for "Apply" button
  const handleApply = () => {
    onSelectOrganizers(internalSelected);
    onClose();
  };
  
  // Split organizers into two columns
  const organizerColumns = useMemo(() => {
    if (!filteredOrganizers || filteredOrganizers.length === 0) return [[], []];
    
    const midpoint = Math.ceil(filteredOrganizers.length / 2);
    const leftColumn = filteredOrganizers.slice(0, midpoint);
    const rightColumn = filteredOrganizers.slice(midpoint);
    
    return [leftColumn, rightColumn];
  }, [filteredOrganizers]);
  
  // Create organizer checkboxes for a column
  const renderOrganizerColumn = (columnOrganizers) => {
    return columnOrganizers.map(organizer => (
      <Box 
        key={organizer._id} 
        sx={{ 
          mb: 1, 
          p: 1, 
          borderRadius: 1,
          bgcolor: internalSelected.includes(organizer._id) ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <FormControlLabel
          control={
            <Checkbox 
              checked={internalSelected.includes(organizer._id)} 
              onChange={() => handleCheckboxChange(organizer._id)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                {organizer.name || organizer.shortName}
              </Typography>
              <Tooltip title="View Organizer Details">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent checkbox toggle
                    // Navigation to organizer details would go here
                    console.log(`Navigate to organizer details for: ${organizer.name}`);
                    // This would typically open RegionalOrganizersModal for this organizer
                  }}
                >
                  <PersonIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{ width: '100%' }}
        />
      </Box>
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="regional-organizer-selection-title"
    >
      <DialogTitle id="regional-organizer-selection-title">
        Select Organizers
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300} flexDirection="column">
            <Typography color="error" gutterBottom>Error loading organizers</Typography>
            <Button onClick={onClose} variant="outlined" color="primary">
              Close
            </Button>
          </Box>
        ) : (
          <>
            {/* Search and filter area */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Search organizers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={recentlyActiveOnly}
                          onChange={(e) => setRecentlyActiveOnly(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Recently Active Only"
                    />
                    <Tooltip title="Shows organizers who have hosted events in the last 3 months">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {/* Selection controls */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Button 
                  size="small" 
                  onClick={handleSelectAll}
                  disabled={filteredOrganizers.length === 0}
                >
                  Select All
                </Button>
                <Button 
                  size="small" 
                  onClick={handleClearAll}
                  disabled={internalSelected.length === 0}
                >
                  Clear All
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {internalSelected.length} organizer{internalSelected.length !== 1 ? 's' : ''} selected
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Organizer list */}
            {filteredOrganizers.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} flexDirection="column">
                <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
                  {searchTerm 
                    ? `No organizers found matching "${searchTerm}"`
                    : recentlyActiveOnly 
                      ? "No recently active organizers found"
                      : "No organizers available for this location"}
                </Typography>
                {searchTerm && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 1, height: '100%' }}>
                    {renderOrganizerColumn(organizerColumns[0])}
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 1, height: '100%' }}>
                    {renderOrganizerColumn(organizerColumns[1])}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredOrganizers.length} organizer{filteredOrganizers.length !== 1 ? 's' : ''} available
        </Typography>
        <Box>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            color="primary" 
            variant="contained"
            disabled={loading}
            sx={{ ml: 1 }}
          >
            Apply
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

RegionalOrganizerSelection.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedOrganizers: PropTypes.arrayOf(PropTypes.string),
  onSelectOrganizers: PropTypes.func.isRequired
};

export default RegionalOrganizerSelection;