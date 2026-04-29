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
import Image from 'next/image';
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
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      {/* Brand hero */}
      <Box sx={{ mb: 2 }}>
        <Image
          src="/brand/Brand-MTGT-Orange-V-WIDE-1.png"
          alt="TangoTiempo — Move Together. Grow Together."
          width={900}
          height={160}
          style={{ width: '100%', height: 'auto', borderRadius: 8 }}
        />
      </Box>

      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => router.push('/calendar')}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {isOutreachFlow ? 'Welcome to TangoTiempo' : 'Become a TangoTiempo Organizer'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          {isOutreachFlow
            ? "You've been invited to join our organizer community. Let's get you set up."
            : 'List your milongas, practicas, classes, or join as a venue, DJ, teacher, or maestro. Always free.'
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