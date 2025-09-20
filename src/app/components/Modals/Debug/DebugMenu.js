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

const DebugModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          minHeight: fullScreen ? '100%' : '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'error.main', 
        color: 'error.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <BugReportIcon />
        <Typography variant="h6">Debug Information</Typography>
      </DialogTitle>
      
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={fullScreen ? "scrollable" : "fullWidth"}
          scrollButtons={fullScreen ? "auto" : false}
          allowScrollButtonsMobile
          aria-label="debug information tabs"
          sx={{
            '.MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.875rem'
            }
          }}
        >
          <Tab 
            icon={<CodeIcon />} 
            label="Env" 
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
      
      <DialogContent sx={{ 
        flex: 1,
        p: 0,
        overflow: 'hidden'
      }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
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
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DebugModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DebugModal;