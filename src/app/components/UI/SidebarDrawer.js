// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/components/UI/SidebarDrawer.js
// Explanation: We are removing the Regions icon item and replacing it with a new Map icon that opens the new LocationContextModal.
// We do not remove any underlying region code (like RegionMenu). We simply comment out the region UI code to "phase out" visually without dropping code.
// We add a new state for locationModalOpen, import MapIcon, and render the new modal.
// All other code remains as is. No functions or imports are dropped. Just commented out the region portion as requested.
// We include PropTypes at end as required.

'use client';
import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemIcon,
  ListItemText,
  //  Avatar,
  Typography,
  //  Collapse,
  CircularProgress,
  Box,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import LockIcon from '@mui/icons-material/Lock';
import ErrorIcon from '@mui/icons-material/Error';
import SupportIcon from '@mui/icons-material/Support';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import MessageIcon from '@mui/icons-material/Message';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import BusinessIcon from '@mui/icons-material/Business';
import BugReportIcon from '@mui/icons-material/BugReport';
//import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';
//import RegionMenu from './RegionMenu';
import UserSettingsModal from '@/components/Modals/UserSettings/UserSettingsModal';
import RegionalOrganizersModal from '@/components/Modals/RegionalOrganizers/RegionalOrganizersModal';
import PrivacyPolicyModal from '@/components/Modals/misc/PrivacyPolicyModal';
import FAQModal from '@/components/Modals/misc/FAQModal';
import SystemAdminModal from '@/components/Modals/SystemAdmin/SystemAdminModal';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';
import VenueModal from '@/components/Modals/Venues/VenueModal';
import VenueSelectionModal from '@/components/Modals/Venues/VenueSelectionModal';
import MapIcon from '@mui/icons-material/Map';
import LocationContextModal from '@/components/Modals/misc/LocationContextModal'; // NEW IMPORT
import DebugMenu from '@/components/Modals/Debug/DebugMenu'; // NEW DEBUG MENU
import RegionalOrganizerSelection from '@/components/Modals/RegionalOrganizers/RegionalOrganizerSelection'; // ORGANIZER SELECTION
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useCalendarPage } from '@/hooks/useCalendarPage';

const SidebarDrawer = ({ open, onClose }) => {
  //  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [regionalOrganizerOpen, setRegionalOrganizerOpen] = useState(false);
  const [systemAdminOpen, setSystemAdminOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);

  // NEW STATE FOR LOCATION MODAL
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // NEW STATE FOR VENUE SELECTION MODAL
  const [venueSelectionModalOpen, setVenueSelectionModalOpen] = useState(false);

  // NEW STATE FOR ORGANIZER SELECTION MODAL
  const [organizerSelectionModalOpen, setOrganizerSelectionModalOpen] = useState(false);

  // NEW STATE FOR DEBUG MENU
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);

  const { selectedRole = 'None' } = useContext(RoleContext) || {};

  // Get selected location and initialization state from GeoLocationContext
  const { selectedLocation, isInitialized } = useGeoLocation();

  // Get the organizer selection state from useCalendarPage
  const { selectedOrganizers, setSelectedOrganizers } = useCalendarPage();
  
  // Debug menu is now available in all environments for all users
  const showDebugMenu = true; // Previously restricted to development mode only
  
  // Add delay to venue selection rendering to ensure GeoLocationContext has time to initialize
  const [venueSelectionReady, setVenueSelectionReady] = useState(false);
  
  // Effect to handle venue selection readiness
  useEffect(() => {
    // Always consider ready if initialized, even with no city yet
    if (isInitialized) {
      setVenueSelectionReady(true);
      return;
    }

    // If we already have a city ID, immediately set ready state
    if (selectedLocation?.city?.id) {
      setVenueSelectionReady(true);
      return;
    }

    // Otherwise, give GeoLocationContext a moment to initialize
    const timer = setTimeout(() => {
      console.log('SidebarDrawer: Setting venue selection ready after timeout');
      setVenueSelectionReady(true);
    }, 2000); // 2 second delay, increased from original

    return () => clearTimeout(timer);
  }, [selectedLocation?.city?.id, isInitialized]);

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          {/* REGIONS SECTION - COMMENTED OUT AS WE ARE PHASING OUT, BUT NOT REMOVING */}
          {/* 
          <Divider />
          <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
            Select a Region
          </Typography>
          <ListItem button="true" onClick={() => setRegionMenuOpen(!regionMenuOpen)}>
            <ListItemIcon>
              <Avatar alt="Select Region" src="/images/Regions/RegionsIcon.png" sx={{ width: 32, height: 32 }} />
            </ListItemIcon>
            <ListItemText primary="Regions" />
            {regionMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={regionMenuOpen} timeout="auto" unmountOnExit>
            <RegionMenu onClose={() => setRegionMenuOpen(false)} />
          </Collapse>
          */}
          {/* END OF COMMENTED REGION SECTION */}

          {/* NEW MAP ICON SECTION */}
          <Divider />
          <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
            Calendar Location
          </Typography>
          <ListItem
            button="true"
            onClick={() => {
              setLocationModalOpen(true);
              onClose();
            }}
          >
            <ListItemIcon>
              <MapIcon sx={{ color: 'blue' }} />
            </ListItemIcon>
            <ListItemText primary="Select Nearest City" />
          </ListItem>
          {/* Select Organizer Menu Item */}
          <ListItem
            button="true"
            onClick={() => {
              setOrganizerSelectionModalOpen(true);
              onClose();
            }}
            sx={{
              cursor: 'pointer',
              color: selectedLocation?.city?.id ? 'text.primary' : 'text.secondary',
              bgcolor: selectedOrganizers?.length > 0 ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: selectedOrganizers?.length > 0 ? 'rgba(63, 81, 181, 0.12)' : 'rgba(0, 0, 0, 0.04)'
              },
              borderLeft: selectedOrganizers?.length > 0 ? '4px solid #3f51b5' : 'none',
              pl: selectedOrganizers?.length > 0 ? 1 : 2 // Compensate for the border
            }}
          >
            <ListItemIcon>
              <GroupIcon sx={{
                color: !selectedLocation?.city?.id
                  ? 'gray'
                  : selectedOrganizers?.length > 0
                    ? '#3f51b5'
                    : 'indigo'
              }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>Select Organizer</Typography>
                  {selectedOrganizers?.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: '#3f51b5',
                        color: 'white',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.2,
                        ml: 1
                      }}
                    >
                      {selectedOrganizers.length}
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                !selectedLocation?.city?.id
                  ? "Select a city first"
                  : selectedOrganizers?.length > 0
                    ? `${selectedOrganizers.length} organizer${selectedOrganizers.length !== 1 ? 's' : ''} selected`
                    : null
              }
            />
          </ListItem>

          {/* Venue Selection Menu Item with improved loading state handling */}
          {!venueSelectionReady ? (
            // Show loading state while contexts initialize
            <ListItem>
              <ListItemIcon>
                <CircularProgress size={20} color="primary" />
              </ListItemIcon>
              <ListItemText primary="Loading Venues..." />
            </ListItem>
          ) : !isInitialized ? (
            // System is still initializing but we want to show something
            <ListItem
              button="true"
              onClick={() => {
                setVenueSelectionModalOpen(true);
                onClose();
              }}
              sx={{
                cursor: 'pointer',
                color: 'text.secondary',
              }}
            >
              <ListItemIcon>
                <BusinessIcon sx={{ color: 'gray' }} />
              </ListItemIcon>
              <ListItemText
                primary="Select Venue"
                secondary="Location system initializing..."
              />
            </ListItem>
          ) : (
            // Interactive menu item that's always clickable and shows proper state
            <ListItem
              button="true"
              onClick={() => {
                setVenueSelectionModalOpen(true);
                onClose();
              }}
              sx={{
                cursor: 'pointer',
                color: selectedLocation?.city?.id ? 'text.primary' : 'text.secondary',
              }}
            >
              <ListItemIcon>
                <BusinessIcon sx={{ color: selectedLocation?.city?.id ? 'teal' : 'gray' }} />
              </ListItemIcon>
              <ListItemText
                primary="Select Venue"
                secondary={!selectedLocation?.city?.id ? "Select a city first" : null}
              />
            </ListItem>
          )}
          <Divider />

          <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
            Role Settings
          </Typography>
          {selectedRole === '' && (
            <ListItem>
              <ListItemIcon>
                <ErrorIcon sx={{ color: 'coral' }} />
              </ListItemIcon>
              <ListItemText primary="Sign In to Save Settings" />
            </ListItem>
          )}
          {selectedRole !== '' && (
            <ListItem
              button="true"
              onClick={() => {
                setUserSettingsOpen(true);
                onClose();
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: 'blue' }} />
              </ListItemIcon>
              <ListItemText primary="User Settings" />
            </ListItem>
          )}
          {selectedRole === listOfAllRoles.REGIONAL_ORGANIZER && (
            <>
              <ListItem
                button="true"
                onClick={() => {
                  setRegionalOrganizerOpen(true);
                  onClose();
                }}
              >
                <ListItemIcon>
                  <EventAvailableIcon sx={{ color: 'green' }} />
                </ListItemIcon>
                <ListItemText primary="Regional Organizer" />
              </ListItem>

              <ListItem
                button="true"
                onClick={() => {
                  setVenueModalOpen(true);
                  onClose();
                }}
              >
                <ListItemIcon>
                  <EventAvailableIcon sx={{ color: 'teal' }} />
                </ListItemIcon>
                <ListItemText primary="Venues" />
              </ListItem>
            </>
          )}
          {selectedRole === listOfAllRoles.SYSTEM_ADMIN && (
            <ListItem
              button="true"
              onClick={() => {
                setSystemAdminOpen(true);
                onClose();
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: 'purple' }} />
              </ListItemIcon>
              <ListItemText primary="System Admin" />
            </ListItem>
          )}
          {selectedRole === listOfAllRoles.SYSTEM_OWNER && (
            <>
              <ListItem
                button="true"
                onClick={() => {
                  setSystemAdminOpen(true);
                  onClose();
                }}
              >
                <ListItemIcon>
                  <AdminPanelSettingsIcon sx={{ color: 'purple' }} />
                </ListItemIcon>
                <ListItemText primary="System Admin" />
              </ListItem>

              <ListItem button="true">
                <ListItemIcon>
                  <CoPresentIcon sx={{ color: 'red' }} />
                </ListItemIcon>
                <ListItemText primary="System Owner" />
              </ListItem>
            </>
          )}
          <Divider />
          <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
            Information
          </Typography>
          <Link href="/about" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <GroupIcon sx={{ color: 'royalBlue' }} />
              </ListItemIcon>
              <ListItemText primary="Meet the Team" />
            </ListItem>
          </Link>
          <ListItem button="true" onClick={() => setFaqOpen(true)}>
            <ListItemIcon>
              <FormatIndentIncreaseIcon sx={{ color: 'royalBlue' }} />
            </ListItemIcon>
            <ListItemText primary="FAQ" />
          </ListItem>
          <ListItem button="true">
            <ListItemIcon>
              <HelpIcon sx={{ color: 'royalBlue' }} />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <Link href="/about" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <SupportIcon sx={{ color: 'royalBlue' }} />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
          </Link>
          <Divider />
          <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
            Other
          </Typography>
          <ListItem button="true">
            <ListItemIcon>
              <MessageIcon sx={{ color: 'coral' }} />
            </ListItemIcon>
            <ListItemText primary="Message Admin" />
          </ListItem>
          <ListItem
            button="true"
            onClick={() => {
              setUserSettingsOpen(true);
              onClose();
            }}
          >
            <ListItemIcon>
              <LockIcon sx={{ color: 'green' }} />
            </ListItemIcon>
            <ListItemText primary="Privacy Policy" />
          </ListItem>
          <ListItem
            button="true"
            onClick={() => {
              setPrivacyPolicyOpen(true);
              onClose();
            }}
          >
            <ListItemIcon>{/* Add an icon if needed */}</ListItemIcon>
            <ListItemText primary="Privacy Policy Details" />
          </ListItem>
          
          {/* Debug Menu - visible in all environments */}
          {showDebugMenu && (
            <>
              <Divider />
              <Typography variant="caption" color="textSecondary" sx={{ pl: 2 }}>
                Debug Tools
              </Typography>
              <ListItem
                button="true"
                onClick={() => {
                  setDebugMenuOpen(true);
                  onClose();
                }}
              >
                <ListItemIcon>
                  <BugReportIcon sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText primary="Debug Menu" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
      {/* Modals */}
      <UserSettingsModal open={userSettingsOpen} onClose={() => setUserSettingsOpen(false)} />
      <RegionalOrganizersModal open={regionalOrganizerOpen} onClose={() => setRegionalOrganizerOpen(false)} />
      <SystemAdminModal open={systemAdminOpen} onClose={() => setSystemAdminOpen(false)} />
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} />
      <PrivacyPolicyModal open={privacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)} />
      <VenueModal open={venueModalOpen} onClose={() => setVenueModalOpen(false)} />
      <LocationContextModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} /> {/* NEW MODAL */}
      <VenueSelectionModal open={venueSelectionModalOpen} onClose={() => setVenueSelectionModalOpen(false)} />
      <RegionalOrganizerSelection
        open={organizerSelectionModalOpen}
        onClose={() => setOrganizerSelectionModalOpen(false)}
        selectedOrganizers={selectedOrganizers}
        onSelectOrganizers={(selected) => {
          console.log('Selected organizers:', selected);
          setSelectedOrganizers(selected);
        }}
      />
      <DebugMenu open={debugMenuOpen} onClose={() => setDebugMenuOpen(false)} /> {/* DEBUG MENU */}
    </>
  );
};

SidebarDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarDrawer;
