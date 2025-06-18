'use client';

import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

const ValidationDialog = ({ open, onClose, validationErrors, onSaveAnyway }) => {
  const hasRequiredErrors = validationErrors.some(error => error.required);
  const imageError = validationErrors.find(error => error.field === 'image');
  const requiredErrors = validationErrors.filter(error => error.required);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="h6">
            Event Validation
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {requiredErrors.length > 0 && (
          <>
            <Typography variant="body1" gutterBottom>
              The following required fields are missing:
            </Typography>
            <List dense>
              {requiredErrors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorOutlineIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={error.field}
                    secondary={error.message}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {requiredErrors.length > 0 && imageError && (
          <Divider sx={{ my: 2 }} />
        )}

        {imageError && (
          <Box sx={{ mt: requiredErrors.length > 0 ? 0 : 1 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <InfoOutlinedIcon color="info" fontSize="small" />
              <Typography variant="body1">
                Recommendation:
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} pl={3}>
              <ImageOutlinedIcon color="action" />
              <Box>
                <Typography variant="body2">
                  Adding an event image is highly recommended
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Events with images get more attention and engagement
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Go Back
        </Button>
        {!hasRequiredErrors && imageError && (
          <Button onClick={onSaveAnyway} variant="outlined">
            Save Without Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

ValidationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  validationErrors: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    required: PropTypes.bool
  })).isRequired,
  onSaveAnyway: PropTypes.func
};

export default ValidationDialog;