'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import CloudIcon from '@mui/icons-material/Cloud';
import EnvVariablesDebug from './EnvVariablesDebug';
import AuthContextDebug from './AuthContextDebug';
import CloudFlareDebug from './CloudFlareDebug';
import RoleContextDebug from './RoleContextDebug';
import MasteredLocationContextDebug from './MasteredLocationContextDebug';
import GeoLocationContextDebug from './GeoLocationContextDebug';
import ModalHeader from '@/components/UI/ModalHeader';

/**
 * Debug Menu Component
 * 
 * Provides a tabbed interface to view and debug different contexts and environment variables.
 * This is a temporary component that will be removed 6 months after launch.
 */
const DebugMenu = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          maxHeight: isMobile ? '100vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          ...(isMobile && {
            margin: 0,
            borderRadius: 0,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          })
        }
      }}
    >
      {isMobile ? (
        <ModalHeader 
          title="Debug Menu" 
          onClose={onClose}
          actions={
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV}
            </Typography>
          }
        />
      ) : (
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <BugReportIcon sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="h6">Debug Menu</Typography>
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              (Current environment: {process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV})
            </Typography>
          </Box>
        </DialogTitle>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: isMobile ? 1 : 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="debug tabs"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile>
          <Tab 
            icon={<CodeIcon />} 
            label="Environment" 
            id="debug-tab-0" 
            aria-controls="debug-tabpanel-0"
          />
          <Tab 
            icon={<AccountCircleIcon />} 
            label="Auth" 
            id="debug-tab-1" 
            aria-controls="debug-tabpanel-1"
          />
          <Tab 
            icon={<CloudIcon />} 
            label="CloudFlare" 
            id="debug-tab-2" 
            aria-controls="debug-tabpanel-2"
          />
          <Tab 
            icon={<PersonIcon />} 
            label="Role" 
            id="debug-tab-3" 
            aria-controls="debug-tabpanel-3"
          />
          <Tab 
            icon={<LocationOnIcon />} 
            label="Mastered Location" 
            id="debug-tab-4" 
            aria-controls="debug-tabpanel-4"
          />
          <Tab 
            icon={<MapIcon />} 
            label="Geo Location" 
            id="debug-tab-5" 
            aria-controls="debug-tabpanel-5"
          />
        </Tabs>
      </Box>
      
      <DialogContent sx={{ flexGrow: 1, overflow: 'auto', padding: 0 }}>
        <Box role="tabpanel" hidden={activeTab !== 0} id="debug-tabpanel-0" aria-labelledby="debug-tab-0" sx={{ p: 3 }}>
          {activeTab === 0 && <EnvVariablesDebug />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 1} id="debug-tabpanel-1" aria-labelledby="debug-tab-1" sx={{ p: 3 }}>
          {activeTab === 1 && <AuthContextDebug />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 2} id="debug-tabpanel-2" aria-labelledby="debug-tab-2" sx={{ p: 3 }}>
          {activeTab === 2 && <CloudFlareDebug />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 3} id="debug-tabpanel-3" aria-labelledby="debug-tab-3" sx={{ p: 3 }}>
          {activeTab === 3 && <RoleContextDebug />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 4} id="debug-tabpanel-4" aria-labelledby="debug-tab-4" sx={{ p: 3 }}>
          {activeTab === 4 && <MasteredLocationContextDebug />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 5} id="debug-tabpanel-5" aria-labelledby="debug-tab-5" sx={{ p: 3 }}>
          {activeTab === 5 && <GeoLocationContextDebug />}
        </Box>
      </DialogContent>
      
      {!isMobile && (
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

DebugMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DebugMenu;