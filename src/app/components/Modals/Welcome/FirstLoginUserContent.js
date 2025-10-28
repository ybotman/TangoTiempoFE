/**
 * FirstLoginUserContent - Onboarding checklist for first-time logged-in users
 *
 * Shows profile completion steps and guides user through setup
 *
 * Part of TIEMPO-329: Managed User Entry Flow
 */

'use client';

import React, { useState, useEffect, useContext } from 'react';
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
  ListItemText,
  Checkbox,
  LinearProgress
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * FirstLoginUserContent Component
 *
 * Shows onboarding checklist for new users
 *
 * @param {Object} props
 * @param {Function} props.onGetStarted - Callback when user clicks "Complete Now"
 * @param {Function} props.onSkip - Callback when user clicks "Remind Me Later"
 */
const FirstLoginUserContent = ({ onGetStarted, onSkip }) => {
  const { user } = useContext(AuthContext);
  const [checklist, setChecklist] = useState([
    {
      id: 'location',
      label: 'Set your home location',
      icon: <LocationOnIcon />,
      completed: false,
      description: 'Choose your default event search area'
    },
    {
      id: 'categories',
      label: 'Select favorite event types',
      icon: <CategoryIcon />,
      completed: false,
      description: 'Milongas, Festivals, Workshops, etc.'
    },
    {
      id: 'organizers',
      label: 'Connect with local organizers',
      icon: <PeopleIcon />,
      completed: false,
      description: 'Follow organizers in your area'
    },
    {
      id: 'notifications',
      label: 'Enable event notifications (optional)',
      icon: <NotificationsIcon />,
      completed: false,
      description: 'Get notified about new events'
    }
  ]);

  // Calculate completion percentage
  const completedCount = checklist.filter(item => item.completed).length;
  const completionPercentage = (completedCount / checklist.length) * 100;

  // Load completion status from localStorage
  useEffect(() => {
    const onboarding = localStorage.getItem('onboarding_steps');
    if (onboarding) {
      try {
        const saved = JSON.parse(onboarding);
        setChecklist(prevList =>
          prevList.map(item => ({
            ...item,
            completed: saved[item.id] || false
          }))
        );
      } catch (error) {
        console.error('[FirstLogin] Failed to parse onboarding status:', error);
      }
    }
  }, []);

  // Toggle checklist item
  const handleToggle = (id) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);

    // Save to localStorage
    const steps = {};
    updated.forEach(item => {
      steps[item.id] = item.completed;
    });
    localStorage.setItem('onboarding_steps', JSON.stringify(steps));
  };

  const userName = user?.displayName?.split(' ')[0] || 'Friend';

  return (
    <>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <CelebrationIcon sx={{ fontSize: 60, color: '#1976d2', mb: 1 }} />
        <Typography variant="h4" component="div" gutterBottom>
          Welcome, {userName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Let's set up your profile
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Completion Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Profile Completion
            </Typography>
            <Typography variant="body2" color="primary" fontWeight="bold">
              {completedCount} of {checklist.length} complete
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Onboarding Checklist */}
        <List>
          {checklist.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => handleToggle(item.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: item.completed ? '#e8f5e9' : '#f5f5f5',
                '&:hover': {
                  bgcolor: item.completed ? '#c8e6c9' : '#eeeeee'
                }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={item.completed}
                  tabIndex={-1}
                  disableRipple
                  color="primary"
                />
              </ListItemIcon>
              <Box sx={{ flex: 1 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        fontWeight: item.completed ? 'normal' : 'bold'
                      }}
                    >
                      {item.icon} {item.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  }
                />
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Encouragement Message */}
        {completionPercentage === 100 ? (
          <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body1" color="primary" fontWeight="bold">
              🎉 All set! You're ready to explore events!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You can complete these steps anytime from your profile settings
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button
          onClick={onSkip}
          color="inherit"
        >
          Remind Me Later
        </Button>
        <Button
          onClick={onGetStarted}
          variant="contained"
          size="large"
        >
          {completionPercentage === 100 ? 'Get Started' : 'Complete Now'}
        </Button>
      </DialogActions>
    </>
  );
};

export default FirstLoginUserContent;
