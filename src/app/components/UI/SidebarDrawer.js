// src/components/UI/SidebarDrawer.js
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Link from 'next/link';

const SidebarDrawer = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState(false); // Controls icon-only to icon + text view
  const [aboutOpen, setAboutOpen] = useState(false); // Controls "About" submenu

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
        {/* Inner Hamburger to expand the sidebar */}
        <ListItem button onClick={toggleExpansion}>
          <ListItemIcon>
            <IconButton>
              <MenuIcon />
            </IconButton>
          </ListItemIcon>
          {expanded && <ListItemText primary="Menu" />}
        </ListItem>

        {/* About Section with Nested Menu */}
        <ListItem button onClick={toggleAboutMenu}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="About" />}
          {expanded && (aboutOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        {/* Submenu for "Meet the Team" */}
        <Collapse in={aboutOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ paddingLeft: 4 }}>
            <Link href="/about" passHref legacyBehavior>
              <ListItem button component="a">
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                {expanded && <ListItemText primary="Meet the Team" />}
              </ListItem>
            </Link>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {/* Nested links under "Meet the Team" */}
              <List component="div" disablePadding sx={{ paddingLeft: 4 }}>
                <Link href="/about-toby" passHref legacyBehavior>
                  <ListItem button component="a">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    {expanded && <ListItemText primary="About Toby" />}
                  </ListItem>
                </Link>
                <Link href="/about-tural" passHref legacyBehavior>
                  <ListItem button component="a">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    {expanded && <ListItemText primary="About Tural" />}
                  </ListItem>
                </Link>
                <Link href="/about-wailing" passHref legacyBehavior>
                  <ListItem button component="a">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    {expanded && <ListItemText primary="About Wailing" />}
                  </ListItem>
                </Link>
              </List>
            </Collapse>
          </List>
        </Collapse>

        {/* Other Sidebar Items */}
        <ListItem button>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="Help" />}
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <QuestionAnswerIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="FAQ" />}
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