'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const organizerTypes = [
  {
    title: 'Tango Event Hosts',
    subtitle: 'Milonga, Practica, Classes',
    icon: <EventIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
    requirements: [
      'Active member of the tango community',
      'Experience organizing tango events',
      'Venue access for regular events',
      'Commitment to community building'
    ],
    color: '#e3f2fd'
  },
  {
    title: 'Venues',
    subtitle: 'Dance Studios & Event Spaces',
    icon: <BusinessIcon sx={{ fontSize: 40, color: '#388e3c' }} />,
    requirements: [
      'Physical space suitable for tango',
      'Appropriate dance flooring',
      'Capacity for social dancing',
      'Liability insurance coverage'
    ],
    color: '#e8f5e9'
  },
  {
    title: 'DJs',
    subtitle: 'Tango Music Specialists',
    icon: <HeadphonesIcon sx={{ fontSize: 40, color: '#f57c00' }} />,
    requirements: [
      'Extensive tango music collection',
      'Professional audio equipment',
      'Understanding of tanda structure',
      'Experience at milongas'
    ],
    color: '#fff3e0'
  },
  {
    title: 'Teachers',
    subtitle: 'Including Traveling Teachers',
    icon: <SchoolIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />,
    requirements: [
      'Proven teaching experience',
      'Clear teaching methodology',
      'Student references available',
      'Flexible scheduling'
    ],
    color: '#f3e5f5'
  },
  {
    title: 'Maestros',
    subtitle: 'Master Teachers & Couples',
    icon: <StarIcon sx={{ fontSize: 40, color: '#c62828' }} />,
    requirements: [
      'Professional performance history',
      'International teaching experience',
      'Specialized expertise',
      'Workshop availability'
    ],
    color: '#ffebee'
  },
  {
    title: 'Orchestras',
    subtitle: 'Live Tango Music Ensembles',
    icon: <MusicNoteIcon sx={{ fontSize: 40, color: '#00695c' }} />,
    requirements: [
      'Complete tango ensemble',
      'Performance repertoire',
      'Professional equipment',
      'Booking availability'
    ],
    color: '#e0f2f1'
  },
  {
    title: 'Tango Musicians',
    subtitle: 'Solo Artists & Aspiring Musicians',
    icon: <MusicNoteIcon sx={{ fontSize: 40, color: '#4527a0' }} />,
    requirements: [
      'Instrument proficiency',
      'Tango repertoire knowledge',
      'Performance experience',
      'Collaboration interest'
    ],
    color: '#ede7f6'
  },
  {
    title: 'Regional Admins',
    subtitle: 'Community Leaders & Coordinators',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: '#bf360c' }} />,
    requirements: [
      'Strong community connections',
      'Organizational skills',
      'Time commitment available',
      'Communication abilities'
    ],
    color: '#fbe9e7'
  }
];

const WhoCanApplyTab = () => {
  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Who Can Apply to TangoTiempo?
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        TangoTiempo welcomes applications from all members of the tango community who contribute to 
        making tango events happen. Whether you organize events, provide venues, play music, teach, 
        or perform, we want to help you connect with the tango community.
      </Typography>

      <Grid container spacing={3}>
        {organizerTypes.map((type, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: type.color,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {type.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" component="h4">
                      {type.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.subtitle}
                    </Typography>
                  </Box>
                </Box>
                
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
    </Box>
  );
};

export default WhoCanApplyTab;