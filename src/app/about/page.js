// @/about/page.js

'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Button, 
  Box, 
  Container, 
  Typography, 
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function About() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: isMobile ? 1 : 3 }}>
      {/* Mobile-friendly header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/calendar" passHref>
          <IconButton size="small">
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'left' : 'center' }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" gutterBottom>
            Welcome to Tango Tiempo
          </Typography>
          <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary">
            America&apos;s Argentine Tango Calendar
          </Typography>
        </Box>
      </Box>

      {/* Main content */}
      <Paper sx={{ p: isMobile ? 2 : 4, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Tango Tiempo is the free national hub for Argentine tango events. Whether you&apos;re dancing in New Mexico, 
          attending festivals in San Francisco, teaching in Boston, or organizing events in Chicago — this is your place. 
          Our platform is <strong>Live</strong>, <strong>Free</strong>, and managed by tango organizers across the 
          United States. It features <strong>AI discovery</strong> to help dancers find the best tango experiences 
          anywhere in the U.S.
        </Typography>

        <Typography variant="body1" paragraph>
          We&apos;re actively engaging tango organizers throughout the United States, expanding city by city. 
          If you host any type of tango events (festivals, milongas, practicas, etc.), are a traveling teacher 
          &quot;Maestro&quot; or tango performer, have a local tango band, or teach Argentine tango — you belong 
          on this site. Just login and apply. It&apos;s always free to search and find events (with some upcoming 
          paid services like targeted event promotions and other advanced features). We want to make tango easier 
          to find, attend, and support. Just click the apply button. Here&apos;s a little secret: it&apos;s 
          automatically approved, but we do use AI to verify events follow our tango guidelines.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Want to get in touch? Connect with us through:
        </Typography>
        
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="center" gap={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            sx={{ backgroundColor: '#1877F2', '&:hover': { backgroundColor: '#145dbf' } }}
            href="https://www.facebook.com/tangotiempo"
            target="_blank"
            rel="noopener noreferrer"
            fullWidth={isMobile}
          >
            Facebook Messenger
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            sx={{ backgroundColor: '#EA4335', '&:hover': { backgroundColor: '#d33b2c' } }}
            href="mailto:admin@tangotiempo.com"
            fullWidth={isMobile}
          >
            Email Admin
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Link href="/calendar" passHref>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<CalendarTodayIcon />}
              size="large"
            >
              View the Live Calendar
            </Button>
          </Link>
        </Box>
      </Paper>

      {/* What Makes Us Different */}
      <Paper sx={{ p: isMobile ? 2 : 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          What Makes Tango Tiempo Different?
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Free & Always Will Be"
              secondary="Our core calendar is free to use, with no strings attached."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Nationwide Scope"
              secondary="Discover milongas, practicas, classes, and festivals coast to coast."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="AI Discovery"
              secondary="Smart filters and regional views help you find what you love."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Mobile-First"
              secondary="Use it from your phone, your laptop, or wherever you check your dance plans."
            />
          </ListItem>
        </List>
      </Paper>

      {/* Mission */}
      <Paper sx={{ p: isMobile ? 2 : 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to unite and strengthen the U.S. tango community by providing a comprehensive, 
          accessible, and free platform for discovering and sharing tango events. We believe that by 
          connecting dancers, organizers, and venues across the country, we can help Argentine tango 
          thrive in every corner of America.
        </Typography>
        <Typography variant="body1" paragraph>
          Tango Tiempo is built to unite the U.S. tango community. From small practicas to national 
          encuentros, we&apos;re here to support connection through dance.
        </Typography>
      </Paper>

      {/* About Our Logo */}
      <Paper sx={{ p: isMobile ? 2 : 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          About Our Logo
        </Typography>
        <Typography variant="body1" paragraph>
          The Tango Tiempo logo represents the timeless connection between dance partners and the 
          rhythmic pulse of tango music. The flowing design captures the elegance and passion of 
          Argentine tango, while the modern aesthetic reflects our commitment to bringing this 
          traditional dance into the digital age. Our logo embodies the spirit of community, 
          movement, and the shared moments that make tango special.
        </Typography>
        <Typography variant="body1">
          We do not sell your data. We are not ad-driven. We just believe tango deserves better tools.
        </Typography>
      </Paper>

      {/* AI-Guild and HDTS section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
          Built with AI Technology
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* AI-Guild Section */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              component="img"
              src="/AI GUILD Base.jpeg"
              alt="AI Guild"
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: 1,
                objectFit: 'cover'
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                100% AI-Built Application
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                This entire application is built by AI, with no human-written code. The AI-Guild 
                handles all development tasks: coding, merging, GitHub operations, JIRA tracking, 
                dashboarding, error handling, linting, testing, CI/CD, authentication, and promotion. 
                Humans interact through commands and approvals while the Guild performs all technical implementation.
              </Typography>
            </Box>
          </Box>

          {/* HDTS Section */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              component="img"
              src="/HDTS.jpg"
              alt="HDTS LLC"
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: 1,
                objectFit: 'contain',
                backgroundColor: 'white',
                p: 0.5
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                <Box 
                  component="a" 
                  href="https://www.hdtsllc.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'underline',
                    '&:hover': { textDecoration: 'none' }
                  }}
                >
                  HDTSllc.com
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Half Way Down the Stairs, LLC provides AI consulting and development services. 
                Specializing in generative AI, React-based AI applications, and document processing systems, 
                HDTS acts as your temporary AI team member for strategic implementation and custom solutions.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Links */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box 
            component="a"
            href="https://www.linkedin.com/in/toby-balsley-ea-ai-genai/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            🔗 Toby Balsley on LinkedIn
          </Box>
          <Box 
            component="a"
            href="https://www.hdtsllc.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            🌐 Visit HDTSllc.com
          </Box>
        </Box>
      </Paper>

      {/* Return to Calendar Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
        <Link href="/calendar" passHref>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<CalendarTodayIcon />}
            size="large"
          >
            Return to Calendar
          </Button>
        </Link>
      </Box>
    </Container>
  );
}