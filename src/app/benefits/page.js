'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Icons
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import MessageIcon from '@mui/icons-material/Message';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsPausedIcon from '@mui/icons-material/NotificationsPaused';
import MailIcon from '@mui/icons-material/Mail';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SchoolIcon from '@mui/icons-material/School';

const generalBenefits = [
  {
    icon: <EventIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    title: 'Discover Tango Events',
    description: 'Find milongas, classes, workshops, and festivals in your area and around the world',
    features: [
      'Real-time event updates',
      'Filter by date, location, and type',
      'Detailed event information',
      'Direct links to organizer contacts'
    ]
  },
  {
    icon: <LocationOnIcon sx={{ color: 'success.main', fontSize: 40 }} />,
    title: 'Location-Based Search',
    description: 'Easily find events near you or plan your tango journey when traveling',
    features: [
      'Interactive map view',
      'Search by city or region',
      'Distance-based filtering',
      'Save favorite locations'
    ]
  },
  {
    icon: <NotificationsIcon sx={{ color: 'info.main', fontSize: 40 }} />,
    title: 'Stay Informed',
    description: 'Never miss an event with our notification and reminder system',
    features: [
      'Event reminders',
      'New event alerts',
      'Organizer updates',
      'Community announcements'
    ]
  },
  {
    icon: <GroupsIcon sx={{ color: 'warning.main', fontSize: 40 }} />,
    title: 'Community Connection',
    description: 'Connect with dancers, teachers, and organizers worldwide',
    features: [
      'Organizer profiles',
      'Event discussions',
      'Share experiences',
      'Build your network'
    ]
  },
  {
    icon: <MessageIcon sx={{ color: 'secondary.main', fontSize: 40 }} />,
    title: 'Direct Messaging',
    description: 'Communicate directly with organizers and fellow dancers',
    features: [
      'Send messages to organizers',
      'Ask questions about events',
      'Coordinate with dance partners',
      'Private group discussions'
    ]
  },
  {
    icon: <BookmarkIcon sx={{ color: 'error.main', fontSize: 40 }} />,
    title: 'Favorites & Bookmarks',
    description: 'Save and organize events for quick access',
    features: [
      'Favorite your regular events',
      'Bookmark upcoming workshops',
      'Create personal event lists',
      'Quick access from dashboard'
    ]
  },
  {
    icon: <SettingsIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    title: 'Personalized Settings',
    description: 'Customize your TangoTiempo experience',
    features: [
      'Save location preferences',
      'Set notification preferences',
      'Customize event filters',
      'Personal profile settings'
    ]
  },
  {
    icon: <MailIcon sx={{ color: 'success.main', fontSize: 40 }} />,
    title: 'Event Invitations',
    description: 'Send and receive private event invitations',
    features: [
      'Private event invites',
      'RSVP management',
      'Guest list coordination',
      'Special event access'
    ]
  }
];

const organizerBenefits = [
  {
    icon: <VisibilityIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    title: 'Increased Visibility',
    description: 'Reach thousands of tango dancers searching for events in your area',
    features: [
      'Featured organizer profile',
      'Event promotion tools',
      'Search engine optimization',
      'Social media integration'
    ]
  },
  {
    icon: <CalendarMonthIcon sx={{ color: 'success.main', fontSize: 40 }} />,
    title: 'Event Management',
    description: 'Powerful tools to create, manage, and promote your events',
    features: [
      'Easy event creation',
      'Recurring event support',
      'Photo galleries',
      'Real-time updates'
    ]
  },
  {
    icon: <TrendingUpIcon sx={{ color: 'info.main', fontSize: 40 }} />,
    title: 'Analytics & Insights',
    description: 'Understand your audience and grow your events',
    features: [
      'Event view statistics',
      'Audience demographics',
      'Engagement metrics',
      'Growth tracking'
    ]
  },
  {
    icon: <StarIcon sx={{ color: 'warning.main', fontSize: 40 }} />,
    title: 'Premium Features',
    description: 'Access advanced tools to enhance your organizing capabilities',
    features: [
      'Priority listing placement',
      'Advanced customization',
      'Direct messaging tools',
      'Exclusive organizer resources'
    ]
  },
  {
    icon: <PhotoCameraIcon sx={{ color: 'secondary.main', fontSize: 40 }} />,
    title: 'Event Image Galleries',
    description: 'Upload and manage photos for your events',
    features: [
      'Multiple images per event',
      'Gallery management tools',
      'Automatic image optimization',
      'Showcase your venues'
    ]
  },
  {
    icon: <NotificationsPausedIcon sx={{ color: 'error.main', fontSize: 40 }} />,
    title: 'Cancellation Management',
    description: 'Easily handle event changes and cancellations',
    features: [
      'One-click cancellation',
      'Automatic attendee notifications',
      'Reschedule options',
      'Cancellation history'
    ]
  }
];

const platformFeatures = [
  { icon: <SecurityIcon />, text: 'Secure and private user data protection' },
  { icon: <SpeedIcon />, text: 'Fast, responsive interface on all devices' },
  { icon: <PublicIcon />, text: 'Multi-language support for global accessibility' },
  { icon: <FavoriteIcon />, text: 'Built by dancers, for dancers' }
];

const specialistRoles = [
  {
    icon: <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    title: 'Event Organizer',
    description: 'Create and manage milongas, practicas, and special events',
    benefits: [
      'Full event management dashboard',
      'Recurring event support',
      'Attendee communication tools',
      'Event analytics'
    ]
  },
  {
    icon: <MusicNoteIcon sx={{ color: 'success.main', fontSize: 40 }} />,
    title: 'Tango DJ',
    description: 'Promote your DJ services and connect with event organizers',
    benefits: [
      'DJ profile with music samples',
      'Event booking calendar',
      'Equipment and style descriptions',
      'Direct organizer messaging'
    ]
  },
  {
    icon: <SchoolIcon sx={{ color: 'info.main', fontSize: 40 }} />,
    title: 'Tango Teacher',
    description: 'List your classes, workshops, and build your student base',
    benefits: [
      'Class schedule management',
      'Student registration tools',
      'Workshop promotion',
      'Teaching credential display'
    ]
  },
  {
    icon: <LocationOnIcon sx={{ color: 'warning.main', fontSize: 40 }} />,
    title: 'Venue Manager',
    description: 'Showcase your venue and attract tango events',
    benefits: [
      'Venue profile with photos',
      'Availability calendar',
      'Rental information',
      'Direct booking inquiries'
    ]
  }
];

const faqs = [
  {
    question: 'Is TangoTiempo really free?',
    answer: 'Yes! Creating an account and using all basic features is completely free. This includes browsing events, creating a profile, and for organizers, listing your events. We believe in making tango accessible to everyone.'
  },
  {
    question: 'How do I become an organizer?',
    answer: 'Simply create a free account and apply to become an organizer through your user settings. Once approved (usually within 24 hours), you can start creating and managing events immediately.'
  },
  {
    question: 'What types of events can I find?',
    answer: 'TangoTiempo lists all types of tango events including: Milongas, Classes, Workshops, Practicas, Festivals, Marathons, and Special Events. Each event type has its own icon and color for easy identification.'
  },
  {
    question: 'Is TangoTiempo available in my country?',
    answer: 'Yes! TangoTiempo is a global platform. We have events listed in over 50 countries and support multiple languages. If your area doesn\'t have many events yet, be the first to help build the community!'
  },
  {
    question: 'How accurate is the event information?',
    answer: 'All events are managed directly by their organizers, ensuring up-to-date and accurate information. Organizers can update their events in real-time, so you always have the latest details.'
  }
];

export default function BenefitsPage() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { user } = auth || {};

  const handleGetStarted = () => {
    if (user) {
      router.push('/');
    } else {
      router.push('/auth/signup');
    }
  };

  const handleBecomeOrganizer = () => {
    if (user) {
      router.push('/organizers/apply');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Why Join TangoTiempo?
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Discover the benefits of joining the world's premier tango event platform
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleGetStarted}
          sx={{ mr: 2 }}
        >
          {user ? 'Go to Calendar' : 'Get Started Free'}
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={handleBecomeOrganizer}
        >
          Become an Organizer
        </Button>
      </Box>

      {/* For Everyone Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          For Every Tango Enthusiast
        </Typography>
        <Grid container spacing={4}>
          {generalBenefits.map((benefit, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    {benefit.icon}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {benefit.description}
                      </Typography>
                      <List dense>
                        {benefit.features.map((feature, idx) => (
                          <ListItem key={idx} disableGutters>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* For Organizers Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          For Event Organizers
        </Typography>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'primary.light', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'primary.contrastText', textAlign: 'center' }}>
            Join hundreds of organizers who trust TangoTiempo to promote their events and grow their community
          </Typography>
        </Paper>
        <Grid container spacing={4}>
          {organizerBenefits.map((benefit, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    {benefit.icon}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {benefit.description}
                      </Typography>
                      <List dense>
                        {benefit.features.map((feature, idx) => (
                          <ListItem key={idx} disableGutters>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Specialist Roles Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Join as a Specialist
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Whether you're an organizer, DJ, teacher, or venue manager, TangoTiempo has tools designed for you
        </Typography>
        <Grid container spacing={3}>
          {specialistRoles.map((role, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardContent>
                  {role.icon}
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {role.description}
                  </Typography>
                  <List dense>
                    {role.benefits.map((benefit, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Platform Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Platform Excellence
        </Typography>
        <Grid container spacing={3}>
          {platformFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  '&:hover': { elevation: 4 }
                }}
              >
                {feature.icon}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {feature.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* FAQs */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          mt: 8, 
          p: 6, 
          backgroundColor: 'secondary.light', 
          borderRadius: 2, 
          textAlign: 'center' 
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to Join the TangoTiempo Community?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Start discovering amazing tango events or share your own with the world
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleGetStarted}
            sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
          >
            {user ? 'Explore Events' : 'Sign Up Free'}
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={handleBecomeOrganizer}
          >
            Apply as Organizer
          </Button>
        </Box>
      </Box>

      {/* Footer Links */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Have questions? Check out our{' '}
          <Link href="/about" style={{ color: 'inherit' }}>
            About page
          </Link>
          {' '}or{' '}
          <Link href="/message-admin" style={{ color: 'inherit' }}>
            contact us
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}