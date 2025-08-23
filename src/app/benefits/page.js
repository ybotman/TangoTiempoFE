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
  IconButton,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BenefitsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  const milonguerBenefits = [
    { icon: <BookmarkIcon />, text: 'Save your settings and preferences' },
    { icon: <StarIcon />, text: 'Mark favorite events and organizers' },
    { icon: <MessageIcon />, text: 'Direct message event organizers' },
    { icon: <LocationOnIcon />, text: 'Set your default location' },
    { icon: <CalendarMonthIcon />, text: 'See events in your area' },
    { icon: <VisibilityIcon />, text: 'Get discovered by event organizers' },
  ];

  const organizerBenefits = [
    { icon: <EventIcon />, text: 'Create and manage your tango events' },
    { icon: <VisibilityIcon />, text: 'Anyone and everyone can see your events' },
    { icon: <PhotoCameraIcon />, text: 'Upload event images and flyers' },
    { icon: <MessageIcon />, text: 'Message with Milonguero@s who favorite you' },
    { icon: <GroupsIcon />, text: 'Dancers can contact you directly' },
    { icon: <CheckCircleIcon />, text: 'Get notifications when dancers interact' },
    { icon: <StarIcon />, text: 'Build your reputation as an organizer' },
    { icon: <LocationOnIcon />, text: 'Reach dancers within your geographic range' },
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
      title: 'Taxi Dancers',
      items: ['Get hired for events', 'Connect with dancers', 'Build clientele']
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
      answer: 'Dancers can browse events freely. Create a Milonguer@ account to bookmark events and message organizers.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: 4
    }}>
      <Container maxWidth="md">
        {/* Back to Calendar Arrow */}
        <Box sx={{ pt: 2 }}>
          <IconButton
            onClick={() => router.push('/calendar')}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            component="span" 
            variant="body2" 
            sx={{ ml: 1, color: 'text.secondary' }}
          >
            Back to Calendar
          </Typography>
        </Box>

        {/* Header with single SIGN UP button */}
        <Box sx={{ 
          textAlign: 'center', 
          pt: { xs: 2, md: 3 },
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
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'text.secondary'
            }}
          >
            Event entry and viewing will always be free to all Tangueros
          </Typography>

          <Button
            variant="contained"
            size="medium"
            onClick={handleJoinClick}
            sx={{
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 'medium',
              borderRadius: 1,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            SIGN UP
          </Button>

        </Box>

        {/* Accordion Tabs */}
        <Box sx={{ mt: 4 }}>
          {/* Milonguero@ Benefits Accordion */}
          <Accordion 
            expanded={expanded === 'milonguero'} 
            onChange={handleAccordionChange('milonguer')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Milonguer@
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {milonguerBenefits.map((benefit, index) => (
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

          {/* Event Organizer Benefits Accordion */}
          <Accordion 
            expanded={expanded === 'organizer'} 
            onChange={handleAccordionChange('organizer')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Event Organizers
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {organizerBenefits.map((benefit, index) => (
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
                Who Else It's For
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

      </Container>
    </Box>
  );
}