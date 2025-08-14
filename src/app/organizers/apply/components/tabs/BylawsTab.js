'use client';

import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SecurityIcon from '@mui/icons-material/Security';

const roles = [
  {
    id: 'anonymous',
    title: 'Anonymous User (Non-Logged In)',
    icon: <PersonOffIcon />,
    color: 'grey',
    permissions: [
      'Can view events on the calendar',
      'Cannot message, comment, favorite, or upload content'
    ]
  },
  {
    id: 'nu',
    title: 'NU — Named User (e.g., Milonger@)',
    icon: <PersonIcon />,
    color: 'info',
    permissions: [
      'Messaging: Can message organizers and admins',
      'Photos: Can upload photos to approved events',
      'Commenting: Can comment on events or organizers where allowed',
      'Voting/Rating: May rate events or organizers (future feature)'
    ]
  },
  {
    id: 'ro',
    title: 'RO — Regional Organizer',
    icon: <EventIcon />,
    color: 'success',
    permissions: [
      'Includes all NU permissions plus:',
      'Can create and manage Argentine Tango events in their region',
      'Can update event details, images, and locations',
      'Must only include events that are strictly Argentine Tango (no fusion, swing, etc.)',
      'Must maintain reasonably up-to-date listings. Otherwise, system may revert listings to AI-Discovered status'
    ]
  },
  {
    id: 'ra',
    title: 'RA — Regional Admin',
    icon: <SupervisorAccountIcon />,
    color: 'warning',
    permissions: [
      'A well-versed tango enthusiast with broad community knowledge',
      'Must be reasonably accessible via local social media or contact channels',
      'Must remain unbiased — no preference to any RO',
      'Cannot approve or deny event inclusion',
      'Cannot remove or hide conflicting events',
      'Must actively ensure all ROs who meet criteria are supported in joining the TT ecosystem',
      'Must respond in a timely manner to RO messages',
      'Must assist in tagging/flagging events as AI-Discovered vs RO-Owned'
    ]
  },
  {
    id: 'admin',
    title: 'System Admins',
    icon: <AdminPanelSettingsIcon />,
    color: 'error',
    permissions: [
      'Maintain system health and integrity',
      'Oversee escalation procedures between ROs and RAs',
      'Manage disputes or anomalies between AI-Discovered vs human-entered events',
      'Final authority on event integrity'
    ]
  },
  {
    id: 'owner',
    title: 'System Owner',
    icon: <SecurityIcon />,
    color: 'secondary',
    permissions: [
      'Responsible for the full Tango Tiempo platform vision, direction, and evolution',
      'Manages core access, funding, infrastructure, and administrative control',
      'Delegates authority to system admins and defines policy changes'
    ]
  }
];

const BylawsTab = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h3" gutterBottom sx={{ mb: 3 }}>
        Tango Tiempo Bylaws
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          These bylaws define the roles and responsibilities for all TangoTiempo users. 
          By participating in our platform, you agree to abide by these guidelines.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">Roles and Responsibilities</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
      </Paper>

      {roles.map((role, index) => (
        <Accordion
          key={role.id}
          expanded={expanded === role.id}
          onChange={handleChange(role.id)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${role.id}-content`}
            id={`${role.id}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box sx={{ color: `${role.color}.main` }}>
                {role.icon}
              </Box>
              <Typography sx={{ fontWeight: 'medium', flexGrow: 1 }}>
                {role.title}
              </Typography>
              <Chip 
                label={role.id.toUpperCase()} 
                color={role.color}
                size="small"
                sx={{ mr: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {role.permissions.map((permission, permIndex) => (
                <ListItem key={permIndex} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={permission}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        fontWeight: permission.includes('plus:') || permission.includes('Must') 
                          ? 'bold' 
                          : 'normal'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Special notices for certain roles */}
            {role.id === 'ro' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  <strong>Important:</strong> Only strictly Argentine Tango events are permitted. 
                  Events must be kept reasonably up-to-date or may be reverted to AI-Discovered status.
                </Typography>
              </Alert>
            )}
            
            {role.id === 'ra' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  <strong>Note:</strong> Regional Admins must remain impartial and cannot show 
                  preference to any Regional Organizer. Your role is to support ALL eligible ROs equally.
                </Typography>
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Paper elevation={0} sx={{ p: 3, mt: 4, backgroundColor: 'warning.light' }}>
        <Typography variant="h6" gutterBottom>
          Living Document
        </Typography>
        <Typography variant="body2">
          This document is a living agreement. Edits and additions must be submitted by any RA 
          or System Admin and reviewed quarterly by the System Owner.
        </Typography>
      </Paper>

      <Box sx={{ mt: 3, p: 3, backgroundColor: 'success.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Questions About the Bylaws?
        </Typography>
        <Typography variant="body2">
          If you have questions about these bylaws or need clarification on any role or 
          responsibility, please contact your Regional Administrator or use the Message Admin feature.
        </Typography>
      </Box>
    </Box>
  );
};

export default BylawsTab;