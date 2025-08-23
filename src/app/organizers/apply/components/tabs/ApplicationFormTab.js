'use client';

import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UserSettingsApply from '@/components/Modals/UserSettings/UserSettingsApply';

const ApplicationFormTab = () => {
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();
  const router = useRouter();

  const steps = [
    {
      label: 'Create Account',
      description: 'Sign up with email or Google',
      completed: !!user
    },
    {
      label: 'Apply',
      description: 'Apply to become an Event Organizer',
      completed: userData?.regionalOrganizerInfo?.organizerId
    },
    {
      label: 'Accept Guidelines',
      description: 'Read and accept the community guidelines',
      completed: userData?.regionalOrganizerInfo?.isApproved
    },
    {
      label: 'Auto-Approval',
      description: 'Automatically approved after guidelines acceptance',
      completed: userData?.regionalOrganizerInfo?.isApproved
    },
    {
      label: 'Profile Setup',
      description: 'Add name, contact info, then activate your role',
      completed: userData?.regionalOrganizerInfo?.isEnabled
    },
    {
      label: 'Fully Active',
      description: 'Ready to add events! Then add artist types',
      completed: userData?.regionalOrganizerInfo?.isEnabled && userData?.regionalOrganizerInfo?.isApproved
    }
  ];

  const activeStep = steps.findIndex(step => !step.completed);

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
          Start Your Application
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          To become a TangoTiempo organizer, you&apos;ll need to create an account first.
        </Alert>

        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <PersonAddIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Step 1: Create Your Account
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Click the user icon in the top menu bar and select &quot;Sign Up&quot; to create your 
            free TangoTiempo account.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Already have an account? Sign in to continue with your application.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // If user is already an approved organizer
  if (userData?.regionalOrganizerInfo?.isApproved) {
    return (
      <Box>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
          You&apos;re Already an Organizer!
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Congratulations! You are an approved TangoTiempo organizer.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Organizer Status
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Application Approved" 
                secondary="You can now create and manage events"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Organizer ID" 
                secondary={userData.regionalOrganizerInfo.organizerId || 'Assigned'}
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Complete Your Application
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Event Organizer status is <strong>mandatory</strong> to create events. Artist types (DJ, Orchestra, etc.) are optional add-ons.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Progress
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} completed={step.completed}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {/* Show Apply button at step 2 (Accept Terms) */}
                {index === 1 && !step.completed && (
                  <Box sx={{ mt: 2 }}>
                    <UserSettingsApply />
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default ApplicationFormTab;
