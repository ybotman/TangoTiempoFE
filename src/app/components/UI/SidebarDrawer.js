// SidebarDrawer.js
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';
import RegionMenu from './RegionMenu';

const SidebarDrawer = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const toggleExpansion = () => setExpanded((prev) => !prev);
  const toggleAboutMenu = () => setAboutOpen((prev) => !prev);

  return (
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
        <ListItem button onClick={toggleExpansion}>
          <ListItemIcon>
            <IconButton>
              <MenuIcon />
            </IconButton>
          </ListItemIcon>
          {expanded && <ListItemText primary="Menu" />}
        </ListItem>

        {/* Regions Section */}
        <ListItem
          button
          onClick={() => {
            if (!expanded) toggleExpansion();
            setRegionMenuOpen(true);
          }}
        >
          <ListItemIcon>
            <Avatar
              alt="Select Region"
              src="/images/Regions/RegionsIcon.png"
              sx={{ width: 32, height: 32 }}
            />
          </ListItemIcon>
          {expanded && <ListItemText primary="Regions" />}
        </ListItem>

        {/* Region Menu */}
        <Collapse in={regionMenuOpen} timeout="auto" unmountOnExit>
          <RegionMenu
            expanded={expanded}
            onClose={() => setRegionMenuOpen(false)}
          />
        </Collapse>

        {/* About Section */}
        <ListItem button onClick={toggleAboutMenu}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="About" />}
          {expanded && (aboutOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        {/* Meet the Team Top Level */}
        <Collapse in={aboutOpen} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{ paddingLeft: expanded ? 4 : 0 }}
          >
            <Link href="/about" passHref>
              <ListItem button component="a">
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                {expanded && <ListItemText primary="Meet the Team" />}
              </ListItem>
            </Link>

            {/* About Toby Submenu */}
            <Link href="/about-toby/page.js" passHref>
              <ListItem button component="a" sx={{ paddingLeft: 4 }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                {expanded && <ListItemText primary="About Toby" />}
              </ListItem>
            </Link>
          </List>
        </Collapse>

        {/* FAQ */}
        <Link href="/components/Modals/FAQModal.js" passHref>
          <ListItem button component="a">
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary="FAQ" />}
          </ListItem>
        </Link>

        {/* Help */}
        <ListItem button>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="Help" />}
        </ListItem>

        {/* User Settings (Fake) */}
        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="User Settings" />}
        </ListItem>

        {/* Organizer Settings (Fake) */}
        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="Organizer Settings" />}
        </ListItem>

        {/* Message Admin (Fake) */}
        <ListItem button>
          <ListItemIcon>
            <MessageIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="Message Admin" />}
        </ListItem>
      </List>
    </Drawer>
  );
};

SidebarDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarDrawer;
