'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Tabs, 
  Tab, 
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

// Import tab components
import WhoCanApplyTab from './tabs/WhoCanApplyTab';
import ApplicationFormTab from './tabs/ApplicationFormTab';

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

const OrganizerApplicationPortal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

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
          Become a TangoTiempo Organizer
        </Typography>
        <Typography 
          variant="h6" 
          component="h2" 
          color="text.secondary"
          sx={{ maxWidth: '800px', mx: 'auto' }}
        >
          Join our community of tango event organizers, venues, DJs, teachers, maestros, orchestras, and musicians
        </Typography>
      </Box>

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
    </Container>
  );
};

export default OrganizerApplicationPortal;