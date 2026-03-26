/**
 * OccurrenceActionMenu.js
 * TIEMPO-362: Dropdown menu for recurring event occurrence-specific actions
 *
 * Provides options:
 * - Edit This Date Only
 * - Edit All Dates
 * - Cancel This Date
 * - Delete Entire Series
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { format } from 'date-fns';

const OccurrenceActionMenu = ({
  occurrenceDate,
  onEditOccurrence,
  onEditSeries,
  onCancelOccurrence,
  onDeleteSeries,
  onShowAllDates,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    action();
  };

  // Format the occurrence date for display
  const formattedDate = occurrenceDate
    ? format(new Date(occurrenceDate), 'MMM d, yyyy')
    : 'this date';

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={handleClick}
        disabled={disabled}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          minWidth: 100,
          fontSize: '0.875rem'
        }}
      >
        Actions
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { minWidth: 220 }
        }}
      >
        {/* Header showing which date */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="text.secondary">
            Actions for {formattedDate}
          </Typography>
        </Box>

        <Divider />

        {/* Edit This Occurrence */}
        <MenuItem onClick={() => handleAction(onEditOccurrence)}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Edit This Date Only"
            secondary="Change DJ, notes, time for this date"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        {/* Edit All Dates */}
        <MenuItem onClick={() => handleAction(onEditSeries)}>
          <ListItemIcon>
            <EditCalendarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Edit All Dates"
            secondary="Modify the entire series"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <Divider />

        {/* See All Dates - fast track to date picker */}
        {onShowAllDates && (
          <MenuItem onClick={() => handleAction(onShowAllDates)}>
            <ListItemIcon>
              <CalendarMonthIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText
              primary="See All Dates"
              secondary="View and select other occurrences"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        )}

        <Divider />

        {/* Cancel This Occurrence */}
        <MenuItem onClick={() => handleAction(onCancelOccurrence)}>
          <ListItemIcon>
            <EventBusyIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText
            primary="Cancel This Date"
            secondary="Skip this occurrence only"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        {/* Delete Entire Series */}
        <MenuItem onClick={() => handleAction(onDeleteSeries)}>
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Delete Entire Series"
            secondary="Remove all occurrences"
            secondaryTypographyProps={{ variant: 'caption', color: 'error' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

OccurrenceActionMenu.propTypes = {
  occurrenceDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  onEditOccurrence: PropTypes.func.isRequired,
  onEditSeries: PropTypes.func.isRequired,
  onCancelOccurrence: PropTypes.func.isRequired,
  onDeleteSeries: PropTypes.func.isRequired,
  onShowAllDates: PropTypes.func,
  disabled: PropTypes.bool
};

export default OccurrenceActionMenu;
