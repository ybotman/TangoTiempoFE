'use client';

import React, { useState, Suspense } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

// Import tab components
import WhoCanApplyTab from './tabs/WhoCanApplyTab';
import ApplicationFormTab from './tabs/ApplicationFormTab';
import OutreachApplyForm from './OutreachApplyForm';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organizer-tabpanel-${index}`}
      aria-labelledby={`organizer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `organizer-tab-${index}`,
    'aria-controls': `organizer-tabpanel-${index}`,
  };
}

// Inner component that uses useSearchParams (requires Suspense boundary)
const OrganizerApplicationPortalInner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detect outreach token in URL or sessionStorage
  const orgToken = searchParams.get('orgToken') ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('outreach_orgToken') : null);
  const isOutreachFlow = !!orgToken;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabLabels = [
    'Apply Now',
    'Artists +'
  ];

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

      {/* SEO-friendly header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          {isOutreachFlow ? 'Welcome to TangoTiempo' : 'Become a TangoTiempo Organizer'}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          color="text.secondary"
          sx={{ maxWidth: '800px', mx: 'auto' }}
        >
          {isOutreachFlow
            ? 'You\'ve been invited to join our organizer community. Let\'s get you set up.'
            : 'Join our community of tango event organizers, venues, DJs, teachers, maestros, orchestras, and musicians'
          }
        </Typography>
      </Box>

      {isOutreachFlow ? (
        /* Outreach flow: single pre-filled form, no tabs */
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3 }}>
          <OutreachApplyForm />
        </Paper>
      ) : (
        /* Standard flow: tabbed portal (unchanged) */
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="organizer application tabs"
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
            >
              {tabLabels.map((label, index) => (
                <Tab
                  key={label}
                  label={label}
                  {...a11yProps(index)}
                  sx={{
                    minHeight: '64px',
                    fontWeight: activeTab === index ? 'bold' : 'normal'
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <ApplicationFormTab />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <WhoCanApplyTab />
          </TabPanel>
        </Paper>
      )}
    </Container>
  );
};

// Wrap with Suspense for useSearchParams (Next.js App Router requirement)
const OrganizerApplicationPortal = () => {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <OrganizerApplicationPortalInner />
    </Suspense>
  );
};

export default OrganizerApplicationPortal;