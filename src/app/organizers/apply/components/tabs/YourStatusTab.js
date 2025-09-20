'use client';

import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  // Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonIcon from '@mui/icons-material/Person';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useUsers } from '@/hooks/useUsers';
import { AuthContext } from '@/contexts/AuthContext';
import ROTermsModal from '@/components/Modals/UserSettings/UserSettingApplyROTerms';
import RestartRequiredModal from './RestartRequiredModal';
import UserSettingsApply from '@/components/Modals/UserSettings/UserSettingsApply';

const YourStatusTab = () => {
  const { user } = useContext(AuthContext);
  const { userData, loading } = useUsers();
  const [showROEModal, setShowROEModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [restartReason, setRestartReason] = useState('');

  // Determine current application phase
  const getApplicationPhase = () => {
    if (!user) return 'anonymous';
    if (!userData) return 'loading';
    
    const hasOrganizerId = userData?.regionalOrganizerInfo?.organizerId;
    const isApproved = userData?.regionalOrganizerInfo?.isApproved;
    const isEnabled = userData?.regionalOrganizerInfo?.isEnabled;
    
    if (!hasOrganizerId) return 'readyToApply';
    if (!isApproved) return 'pendingApproval';
    if (!isEnabled) return 'setupRequired';
    
    // Check if restart is needed
    const needsRestart = sessionStorage.getItem('organizerRestartNeeded') === 'true';
    if (needsRestart) return 'restartRequired';
    
    // Check if welcome should be shown
    const hasSeenWelcome = sessionStorage.getItem('organizerWelcomeShown') === 'true';
    if (isEnabled && !hasSeenWelcome) return 'showWelcome';
    
    return 'fullyActive';
  };

  const currentPhase = getApplicationPhase();

  // Phase-specific action handlers
  // const handleStartApplication = () => {
    // Check if we're in the organizer application page context
    // If not, we might need to open User Settings modal instead
    setShowROEModal(true);
  // };

  const handleROEAccept = (accepted) => {
    setShowROEModal(false);
    if (accepted) {
      // The UserSettingsApply component will handle the actual creation
      // Just trigger a restart after a delay
      setRestartReason('Your organizer profile has been created! The app needs to restart to activate your new role.');
      sessionStorage.setItem('organizerRestartNeeded', 'true');
      setTimeout(() => {
        setShowRestartModal(true);
      }, 1000);
    }
  };

  const handleEnableProfile = () => {
    // For now, show an alert with instructions
    // In a proper implementation, this would trigger the RegionalOrganizersModal
    alert('To enable your profile:\n\n1. Open the menu (☰)\n2. Click on "Organizer Settings"\n3. Go to the "Status" tab\n4. Toggle "Enable Profile" and save\n5. Restart the app');
  };

  const handleRestartComplete = () => {
    sessionStorage.removeItem('organizerRestartNeeded');
    window.location.reload();
  };

  const handleWelcomeDismiss = () => {
    sessionStorage.setItem('organizerWelcomeShown', 'true');
    // Force re-render
    window.location.reload();
  };

  // Application steps for progress display
  const applicationSteps = [
    { 
      label: 'Create Account', 
      completed: !!user,
      description: 'Sign up with email or Google'
    },
    { 
      label: 'Accept Terms', 
      completed: userData?.regionalOrganizerInfo?.organizerId,
      description: 'Read and accept Rules of Engagement'
    },
    { 
      label: 'Auto-Approval', 
      completed: userData?.regionalOrganizerInfo?.isApproved,
      description: 'Automatically approved after ROE acceptance'
    },
    { 
      label: 'Profile Setup', 
      completed: userData?.regionalOrganizerInfo?.isEnabled,
      description: 'Configure your organizer profile'
    },
    { 
      label: 'Fully Active', 
      completed: currentPhase === 'fullyActive',
      description: 'Ready to create events!'
    }
  ];

  // Loading state
  if (loading || currentPhase === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Phase-specific UI components
  const phaseComponents = {
    anonymous: (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <PersonIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Sign In Required
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          To apply as an organizer and track your application status, you need to sign in 
          or create a TangoTiempo account.
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Sign In / Sign Up
        </Button>
      </Paper>
    ),

    readyToApply: (
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <RocketLaunchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ready to Become an Organizer?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start your journey as a Regional Organizer for Argentine Tango events.
              The process takes about 20 minutes from start to finish.
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <UserSettingsApply />
        </CardContent>
      </Card>
    ),

    pendingApproval: (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your organizer profile has been created but needs to accept the terms.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Accept Rules of Engagement
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setShowROEModal(true)}
          >
            Review and Accept Terms
          </Button>
        </CardContent>
      </Card>
    ),

    setupRequired: (
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
            Congratulations! You&apos;ve been approved as a Regional Organizer.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Complete Your Profile Setup
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <RadioButtonUncheckedIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Update Your Organizer Name"
                secondary="Change from default to your organization name"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <RadioButtonUncheckedIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Add Profile Description"
                secondary="Tell the community about your events"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <RadioButtonUncheckedIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Enable Your Profile"
                secondary="Activate your organizer account"
              />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              startIcon={<SettingsIcon />}
              onClick={handleEnableProfile}
            >
              Go to Organizer Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    ),

    restartRequired: (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <RestartAltIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Restart Required
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {restartReason || 'The app needs to restart to apply your new settings.'}
          </Typography>
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => setShowRestartModal(true)}
          >
            Restart Now
          </Button>
        </CardContent>
      </Card>
    ),

    showWelcome: (
      <Card elevation={3} sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <CardContent sx={{ textAlign: 'center', p: 4, color: 'white' }}>
          <CelebrationIcon sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome, Regional Organizer!
          </Typography>
          <Typography variant="h6" paragraph>
            You&apos;re all set to create Argentine Tango events.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            size="large"
            onClick={handleWelcomeDismiss}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    ),

    fullyActive: (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h6">
              Active Regional Organizer
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Organizer ID
              </Typography>
              <Typography variant="body1">
                {userData?.regionalOrganizerInfo?.organizerId || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            You can now create and manage Argentine Tango events in your region.
          </Typography>
        </CardContent>
      </Card>
    )
  };

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Your Organizer Status
      </Typography>

      {/* Progress Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Progress
        </Typography>
        <Stepper orientation="vertical">
          {applicationSteps.map((step) => (
            <Step key={step.label} active={!step.completed} completed={step.completed}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Phase-specific content */}
      {phaseComponents[currentPhase]}

      {/* Next Steps Helper */}
      {currentPhase !== 'fullyActive' && currentPhase !== 'anonymous' && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Next Step:</strong> {
              currentPhase === 'readyToApply' ? 'Click "Start Application" to begin the process.' :
              currentPhase === 'pendingApproval' ? 'Accept the Rules of Engagement to get approved.' :
              currentPhase === 'setupRequired' ? 'Complete your profile setup in Organizer Settings.' :
              currentPhase === 'restartRequired' ? 'Restart the app to activate your changes.' :
              'Continue with the application process.'
            }
          </Typography>
        </Alert>
      )}

      {/* Modals */}
      <ROTermsModal 
        open={showROEModal}
        onClose={() => setShowROEModal(false)}
        onAgree={handleROEAccept}
      />
      
      {showRestartModal && (
        <RestartRequiredModal
          open={showRestartModal}
          onClose={() => setShowRestartModal(false)}
          reason={restartReason}
          onRestart={handleRestartComplete}
        />
      )}
    </Box>
  );
};

export default YourStatusTab;
