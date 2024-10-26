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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const SidebarDrawer = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState(false); // Controls icon-only to icon + text view

  const toggleExpansion = () => setExpanded((prev) => !prev);

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

        {/* Other Sidebar Items */}
        <ListItem button>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          {expanded && <ListItemText primary="About" />}
        </ListItem>

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
