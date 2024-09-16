// components/Modals/FAQModal.js

import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '400px',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const FAQModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="help-modal-title"
      aria-describedby="help-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="help-modal-title" variant="h6" component="h2">
          Help & Information
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography>
            <strong>How can I become a Regional Organizer?</strong>
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
        <Button onClick={handleClose} variant="contained" sx={{ mt: 3 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

FAQModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FAQModal;