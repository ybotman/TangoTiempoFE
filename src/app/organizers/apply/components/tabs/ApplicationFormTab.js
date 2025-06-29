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

const ApplicationFormTab = () => {
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();
  const router = useRouter();

  const steps = [
    {
      label: 'Sign Up for TangoTiempo',
      description: 'Create your free account to get started',
      completed: !!user
    },
    {
      label: 'Go to User Settings',
      description: 'Access your settings from the user menu',
      completed: !!userData
    },
    {
      label: 'Navigate to Apply Tab',
      description: 'Find the "Apply" section in your user settings',
      completed: userData?.regionalOrganizerInfo?.organizerId
    },
    {
      label: 'Submit Application',
      description: 'Complete the application process',
      completed: userData?.regionalOrganizerInfo?.isApproved
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
          To become a TangoTiempo organizer, you'll need to create an account first.
        </Alert>

        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <PersonAddIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Step 1: Create Your Account
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Click the user icon in the top menu bar and select "Sign Up" to create your 
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
          You're Already an Organizer!
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

      <Alert severity="success" sx={{ mb: 3 }}>
        Great! You're signed in. Now follow these steps to complete your organizer application.
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Process
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} completed={step.completed}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, backgroundColor: 'primary.light', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ color: 'primary.contrastText', mb: 1 }}>
              Ready to Apply?
            </Typography>
            <Typography variant="body1" sx={{ color: 'primary.contrastText' }}>
              Click below to go to User Settings and find the Apply tab
            </Typography>
          </Box>
          <SettingsIcon sx={{ fontSize: 60, color: 'primary.contrastText', opacity: 0.7 }} />
        </Box>
        
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            mt: 3,
            backgroundColor: 'white',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'grey.100'
            }
          }}
          onClick={() => {
            // This would open the user settings modal
            // For now, we'll just show instructions
            alert('Click the user icon in the top menu, then select "User Settings" and navigate to the "Apply" tab.');
          }}
        >
          Go to User Settings → Apply Tab
        </Button>
      </Paper>

      <Box sx={{ mt: 3, p: 3, backgroundColor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          What Happens in User Settings?
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="1. Open User Settings from the user menu" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. Navigate to the 'Apply' tab" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Click 'Apply' to submit your application" />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. Accept the Terms of Use when prompted" />
          </ListItem>
          <ListItem>
            <ListItemText primary="5. Your application will be reviewed by administrators" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ApplicationFormTab;