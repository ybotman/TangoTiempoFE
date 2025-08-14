'use client';

import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MessageIcon from '@mui/icons-material/Message';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function BenefitsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState('benefits');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleJoinClick = () => {
    if (user) {
      router.push('/calendar');
    } else {
      router.push('/auth/signup');
    }
  };

  const benefits = [
    { icon: <EventIcon />, text: 'Create and manage your tango events' },
    { icon: <VisibilityIcon />, text: 'Get discovered by dancers in your area' },
    { icon: <LocationOnIcon />, text: 'Reach dancers within your geographic range' },
    { icon: <CalendarMonthIcon />, text: 'Automatic calendar integration' },
    { icon: <PhotoCameraIcon />, text: 'Upload event photos and flyers' },
    { icon: <MessageIcon />, text: 'Direct messaging with dancers' },
    { icon: <StarIcon />, text: 'Build your reputation as an organizer' },
    { icon: <BookmarkIcon />, text: 'Dancers can bookmark your events' },
  ];

  const whoItsFor = [
    { 
      title: 'Event Organizers',
      items: ['Host milongas', 'Organize practicas', 'Run workshops']
    },
    { 
      title: 'DJs & Musicians',
      items: ['Get booked for events', 'Share your music', 'Build following']
    },
    { 
      title: 'Artists & Performers',
      items: ['Showcase performances', 'Connect with venues', 'Promote shows']
    },
    { 
      title: 'Teachers',
      items: ['Advertise classes', 'Find students', 'Share knowledge']
    },
    { 
      title: 'Photographers',
      items: ['Document events', 'Share galleries', 'Get hired']
    }
  ];

  const faqs = [
    {
      question: 'Is it really free?',
      answer: 'Yes! Basic membership for event organizers is completely free. No hidden fees, no credit card required.'
    },
    {
      question: 'Who can join as an organizer?',
      answer: 'Anyone who organizes tango events - from weekly milongas to international festivals. You must be an active event organizer to apply.'
    },
    {
      question: 'Do you sell my data?',
      answer: 'Never! We respect your privacy. We never sell, share, or distribute your personal information to third parties.'
    },
    {
      question: 'How do I get started?',
      answer: 'Click JOIN above to create your free account. Then apply as an event organizer to start posting events.'
    },
    {
      question: 'What about dancers?',
      answer: 'Dancers can browse events freely. Create a Milonguero@ account to bookmark events and message organizers.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: 4
    }}>
      <Container maxWidth="md">
        {/* Header with single JOIN button */}
        <Box sx={{ 
          textAlign: 'center', 
          pt: { xs: 3, md: 5 },
          pb: 3
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold'
            }}
          >
            TangoTiempo
          </Typography>
          
          <Typography 
            variant="h6" 
            color="textSecondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            The National Tango Events Calendar
          </Typography>

          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3,
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            It's FREE!
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleJoinClick}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5
              }
            }}
          >
            JOIN
          </Button>

          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ mt: 2 }}
          >
            Your first step to reaching more dancers
          </Typography>
        </Box>

        {/* Accordion Tabs */}
        <Box sx={{ mt: 4 }}>
          {/* Benefits Accordion */}
          <Accordion 
            expanded={expanded === 'benefits'} 
            onChange={handleAccordionChange('benefits')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Benefits
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                      {benefit.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={benefit.text}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Who It's For Accordion */}
          <Accordion 
            expanded={expanded === 'who'} 
            onChange={handleAccordionChange('who')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Who It's For
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Discover and connect with DJs, artists, musicians, photographers, teachers, and more!
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {whoItsFor.map((category, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {category.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {category.items.map((item, idx) => (
                          <Chip 
                            key={idx} 
                            label={item} 
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* FAQ Accordion */}
          <Accordion 
            expanded={expanded === 'faq'} 
            onChange={handleAccordionChange('faq')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                FAQ
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {faqs.map((faq, index) => (
                  <Box key={index}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      {faq.question}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ pl: 2 }}
                    >
                      {faq.answer}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: 'primary.light',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SecurityIcon sx={{ color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  We never sell your data!
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Bottom CTA */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 5,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>
            Ready to reach more dancers?
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleJoinClick}
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none'
            }}
          >
            JOIN NOW - It's FREE
          </Button>
        </Box>
      </Container>
    </Box>
  );
}