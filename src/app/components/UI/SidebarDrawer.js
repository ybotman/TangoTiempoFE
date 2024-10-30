// SidebarDrawer.js
'use client';

import React, { useState } from 'react';
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
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import LockIcon from '@mui/icons-material/Lock';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PlaceIcon from '@mui/icons-material/Place';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MessageIcon from '@mui/icons-material/Message';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';
import RegionMenu from './RegionMenu';
import UserSettingsModal from '@/components/Modals/UserSettings/UserSettingsModal';
import RegionalOrganizersModal from '@/components/Modals/RegionalOrganizers/RegionalOrganizersModal';
import PrivacyPolicyModal from '@/components/Modals/PrivacyPolicyModal';

const SidebarDrawer = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false); // Modal state for User Settings
  const [regionalOrganizerOpen, setRegionalOrganizerOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false); // State for Privacy Policy modal

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

          {/* Region Menu */}
          <Collapse in={regionMenuOpen} timeout="auto" unmountOnExit>
            <RegionMenu
              expanded={expanded}
              onClose={() => setRegionMenuOpen(false)}
            />
          </Collapse>

          {/* User Settings - Opens UserSettingsModal */}
          <ListItem button="true" onClick={() => setUserSettingsOpen(true)}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="User Settings" />}
          </ListItem>

          {/* Organizer Settings */}
          <ListItem button="true">
            <ListItemIcon>
              <EventAvailableIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="Organizer Settings" />}
          </ListItem>

          {/* Regional Organizer Settings - Opens RegionalOrganizersModal */}
          <ListItem
            button="true"
            onClick={() => setRegionalOrganizerOpen(true)}
          >
            <ListItemIcon>
              <PlaceIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="Regional Organizer Settings" />}
          </ListItem>

          {/* System Admin Settings */}
          <ListItem button="true">
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="System Admin Settings" />}
          </ListItem>


        <Divider />
          {/* About */}
          <Link href="/about/page.js" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              {expanded && <ListItemText primary="About" />}
            </ListItem>
          </Link>

          {/* Meet the Team (Top Level) */}
          <Link href="/about" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              {expanded && <ListItemText primary="Meet the Team" />}
            </ListItem>
          </Link>

          {/* FAQ */}
          <Link href="/components/Modals/FAQModal.js" passHref>
            <ListItem button="true">
              <ListItemIcon>
                <QuestionAnswerIcon />
              </ListItemIcon>
              {expanded && <ListItemText primary="FAQ" />}
            </ListItem>
          </Link>

          {/* Help */}
          <ListItem button="true">
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="Help" />}
          </ListItem>

          {/* Message Admin */}
          <ListItem button="true">
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="Message Admin" />}
          </ListItem>

          {/* Privacy Policy Modal */}
          <ListItem button="true" onClick={() => setPrivacyPolicyOpen(true)}>
            <ListItemIcon>
              <LockIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="Privacy Poli" />}
          </ListItem>
        </List>
        <Divider />
      </Drawer>

      {/* User Settings Modal */}
      <UserSettingsModal
        open={userSettingsOpen}
        onClose={() => setUserSettingsOpen(false)}
      />

      {/* Regional Organizer Settings Modal */}
      <RegionalOrganizersModal
        open={regionalOrganizerOpen}
        onClose={() => setRegionalOrganizerOpen(false)}
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
