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
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
// import ErrorIcon from '@mui/icons-material/Error';
import SupportIcon from '@mui/icons-material/Support';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import MessageIcon from '@mui/icons-material/Message';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import BusinessIcon from '@mui/icons-material/Business';
import BugReportIcon from '@mui/icons-material/BugReport';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import UpdateIcon from '@mui/icons-material/Update';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
//import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';
//import RegionMenu from './RegionMenu';
import UserSettingsModal from '@/components/Modals/UserSettings/UserSettingsModal';
import RegionalOrganizersModal from '@/components/Modals/RegionalOrganizers/RegionalOrganizersModal';
import PrivacyPolicyModal from '@/components/Modals/misc/PrivacyPolicyModal';
import FAQModal from '@/components/Modals/misc/FAQModal';
import SystemAdminModal from '@/components/Modals/SystemAdmin/SystemAdminModal';
import { RoleContext } from '@/contexts/RoleContext';
import { AuthContext } from '@/contexts/AuthContext';
import { listOfAllRoles } from '@/utils/masterData';
import VenueModal from '@/components/Modals/Venues/VenueModal';
import VenueSelectionModal from '@/components/Modals/Venues/VenueSelectionModal';
import MapIcon from '@mui/icons-material/Map';
// Removed LocationContextModal import - using map center mode only
// MapCenterModal moved to Providers for centralized rendering
import DebugMenu from '@/components/Modals/Debug/DebugMenu'; // NEW DEBUG MENU
import ServiceStatusModal from '@/components/DevTools/ServiceStatusModal'; // Service Status Dashboard
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import RegionalOrganizerSelection from '@/components/Modals/RegionalOrganizers/RegionalOrganizerSelection'; // ORGANIZER SELECTION
import { useGeoLocation } from '@/contexts/GeoLocationContext';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import { useVenueSelection } from '@/hooks/useVenueSelection';
import { userSettingsEvent } from '@/utils/UserSettingsEvent';
import { regionalOrganizerEvent } from '@/utils/RegionalOrganizerEvent';

const SidebarDrawer = ({ open, onClose }) => {
  //  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [regionalOrganizerOpen, setRegionalOrganizerOpen] = useState(false);
  const [systemAdminOpen, setSystemAdminOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  // const [locationModalOpen, setLocationModalOpen] = useState(false); // Removed - using map center mode only
  const [venueSelectionModalOpen, setVenueSelectionModalOpen] = useState(false);
  const [organizerSelectionModalOpen, setOrganizerSelectionModalOpen] = useState(false);
  const [requestedTab, setRequestedTab] = useState(null);

  // TIEMPO-381: Track Boston route for conditional rendering
  const [isBostonRoute, setIsBostonRoute] = useState(false);

  useEffect(() => {
    setIsBostonRoute(window.location.pathname.includes('/boston'));
  }, []);

  // NEW STATE FOR DEBUG MENU
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);

  // State for Service Status Modal
  const [serviceStatusOpen, setServiceStatusOpen] = useState(false);

  const { selectedRole = 'None' } = useContext(RoleContext) || {};
  const { user } = useContext(AuthContext) || {};

  // Get selected location and initialization state from GeoLocationContext
  const { selectedLocation, isInitialized, openMapCenterModal } = useGeoLocation();

  // Get the organizer selection state from useCalendarPage
  const { selectedOrganizers, setSelectedOrganizers } = useCalendarPage();
  
  // Get venue selection state
  useVenueSelection();
  
  // Debug menu is only available for Regional Admin, System Admin, and System Owner
  const showDebugMenu = [
    listOfAllRoles.REGIONAL_ADMIN,
    listOfAllRoles.SYSTEM_ADMIN,
    listOfAllRoles.SYSTEM_OWNER
  ].includes(selectedRole);
  
  // Add delay to venue selection rendering to ensure GeoLocationContext has time to initialize
  const [, setVenueSelectionReady] = useState(false);
  
  // Subscribe to user settings event
  useEffect(() => {
    const handleUserSettingsRequest = ({ open, tab }) => {
      // TIEMPO-276: Security cleanup - removed settings logging
      if (open) {
        setRequestedTab(tab);
        setUserSettingsOpen(true);
      }
    };

    const unsubscribe = userSettingsEvent.subscribe(handleUserSettingsRequest);

    return () => {
      unsubscribe();
    };
  }, []);

  // TIEMPO-253: Subscribe to regional organizer modal event
  useEffect(() => {
    const handleRegionalOrganizerRequest = ({ open }) => {
      // TIEMPO-276: Security cleanup - removed organizer logging
      setRegionalOrganizerOpen(open);
    };

    const unsubscribe = regionalOrganizerEvent.subscribe(handleRegionalOrganizerRequest);

    return () => {
      unsubscribe();
    };
  }, []);
  
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
      // TIEMPO-276: Security cleanup - removed venue logging
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

          <Divider />

          {/* Dynamic Authentication-Based Section */}
          {!user ? (
            // Not Logged In Menu Items
            <>
              <Typography variant="caption" color="textSecondary" sx={{ pl: 2, pt: 1 }}>
                It&apos;s FREE!
              </Typography>
              <Link href="/benefits" passHref>
                <ListItem
                  button="true"
                  onClick={() => onClose()}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    mx: 1,
                    borderRadius: 1,
                    mt: 1
                  }}
                >
                  <ListItemIcon>
                    <RocketLaunchIcon sx={{ color: 'white' }} />
                  </ListItemIcon>
                  <ListItemText primary="Milonguero@ Benefits" />
                </ListItem>
              </Link>
              
              <Divider sx={{ my: 1 }} />
              
              <Link href="/auth/login" passHref>
                <ListItem
                  button="true"
                  onClick={() => onClose()}
                >
                  <ListItemIcon>
                    <LoginIcon sx={{ color: 'green' }} />
                  </ListItemIcon>
                  <ListItemText primary="Sign In" />
                </ListItem>
              </Link>
              
              <Link href="/auth/signup" passHref>
                <ListItem
                  button="true"
                  onClick={() => onClose()}
                >
                  <ListItemIcon>
                    <PersonAddIcon sx={{ color: 'blue' }} />
                  </ListItemIcon>
                  <ListItemText primary="Create Account" />
                </ListItem>
              </Link>
            </>
          ) : (
            // Logged In Menu Items
            <>
              <Typography variant="caption" color="textSecondary" sx={{ pl: 2, pt: 1 }}>
                User Settings
              </Typography>
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

              {/* Event Organizer Settings - moved next to User Settings */}
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
                      <GroupIcon sx={{ color: 'green' }} />
                    </ListItemIcon>
                    <ListItemText primary="Event Organizer Settings" />
                  </ListItem>

                  {/* Venues - nested under Event Organizer Settings */}
                  <ListItem
                    button="true"
                    onClick={() => {
                      setVenueModalOpen(true);
                      onClose();
                    }}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <BusinessIcon sx={{ color: 'teal' }} />
                    </ListItemIcon>
                    <ListItemText primary="Venues" secondary="Manage event locations" />
                  </ListItem>
                </>
              )}

              {/* TIEMPO-259: Map Center Menu Item - TIEMPO-381: Show different content for Boston */}
              {isBostonRoute ? (
                // Boston route: Link to main site instead of Map Center
                <Link href="https://www.tangotiempo.com/calendar" passHref>
                  <ListItem
                    button="true"
                    onClick={() => onClose()}
                  >
                    <ListItemIcon>
                      <MapIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Want more events?"
                      secondary="Explore all regions at TangoTiempo.com"
                    />
                  </ListItem>
                </Link>
              ) : (
                // Normal routes: Show Map Center
                <ListItem
                  button="true"
                  onClick={() => {
                    openMapCenterModal();
                    onClose();
                  }}
                >
                  <ListItemIcon>
                    <MapIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Set Map Center"
                    secondary="Filter events by location"
                  />
                </ListItem>
              )}
              <Divider />
              
              {/* Only show Apply as Organizer if user is not already an approved and enabled organizer */}
              {selectedRole !== listOfAllRoles.REGIONAL_ORGANIZER && 
               selectedRole !== listOfAllRoles.SYSTEM_ADMIN && 
               selectedRole !== listOfAllRoles.SYSTEM_OWNER && 
               !(user?.backendInfo?.regionalOrganizerInfo?.isApproved && 
                 user?.backendInfo?.regionalOrganizerInfo?.isEnabled) && (
                <Link href="/organizers/apply" passHref>
                  <ListItem
                    button="true"
                    onClick={() => onClose()}
                  >
                    <ListItemIcon>
                      <GroupIcon sx={{ color: 'indigo' }} />
                    </ListItemIcon>
                    <ListItemText primary="Apply as Organizer" />
                  </ListItem>
                </Link>
              )}

              {/* Role-specific menu items */}
              {selectedRole === listOfAllRoles.SYSTEM_ADMIN && (
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
              
              <Link href="/geo-diagnostics" passHref>
                <ListItem
                  button="true"
                  onClick={() => onClose()}
                >
                  <ListItemIcon>
                    <GpsFixedIcon sx={{ color: 'orange' }} />
                  </ListItemIcon>
                  <ListItemText primary="Geo-Diagnostics" />
                </ListItem>
              </Link>
            </>
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
              
              <Link href="/geo-diagnostics" passHref>
                <ListItem
                  button="true"
                  onClick={() => onClose()}
                >
                  <ListItemIcon>
                    <GpsFixedIcon sx={{ color: 'orange' }} />
                  </ListItemIcon>
                  <ListItemText primary="Geo-Diagnostics" />
                </ListItem>
              </Link>
            </>
          )}
              
              {/* Close authentication section */}
            </>
          )}

          <Divider />

          {/* Event Explorer - TEMPORARILY HIDDEN - Will be re-enabled later */}
          {/*
          <Link href="/explorer" passHref>
            <ListItem
              button="true"
              onClick={() => onClose()}
            >
              <ListItemIcon>
                <PublicIcon sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Event Explorer"
                secondary="Discover events worldwide"
              />
            </ListItem>
          </Link>
          */}

          {/* Information Accordion - Collapsed by Default */}
          <Accordion defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, minHeight: 48 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ color: 'royalBlue', mr: 1 }} />
                <Typography>Information</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                <ListItem button="true" onClick={() => { setFaqOpen(true); onClose(); }}>
                  <ListItemIcon>
                    <FormatIndentIncreaseIcon sx={{ color: 'royalBlue' }} />
                  </ListItemIcon>
                  <ListItemText primary="FAQ" />
                </ListItem>
                <Link href="/about" passHref>
                  <ListItem button="true" onClick={() => onClose()}>
                    <ListItemIcon>
                      <SupportIcon sx={{ color: 'royalBlue' }} />
                    </ListItemIcon>
                    <ListItemText primary="About" />
                  </ListItem>
                </Link>
                <Link href="/artists-plus" passHref>
                  <ListItem button="true" onClick={() => onClose()}>
                    <ListItemIcon>
                      <GroupIcon sx={{ color: 'royalBlue' }} />
                    </ListItemIcon>
                    <ListItemText primary="Artists+" />
                  </ListItem>
                </Link>
                <Link href="/releases" passHref>
                  <ListItem button="true" onClick={() => onClose()}>
                    <ListItemIcon>
                      <UpdateIcon sx={{ color: 'royalBlue' }} />
                    </ListItemIcon>
                    <ListItemText primary="Release Notes" />
                  </ListItem>
                </Link>
                <ListItem
                  button="true"
                  onClick={() => {
                    setPrivacyPolicyOpen(true);
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
                    setServiceStatusOpen(true);
                    onClose();
                  }}
                >
                  <ListItemIcon>
                    <CloudQueueIcon sx={{ color: 'royalBlue' }} />
                  </ListItemIcon>
                  <ListItemText primary="Service Status" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          
          <Divider />
          
          {/* Message Admin - Always Available */}
          <Link href="/message-admin" passHref>
            <ListItem button="true" onClick={() => onClose()}>
              <ListItemIcon>
                <MessageIcon sx={{ color: 'coral' }} />
              </ListItemIcon>
              <ListItemText primary="Message Admin" />
            </ListItem>
          </Link>
          
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
      <UserSettingsModal 
        open={userSettingsOpen} 
        onClose={() => {
          setUserSettingsOpen(false);
          setRequestedTab(null);
        }}
        defaultTab={requestedTab}
      />
      <RegionalOrganizersModal open={regionalOrganizerOpen} onClose={() => setRegionalOrganizerOpen(false)} />
      <SystemAdminModal open={systemAdminOpen} onClose={() => setSystemAdminOpen(false)} />
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} />
      <PrivacyPolicyModal open={privacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)} />
      <VenueModal open={venueModalOpen} onClose={() => setVenueModalOpen(false)} />
      {/* LocationContextModal removed - using map center mode only */}
      {/* MapCenterModal moved to Providers for centralized rendering */}
      <VenueSelectionModal open={venueSelectionModalOpen} onClose={() => setVenueSelectionModalOpen(false)} />
      <RegionalOrganizerSelection
        open={organizerSelectionModalOpen}
        onClose={() => setOrganizerSelectionModalOpen(false)}
        selectedOrganizers={selectedOrganizers}
        onSelectOrganizers={(selected) => {
          // TIEMPO-276: Security cleanup - removed organizer logging
          setSelectedOrganizers(selected);
        }}
      />
      <DebugMenu open={debugMenuOpen} onClose={() => setDebugMenuOpen(false)} /> {/* DEBUG MENU */}
      <ServiceStatusModal open={serviceStatusOpen} onClose={() => setServiceStatusOpen(false)} />
    </>
  );
};

SidebarDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarDrawer;
