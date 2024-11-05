// SidebarDrawer.js
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
  IconButton,
  Collapse,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
import SystemAdminModal from '@/components/Modals/SystemAdmin/SystemAdminModal';

import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';
import RegionMenu from './RegionMenu';
import UserSettingsModal from '@/components/Modals/UserSettings/UserSettingsModal';
import RegionalOrganizersModal from '@/components/Modals/RegionalOrganizers/RegionalOrganizersModal';
import PrivacyPolicyModal from '@/components/Modals/misc/PrivacyPolicyModal';
import FAQModal from '@/components/Modals/misc/FAQModal';
import { RoleContext } from '@/contexts/RoleContext';
import { listOfAllRoles } from '@/utils/masterData';

const SidebarDrawer = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [regionalOrganizerOpen, setRegionalOrganizerOpen] = useState(false);
  const [systemAdminOpen, setSystemAdminOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false); // State for FAQ modal

  const { selectedRole = 'None' } = useContext(RoleContext) || {};

  const toggleExpansion = () => setExpanded((prev) => !prev);

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          width: expanded ? 240 : 72,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: expanded ? 240 : 72,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          {/* Expandable Menu */}
          <ListItem button="true" onClick={toggleExpansion}>
            <ListItemIcon>
              <IconButton>
                <MenuIcon />
              </IconButton>
            </ListItemIcon>
            {expanded && <ListItemText primary="Menu" />}
          </ListItem>

          {/* Regions Section */}
          <ListItem
            button="true"
            onClick={() => {
              if (!expanded) toggleExpansion();
              setRegionMenuOpen(!regionMenuOpen);
            }}
          >
            <ListItemIcon>
              <Avatar
                alt="Select Region"
                src="/images/Regions/RegionsIcon.png"
                sx={{ width: 32, height: 32 }}
              />
            </ListItemIcon>
            {expanded && (
              <>
                <ListItemText primary="Regions" />
                {regionMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>

          <Collapse in={regionMenuOpen} timeout="auto" unmountOnExit>
            <RegionMenu
              expanded={expanded}
              onClose={() => setRegionMenuOpen(false)}
            />
          </Collapse>

          <Divider />
          {/* Prompt for "None" Role */}
          {selectedRole === '' && (
            <ListItem>
              <ListItemIcon>
                <ErrorIcon sx={{ color: 'orange' }} />
              </ListItemIcon>
              {expanded && <ListItemText primary="Sign In to Save Settings" />}
            </ListItem>
          )}

          {/* Conditionally Render Based on Role */}
          {selectedRole === listOfAllRoles.NAMED_USER && (
            <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: 'blue' }} />
              </ListItemIcon>
              {expanded && <ListItemText primary="User Settings" />}
            </ListItem>
          )}

          {selectedRole === listOfAllRoles.REGIONAL_ORGANIZER && (
            <>
              <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
                <ListItemIcon>
                  <AccountCircleIcon sx={{ color: 'blue' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="User Settings" />}
              </ListItem>
              <ListItem
                button="true"
                onClick={() => setRegionalOrganizerOpen(true)}
              >
                <ListItemIcon>
                  <EventAvailableIcon sx={{ color: 'green' }} />
                </ListItemIcon>
                {expanded && (
                  <ListItemText primary="Regional Organizer Settings" />
                )}
              </ListItem>
            </>
          )}

          {selectedRole === listOfAllRoles.REGIONAL_ADMIN && (
            <>
              <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
                <ListItemIcon>
                  <AccountCircleIcon sx={{ color: 'blue' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="User Settings" />}
              </ListItem>
              <ListItem button="true">
                <ListItemIcon>
                  <CoPresentIcon sx={{ color: 'red' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="Regional Admin Settings" />}
              </ListItem>
            </>
          )}

          {selectedRole === listOfAllRoles.SYSTEM_ADMIN && (
            <>
              <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
                <ListItemIcon>
                  <AccountCircleIcon sx={{ color: 'blue' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="User Settings" />}
              </ListItem>
              <ListItem button="true">
                <ListItemIcon>
                  <AdminPanelSettingsIcon sx={{ color: 'red' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="System Admin Settings" />}
              </ListItem>
            </>
          )}

          {selectedRole === listOfAllRoles.SYSTEM_OWNER && (
            <>
              <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
                <ListItemIcon>
                  <AccountCircleIcon sx={{ color: 'blue' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="User Settings" />}
              </ListItem>
              <ListItem button="true" onClick={() => setSystemAdminOpen(true)}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon sx={{ color: 'red' }} />
                </ListItemIcon>
                {expanded && <ListItemText primary="System Admin Panel" />}
              </ListItem>
            </>
          )}

          <Divider />

          {/* General Links */}

          <Link href="/about" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <GroupIcon sx={{ color: 'royalBlue' }} />
              </ListItemIcon>
              {expanded && <ListItemText primary="Meet the Team" />}
            </ListItem>
          </Link>

          {/* FAQ Item - Open FAQ Modal on Click */}
          <ListItem button="true" onClick={() => setFaqOpen(true)}>
            <ListItemIcon>
              <FormatIndentIncreaseIcon sx={{ color: 'royalBlue' }} />
            </ListItemIcon>
            {expanded && <ListItemText primary="FAQ" />}
          </ListItem>

          <ListItem button="true">
            <ListItemIcon>
              <HelpIcon sx={{ color: 'royalBlue' }} />
            </ListItemIcon>
            {expanded && <ListItemText primary="Help" />}
          </ListItem>

          <Link href="/about" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <SupportIcon sx={{ color: 'royalBlue' }} />
              </ListItemIcon>
              {expanded && <ListItemText primary="About" />}
            </ListItem>
          </Link>

          <Divider />
          <ListItem button="true">
            <ListItemIcon>
              <MessageIcon sx={{ color: 'coral' }} />
            </ListItemIcon>
            {expanded && <ListItemText primary="Message Admin" />}
          </ListItem>

          <ListItem button="true" onClick={() => setPrivacyPolicyOpen(true)}>
            <ListItemIcon>
              <LockIcon sx={{ color: 'green' }} />
            </ListItemIcon>
            {expanded && <ListItemText primary="Privacy Policy" />}
          </ListItem>
        </List>
      </Drawer>

      {/* Modals */}
      <UserSettingsModal
        open={userSettingsOpen}
        onClose={() => setUserSettingsOpen(false)}
      />
      <RegionalOrganizersModal
        open={regionalOrganizerOpen}
        onClose={() => setRegionalOrganizerOpen(false)}
      />
      <SystemAdminModal
        open={systemAdminOpen}
        onClose={() => setSystemAdminOpen(false)}
      />
      <FAQModal
        open={faqOpen}
        onClose={() => setFaqOpen(false)} // FAQ modal control
      />
      <PrivacyPolicyModal
        open={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
      />
    </>
  );
};

SidebarDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarDrawer;
