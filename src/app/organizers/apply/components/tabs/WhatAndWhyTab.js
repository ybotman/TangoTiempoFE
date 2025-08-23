'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const benefits = [
  {
    icon: <VisibilityIcon sx={{ color: 'primary.main' }} />,
    title: 'Increased Visibility',
    description: 'Reach thousands of tango dancers searching for events in your area'
  },
  {
    icon: <CalendarMonthIcon sx={{ color: 'success.main' }} />,
    title: 'Centralized Calendar',
    description: 'List all your events in one place, easily discoverable by the community'
  },
  {
    icon: <GroupsIcon sx={{ color: 'info.main' }} />,
    title: 'Community Connection',
    description: 'Connect with dancers, teachers, and other organizers worldwide'
  },
  {
    icon: <TrendingUpIcon sx={{ color: 'warning.main' }} />,
    title: 'Growth Tools',
    description: 'Analytics and insights to help grow your events and audience'
  },
  {
    icon: <PublicIcon sx={{ color: 'error.main' }} />,
    title: 'Global Reach',
    description: 'Attract traveling dancers and build international connections'
  },
  {
    icon: <FavoriteIcon sx={{ color: 'secondary.main' }} />,
    title: 'Community Support',
    description: 'Join a network of organizers dedicated to growing tango'
  }
];

const features = [
  'Free event listings with unlimited updates',
  'Professional organizer profile page',
  'Event management dashboard',
  'Direct messaging with attendees',
  'Photo galleries for your events',
  'Integration with social media',
  'Mobile-friendly interface',
  'Multi-language support',
  'Event analytics and reporting',
  'Customizable event categories'
];

const WhatAndWhyTab = () => {
  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        What is TangoTiempo & Why Join?
      </Typography>

      {/* Mission Section */}
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'primary.light', mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'primary.contrastText' }}>
          Our Mission
        </Typography>
        <Typography variant="body1" sx={{ color: 'primary.contrastText' }}>
          TangoTiempo is the premier global platform connecting the tango community. We bring together 
          dancers, organizers, teachers, musicians, and venues to create a vibrant, accessible, and 
          thriving tango ecosystem. Our goal is to make it easy for anyone to find, organize, and 
          participate in tango events anywhere in the world.
        </Typography>
      </Paper>

      {/* Benefits Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Benefits of Joining TangoTiempo
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {benefit.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {benefit.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Platform Features */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Platform Features
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2">{feature}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>


      {/* Call to Action */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'secondary.light', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Join the TangoTiempo Community Today
        </Typography>
        <Typography variant="body1">
          Be part of the global tango movement. Help us build a connected, vibrant, and 
          accessible tango community for dancers everywhere.
        </Typography>
      </Box>
    </Box>
  );
};

export default WhatAndWhyTab;
