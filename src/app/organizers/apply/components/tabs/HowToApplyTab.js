'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const steps = [
  {
    label: 'Create Your Account',
    icon: <PersonAddIcon />,
    description: 'Sign up for a free TangoTiempo account if you don\'t already have one.',
    details: [
      'Click the user icon in the top menu',
      'Choose "Sign Up" option',
      'Verify your email address',
      'Complete basic profile information'
    ]
  },
  {
    label: 'Choose Your Organizer Type(s)',
    icon: <AssignmentIcon />,
    description: 'Select one or more organizer types that match your role in the tango community.',
    details: [
      'Review all available organizer types',
      'Select all that apply to you',
      'Each type has specific requirements',
      'You can add more types later'
    ]
  },
  {
    label: 'Complete Your Profile',
    icon: <AssignmentIcon />,
    description: 'Fill out the application form with your information and qualifications.',
    details: [
      'Provide contact information',
      'Describe your experience',
      'Upload relevant photos or documents',
      'Add links to your website or social media'
    ]
  },
  {
    label: 'Accept Terms & Submit',
    icon: <CheckCircleIcon />,
    description: 'Review and accept the TangoTiempo organizer terms and bylaws.',
    details: [
      'Read the organizer bylaws carefully',
      'Understand your responsibilities',
      'Accept the terms of service',
      'Submit your application'
    ]
  },
  {
    label: 'Application Review',
    icon: <RateReviewIcon />,
    description: 'Your application will be reviewed by regional administrators.',
    details: [
      'Review typically takes 2-3 business days',
      'You may be contacted for additional information',
      'Check your application status anytime',
      'Email notification upon decision'
    ]
  },
  {
    label: 'Start Managing Events',
    icon: <NotificationsActiveIcon />,
    description: 'Once approved, you can start creating and managing your tango events.',
    details: [
      'Access organizer dashboard',
      'Create event listings',
      'Manage your organizer profile',
      'Connect with the community'
    ]
  }
];

const HowToApplyTab = () => {
  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        How to Apply
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        Becoming a TangoTiempo organizer is a straightforward process. Follow these steps to 
        join our community of tango event organizers and contributors.
      </Typography>

      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} active={true}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {index + 1}
                </Box>
              )}
            >
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <List dense>
                  {step.details.map((detail, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={detail} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, p: 3, backgroundColor: 'warning.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Processing Time
        </Typography>
        <Typography variant="body2">
          Most applications are reviewed within 2-3 business days. During busy periods, 
          it may take up to a week. You'll receive email updates about your application status, 
          and you can check your status anytime in the "Your Status" tab.
        </Typography>
      </Box>

      <Box sx={{ mt: 3, p: 3, backgroundColor: 'success.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2">
          If you have questions about the application process or need assistance, you can:
        </Typography>
        <List dense sx={{ mt: 1 }}>
          <ListItem>
            <ListItemText primary="• Contact your regional administrator" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Check the FAQ section" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Send a message through the Message Admin feature" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default HowToApplyTab;