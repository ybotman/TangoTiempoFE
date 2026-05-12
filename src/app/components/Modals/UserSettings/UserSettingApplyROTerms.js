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
// TIEMPO-454: ROE content lifted to a shared module so the new
// /organizers/welcome page can render the same guidelines.
import { ROE_SECTIONS } from '@/data/organizerGuidelines';

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
