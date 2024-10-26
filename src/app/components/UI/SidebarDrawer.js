// src/components/UI/SidebarDrawer.js
'use client';

import React, { useState } from 'react';
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
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'; // New icon for FAQ
import FAQModal from '@/components/Modals/FAQModal';

const SidebarDrawer = () => {
  const [open, setOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false); // State for FAQ modal

  const toggleDrawer = () => setOpen((prevOpen) => !prevOpen);
  const toggleFaq = () => setFaqOpen((prevFaqOpen) => !prevFaqOpen);

  return (
    <>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 240 : 72,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: open ? 240 : 72,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          <ListItem button={true} onClick={toggleDrawer}>
            <ListItemIcon>
              <IconButton>
                <MenuIcon />
              </IconButton>
            </ListItemIcon>
            {open && <ListItemText primary="Menu" />}
          </ListItem>

          <ListItem button={true}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            {open && <ListItemText primary="About" />}
          </ListItem>

          <ListItem button={true}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Help" />}
          </ListItem>

          {/* FAQ Icon */}
          <ListItem button={true} onClick={toggleFaq}>
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            {open && <ListItemText primary="FAQ" />}
          </ListItem>
        </List>
      </Drawer>

      {/* FAQ Modal */}
      <FAQModal open={faqOpen} handleClose={toggleFaq} />
    </>
  );
};

export default SidebarDrawer;
