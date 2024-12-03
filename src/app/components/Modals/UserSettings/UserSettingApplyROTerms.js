// ROTermsModal.js
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
};

const ROTermsModal = ({ open, onClose, onAgree }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Regional Organizer Terms
        </Typography>
        <Typography variant="body2" gutterBottom>
          Please read and accept the terms of use to proceed.
        </Typography>
        {/* Include actual terms content here */}
        <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAgree(true)}
          >
            I Agree
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onAgree(false)}
          >
            I Do Not Agree
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
