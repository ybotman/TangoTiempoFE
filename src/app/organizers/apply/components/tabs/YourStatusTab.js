'use client';

import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { useUsers } from '@/hooks/useUsers';
import { AuthContext } from '@/contexts/AuthContext';

const YourStatusTab = () => {
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();

  // Sample application steps for demonstration
  const applicationSteps = [
    'Account Created',
    'Profile Completed',
    'Organizer Type Selected',
    'Terms Accepted',
    'Application Submitted',
    'Under Review',
    'Approved'
  ];

  // Determine current step based on user data
  const getCurrentStep = () => {
    if (!user) return 0;
    if (!userData) return 1;
    if (!userData.regionalOrganizerInfo?.organizerId) return 2;
    if (!userData.regionalOrganizerInfo?.isApproved) return 5;
    return 6; // Approved
  };

  const currentStep = getCurrentStep();

  // Profile completion calculation
  const profileFields = [
    { field: 'email', label: 'Email Address', completed: !!user?.email },
    { field: 'name', label: 'Full Name', completed: !!userData?.localUserInfo?.firstName },
    { field: 'location', label: 'Location', completed: !!userData?.localUserInfo?.userDefaults?.city },
    { field: 'phone', label: 'Phone Number', completed: !!userData?.localUserInfo?.phone },
    { field: 'bio', label: 'Bio/Description', completed: false },
    { field: 'photo', label: 'Profile Photo', completed: !!user?.photoURL }
  ];

  const completedFields = profileFields.filter(f => f.completed).length;
  const completionPercentage = (completedFields / profileFields.length) * 100;

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
          Your Application Status
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Please sign in to view your application status and track your progress.
        </Alert>
        
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            To apply as an organizer and track your application status, you need to sign in 
            or create a TangoTiempo account.
          </Typography>
          <Button variant="contained" color="primary">
            Sign In / Sign Up
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Your Application Status
      </Typography>

      {/* Application Progress */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Progress
        </Typography>
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mt: 2 }}>
          {applicationSteps.map((label, index) => (
            <Step key={label} completed={index < currentStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Profile Completion */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completion
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {completedFields} of {profileFields.length} fields completed
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {Math.round(completionPercentage)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <List dense>
                {profileFields.map((field) => (
                  <ListItem key={field.field}>
                    <ListItemIcon>
                      {field.completed ? (
                        <CheckCircleIcon sx={{ color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ color: 'error.main' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={field.label} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              
              {userData?.regionalOrganizerInfo?.isApproved ? (
                <Box>
                  <Chip 
                    label="Approved Organizer" 
                    color="success" 
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" paragraph>
                    Congratulations! You are an approved TangoTiempo organizer.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Organizer ID" 
                        secondary={userData.regionalOrganizerInfo.organizerId || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Member Since" 
                        secondary={new Date(userData.createdAt).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </Box>
              ) : userData?.regionalOrganizerInfo?.organizerId ? (
                <Box>
                  <Chip 
                    label="Under Review" 
                    color="warning" 
                    icon={<PendingIcon />}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" paragraph>
                    Your application is currently under review by regional administrators.
                  </Typography>
                  <Alert severity="info" icon={<AccessTimeIcon />}>
                    Expected review time: 2-3 business days
                  </Alert>
                </Box>
              ) : (
                <Box>
                  <Chip 
                    label="Not Started" 
                    color="default" 
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" paragraph>
                    You haven't submitted an organizer application yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => {/* Navigate to application form */}}
                  >
                    Start Application
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Roles */}
        {userData?.regionalOrganizerInfo?.isApproved && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Active Organizer Roles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Event Organizer" color="primary" />
                  {/* Add more chips based on actual organizer types */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Next Steps */}
      <Paper elevation={0} sx={{ p: 3, mt: 3, backgroundColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        {currentStep < 2 && (
          <Typography variant="body2">
            Complete your profile information to continue with your organizer application.
          </Typography>
        )}
        {currentStep === 2 && (
          <Typography variant="body2">
            Select your organizer type(s) and complete the application form in the "Apply Now" tab.
          </Typography>
        )}
        {currentStep >= 5 && currentStep < 6 && (
          <Typography variant="body2">
            Your application is under review. You'll receive an email once a decision is made.
          </Typography>
        )}
        {currentStep === 6 && (
          <Typography variant="body2">
            You're all set! Start creating events and managing your organizer profile.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default YourStatusTab;