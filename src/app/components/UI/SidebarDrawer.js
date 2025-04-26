// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: @/components/UI/SidebarDrawer.js
// Explanation: We are removing the Regions icon item and replacing it with a new Map icon that opens the new LocationContextModal.
// We do not remove any underlying region code (like RegionMenu). We simply comment out the region UI code to "phase out" visually without dropping code.
// We add a new state for locationModalOpen, import MapIcon, and render the new modal.
// All other code remains as is. No functions or imports are dropped. Just commented out the region portion as requested.
// We include PropTypes at end as required.

'use client';
import React, { useState, useContext } from 'react';
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
import { useGeoLocation } from '@/contexts/GeoLocationContext';

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

  const { selectedRole = 'None' } = useContext(RoleContext) || {};
  
  // Get selected location from GeoLocationContext to check if city is selected
  const { selectedLocation } = useGeoLocation();

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
          {/* New Venue Selection Menu Item */}
          <ListItem
            button="true"
            onClick={() => {
              setVenueSelectionModalOpen(true);
              onClose();
            }}
            disabled={!selectedLocation?.city?.id}
            sx={{
              opacity: selectedLocation?.city?.id ? 1 : 0.5,
              '&.Mui-disabled': {
                opacity: 0.5,
              }
            }}
          >
            <ListItemIcon>
              <BusinessIcon sx={{ color: selectedLocation?.city?.id ? 'teal' : 'gray' }} />
            </ListItemIcon>
            <ListItemText primary="Select Venue" />
          </ListItem>
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
    </>
  );
};

SidebarDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarDrawer;
