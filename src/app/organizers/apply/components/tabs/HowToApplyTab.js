'use client';

import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  timelineOppositeContentClasses
} from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AuthContext } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';

const applicationSteps = [
  {
    title: 'Create Account',
    time: '2 min',
    icon: <PersonAddIcon />,
    description: 'Sign up with email or Google',
    details: 'You\'ll automatically receive Named User (NU) role upon account creation.'
  },
  {
    title: 'Start Application',
    time: '1 min',
    icon: <AssignmentTurnedInIcon />,
    description: 'Click "Start Application" in Your Status tab',
    details: 'The application button appears once you\'re logged in.'
  },
  {
    title: 'Accept ROE',
    time: '5 min',
    icon: <CheckCircleIcon />,
    description: 'Read and accept Rules of Engagement',
    details: 'You must read all 5 sections and check the acceptance box. Only Argentine Tango events are permitted!'
  },
  {
    title: 'Auto-Approval',
    time: 'Instant',
    icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
    description: 'Automatically approved upon ROE acceptance',
    details: 'Your organizer profile is created with isApproved=true, isEnabled=false for safety.'
  },
  {
    title: 'Complete Setup',
    time: '10 min',
    icon: <SettingsIcon />,
    description: 'Configure your organizer profile',
    details: 'Change your organizer name, add description, and enable your profile when ready.'
  },
  {
    title: 'Final Activation',
    time: '2 min',
    icon: <CelebrationIcon />,
    description: 'Enable profile and restart',
    details: 'Toggle "Enable Profile" in settings, restart app, and you\'re ready to create events!'
  }
];

const faqs = [
  {
    question: 'Why is automatic approval offered?',
    answer: 'We trust our community members who accept the strict Argentine Tango-only policy. The ROE acceptance serves as your commitment to maintaining event quality.'
  },
  {
    question: 'Why are two restarts required?',
    answer: 'First restart activates your organizer role after ROE acceptance. Second restart applies your enabled status after profile setup. This ensures proper permissions loading.'
  },
  {
    question: 'What\'s the difference between Approved and Enabled?',
    answer: 'Approved means you\'ve accepted the ROE and can access organizer features. Enabled means your profile is active and searchable by the community.'
  },
  {
    question: 'Can I have multiple organizer types?',
    answer: 'Yes! You can be an Event Organizer, Teacher, DJ, or any combination. Select your types in the organizer settings.'
  },
  {
    question: 'What happens if I post non-tango events?',
    answer: 'AI monitoring will flag non-tango events. Repeated violations may result in suspension of organizer privileges. Only Argentine Tango events are allowed!'
  }
];

const HowToApplyTab = () => {
  const { user } = useContext(AuthContext);
  const { userData } = useUsers();

  // Determine user's current state
  const getUserState = () => {
    if (!user) return 'not-signed-in';
    if (!userData?.regionalOrganizerInfo?.organizerId) return 'ready-to-apply';
    if (!userData?.regionalOrganizerInfo?.isEnabled) return 'in-progress';
    return 'active';
  };

  const userState = getUserState();

  // Dynamic button based on state
  const getActionButton = () => {
    switch (userState) {
      case 'not-signed-in':
        return (
          <Button variant="contained" color="primary" size="large">
            Sign Up Now
          </Button>
        );
      case 'ready-to-apply':
        return (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => window.location.href = '/organizers/apply#your-status'}
          >
            Go to Your Status
          </Button>
        );
      case 'in-progress':
        return (
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => window.location.href = '/organizers/apply#your-status'}
          >
            Continue Application
          </Button>
        );
      case 'active':
        return (
          <Chip 
            label="You're an Active Organizer!" 
            color="success" 
            icon={<CheckCircleIcon />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        How to Become an Organizer
      </Typography>

      {/* Quick Action Panel */}
      <Card elevation={2} sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            Ready to Join?
          </Typography>
          <Typography variant="body1" paragraph>
            The entire process takes about 20 minutes from sign-up to active organizer.
          </Typography>
          {getActionButton()}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          <TimerIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Application Timeline
        </Typography>
        
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
            },
          }}
        >
          {applicationSteps.map((step, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent color="textSecondary">
                <Chip label={step.time} size="small" />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={index === 3 ? 'success' : 'primary'}>
                  {step.icon}
                </TimelineDot>
                {index < applicationSteps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6" component="h4">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {step.description}
                </Typography>
                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                  {step.details}
                </Alert>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>

      {/* Important Notice */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Important: Only Argentine Tango Events Allowed
        </Typography>
        <Typography variant="body2">
          As a Regional Organizer, you may ONLY create events that are strictly Argentine Tango 
          (milongas, practicas, classes, workshops). No fusion events or other dance styles are 
          permitted. AI monitoring ensures compliance with this policy.
        </Typography>
      </Alert>

      {/* FAQs */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        <HelpOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Frequently Asked Questions
      </Typography>
      
      {faqs.map((faq, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Support Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Need Help?
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Contact your Regional Admin" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Join the community forum" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Watch video tutorials (coming soon)" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Benefits
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Create unlimited tango events" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Manage your organizer profile" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Connect with the tango community" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HowToApplyTab;