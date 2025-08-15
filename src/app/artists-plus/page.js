'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

const organizerTypes = [
  {
    title: 'Tango Event Hosts',
    subtitle: 'Milonga, Practica, Classes',
    icon: <EventIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    requirements: [
      'Active member of the tango community',
      'Experience organizing tango events',
      'Venue access for regular events',
      'Commitment to community building'
    ],
    color: '#e3f2fd',
    comingSoon: false
  },
  {
    title: 'DJs',
    subtitle: 'Tango Music Specialists',
    icon: <HeadphonesIcon sx={{ fontSize: 30, color: '#f57c00' }} />,
    requirements: [
      'Extensive tango music collection',
      'Professional audio equipment',
      'Understanding of tanda structure',
      'Experience at milongas'
    ],
    color: '#fff3e0',
    comingSoon: true
  },
  {
    title: 'Teachers',
    subtitle: 'Including Traveling Teachers',
    icon: <SchoolIcon sx={{ fontSize: 30, color: '#7b1fa2' }} />,
    requirements: [
      'Proven teaching experience',
      'Clear teaching methodology',
      'Student references available',
      'Flexible scheduling'
    ],
    color: '#f3e5f5',
    comingSoon: true
  },
  {
    title: 'Maestros',
    subtitle: 'Master Teachers & Couples',
    icon: <StarIcon sx={{ fontSize: 30, color: '#c62828' }} />,
    requirements: [
      'Professional performance history',
      'International teaching experience',
      'Specialized expertise',
      'Workshop availability'
    ],
    color: '#ffebee',
    comingSoon: true
  },
  {
    title: 'Orchestras',
    subtitle: 'Live Tango Music Ensembles',
    icon: <MusicNoteIcon sx={{ fontSize: 30, color: '#00695c' }} />,
    requirements: [
      'Complete tango ensemble',
      'Performance repertoire',
      'Professional equipment',
      'Booking availability'
    ],
    color: '#e0f2f1',
    comingSoon: true
  },
  {
    title: 'Tango Musicians',
    subtitle: 'Solo Artists & Aspiring Musicians',
    icon: <MusicNoteIcon sx={{ fontSize: 30, color: '#4527a0' }} />,
    requirements: [
      'Instrument proficiency',
      'Tango repertoire knowledge',
      'Performance experience',
      'Collaboration interest'
    ],
    color: '#ede7f6',
    comingSoon: true
  },
  {
    title: 'Taxi Dancers',
    subtitle: 'Professional Dance Partners',
    icon: <PeopleIcon sx={{ fontSize: 30, color: '#e91e63' }} />,
    requirements: [
      'Professional dance skills',
      'Experience with multiple dance styles',
      'Strong leading/following abilities',
      'Professional demeanor'
    ],
    color: '#fce4ec',
    comingSoon: true
  },
  {
    title: 'Regional Admins',
    subtitle: 'Community Leaders & Coordinators',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 30, color: '#bf360c' }} />,
    requirements: [
      'Strong community connections',
      'Organizational skills',
      'Time commitment available',
      'Communication abilities'
    ],
    color: '#fbe9e7',
    comingSoon: true
  },
  {
    title: 'Venues',
    subtitle: 'Dance Studios & Event Spaces',
    icon: <BusinessIcon sx={{ fontSize: 30, color: '#388e3c' }} />,
    requirements: [
      'Physical space suitable for tango',
      'Appropriate dance flooring',
      'Capacity for social dancing',
      'Liability insurance coverage'
    ],
    color: '#e8f5e9',
    comingSoon: true
  },
  {
    title: 'TangoTiempo BrainTrust',
    subtitle: 'Strategic Advisors & Innovators',
    icon: <PsychologyIcon sx={{ fontSize: 30, color: '#6a1b9a' }} />,
    requirements: [
      'Deep tango community knowledge',
      'Strategic thinking abilities',
      'Innovation and vision',
      'Commitment to platform growth'
    ],
    color: '#f3e5f5',
    comingSoon: true
  }
];

const ArtistsPlusPage = () => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please sign in to view Artist+ information.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={() => router.push('/calendar')}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
          Artists + Who Can Apply to TangoTiempo
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          TangoTiempo welcomes applications from all members of the tango community who contribute to 
          making tango events happen. Whether you organize events, provide venues, play music, teach, 
          or perform, we want to help you connect with the tango community.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {organizerTypes.map((type, index) => (
            <Accordion 
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
              sx={{ 
                backgroundColor: type.color,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {type.icon}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h4">
                      {type.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.subtitle}
                    </Typography>
                  </Box>
                  {type.comingSoon && (
                    <Chip 
                      label="Coming Soon" 
                      size="small" 
                      color="warning"
                      sx={{ mr: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Requirements:
                </Typography>
                
                <List dense>
                  {type.requirements.map((req, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 4, p: 3, backgroundColor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Multiple Roles Welcome!
          </Typography>
          <Typography variant="body2">
            Many community members wear multiple hats. You can apply for and maintain multiple 
            organizer types. For example, you might be both a DJ and a Teacher, or run a Venue 
            while also organizing Events.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArtistsPlusPage;