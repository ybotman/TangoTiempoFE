/**
 * SignupPromptContent - Encourage signup for returning visitors (Visit 5+)
 *
 * Shows benefits of creating an account with strong CTA
 *
 * Part of TIEMPO-329: Managed User Entry Flow Phase 1.1
 */

'use client';

import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';

/**
 * SignupPromptContent Component
 *
 * Shows signup benefits for visitors who have returned 5+ times
 *
 * @param {Object} props
 * @param {Function} props.onSignup - Callback when user clicks "Create Account"
 * @param {Function} props.onClose - Callback when user clicks "Maybe Later"
 */
const SignupPromptContent = ({ onSignup, onClose }) => {
  const handleSignup = () => {
    // TODO: Navigate to signup page
    console.log('[SignupPrompt] User clicked Create Account');
    onClose();
    // For now, just close - Phase 2 will implement actual signup
    // window.location.href = '/signup';
  };

  return (
    <>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <StarIcon sx={{ fontSize: 60, color: '#f59e0b', mb: 1 }} />
        <Typography variant="h4" component="div" gutterBottom>
          You're a regular!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create a free account to unlock more features
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Benefits List */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Free account benefits:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <LocationOnIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Save your location"
                secondary="Auto-load events near you every visit"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FavoriteIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Favorite events"
                secondary="Never miss events you care about"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Follow organizers"
                secondary="Get updates from your favorite dance communities"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Event notifications"
                secondary="Get alerts for new events near you"
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{
          bgcolor: '#f0f9ff',
          p: 2,
          borderRadius: 1,
          border: '1px solid #0ea5e9'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            💯 100% free • No credit card • Takes 30 seconds
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Maybe Later
        </Button>
        <Button
          onClick={handleSignup}
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#0ea5e9',
            '&:hover': { bgcolor: '#0284c7' }
          }}
        >
          Create Free Account
        </Button>
      </DialogActions>
    </>
  );
};

export default SignupPromptContent;
