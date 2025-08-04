// ROTermsModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Divider,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  overflowY: 'auto',
  borderRadius: 2,
};

const ROE_SECTIONS = [
  {
    id: 'responsibilities',
    title: 'Organizer Responsibilities',
    content: `As a Regional Organizer, you agree to:
    
• Create and manage authentic Argentine Tango events in your assigned region
• Maintain accurate and up-to-date event information including dates, times, locations, and descriptions
• Upload appropriate event images that represent the tango community professionally
• Respond to community inquiries about your events in a timely manner
• Collaborate with other organizers to avoid scheduling conflicts when possible
• Represent the tango community with professionalism and respect`
  },
  {
    id: 'event-standards',
    title: 'Event Quality Standards',
    content: `IMPORTANT: Only strictly Argentine Tango events are permitted.
    
• Events MUST be exclusively Argentine Tango (milongas, practicas, classes, workshops)
• NO fusion events (tango-swing, tango-salsa, etc.)
• NO non-tango dance events
• Events must feature traditional Argentine Tango music or live tango orchestras
• Alternative/neo-tango events are acceptable if clearly labeled
• Events must be kept reasonably up-to-date or may be reverted to AI-Discovered status`
  },
  {
    id: 'ai-protection',
    title: 'AI Monitoring & Protection',
    content: `Your events will be monitored by our AI system for quality and compliance:
    
• AI scans all events for Argentine Tango authenticity
• Events detected as non-tango will be flagged for review
• Repeatedly posting non-tango events may result in organizer privileges suspension
• Outdated events (not updated for 30+ days past event date) may be auto-archived
• AI-discovered duplicates of your events will be merged under your organizer profile
• You retain full control over events you create, but must maintain them actively`
  },
  {
    id: 'permissions',
    title: 'Permissions & Access',
    content: `Your Regional Organizer role includes all Named User (NU) permissions plus:
    
• CREATE events in your assigned cities/regions
• EDIT all details of events you create
• UPLOAD images for your events
• DELETE events you've created (with 30-day soft delete)
• VIEW analytics for your events
• MANAGE your organizer profile and contact information
• REQUEST additional cities/regions through Regional Admins`
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: `By accepting these terms, you acknowledge:
    
• TangoTiempo reserves the right to modify or revoke organizer privileges
• Violations of the Argentine Tango-only policy may result in immediate suspension
• You are responsible for the accuracy of all information you post
• You grant TangoTiempo license to display your event information
• You will not use the platform for spam, harassment, or illegal activities
• Your organizer account is non-transferable
• These terms may be updated with notice to active organizers`
  }
];

const ROTermsModal = ({ open, onClose, onAgree }) => {
  const [expandedSections, setExpandedSections] = useState([]);
  const [acceptChecked, setAcceptChecked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setExpandedSections([]);
      setAcceptChecked(false);
      setScrollProgress(0);
    }
  }, [open]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    if (isExpanded && !expandedSections.includes(panel)) {
      setExpandedSections([...expandedSections, panel]);
    }
  };

  const allSectionsRead = expandedSections.length === ROE_SECTIONS.length;
  const canProceed = allSectionsRead && acceptChecked;

  // Calculate progress
  useEffect(() => {
    const progress = (expandedSections.length / ROE_SECTIONS.length) * 100;
    setScrollProgress(progress);
  }, [expandedSections]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Regional Organizer Rules of Engagement
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Please read all sections carefully. You must expand and read each section before proceeding.
        </Typography>

        <LinearProgress 
          variant="determinate" 
          value={scrollProgress} 
          sx={{ mb: 2, height: 8, borderRadius: 4 }}
        />

        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Important:</strong> Only strictly Argentine Tango events are permitted. 
          Events must be kept reasonably up-to-date or may be reverted to AI-Discovered status.
        </Alert>

        <Box sx={{ mb: 3 }}>
          {ROE_SECTIONS.map((section) => (
            <Accordion 
              key={section.id}
              expanded={expandedSections.includes(section.id)}
              onChange={handleAccordionChange(section.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: expandedSections.includes(section.id) 
                    ? 'action.selected' 
                    : 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1 }}>{section.title}</Typography>
                  {expandedSections.includes(section.id) && (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                >
                  {section.content}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Checkbox 
              checked={acceptChecked}
              onChange={(e) => setAcceptChecked(e.target.checked)}
              disabled={!allSectionsRead}
            />
          }
          label={
            <Typography variant="body2">
              I have read, understood, and agree to abide by the Regional Organizer Rules of Engagement, 
              including the requirement that only strictly Argentine Tango events are permitted.
            </Typography>
          }
        />

        <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => onAgree(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onAgree(true)}
            disabled={!canProceed}
          >
            Accept and Continue
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

ROTermsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAgree: PropTypes.func.isRequired,
};

export default ROTermsModal;
