// components/Modals/misc/FAQModal.js

import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ModalHeader from '../../UI/ModalHeader';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
};

const FAQModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="help-modal-title"
      aria-describedby="help-modal-description"
    >
      <Box sx={modalStyle}>
        <ModalHeader 
          title="Help & Information" 
          onClose={onClose}
        />
        <Box sx={{ p: 3, overflow: 'auto' }}>
          <Typography>
            <strong>How can I become a Regional Organizer to Add my events?</strong>
          </Typography>
          <Typography>Contact your Regional Admin to request access.</Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>How can I become a Regional Admin?</strong>
          </Typography>
          <Typography>Regional Admins are appointed by System Admins. Contact your organization.</Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>How can I sign up?</strong>
          </Typography>
          <Typography>Go to the Login/Signup section to create an account.</Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Do we sell your information?</strong>
          </Typography>
          <Typography>No, we do not sell or share your information with third parties.</Typography>
        </Box>
      </Box>
    </Modal>
  );
};

FAQModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired, // Updated here
};

export default FAQModal;
