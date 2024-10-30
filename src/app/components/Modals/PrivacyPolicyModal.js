// src/components/Modals/PrivacyPolicyModal.js
'use client';

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
  maxHeight: '80vh', // Restrict height for scrolling
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  overflowY: 'auto', // Enable scrolling for overflow content
};

const PrivacyPolicyModal = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2" gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Our Commitment to Your Privacy</strong>
          <br />
          We respect your privacy and are fully committed to protecting your
          personal information. This policy explains what data we collect, how
          we use it, and your control over it. We never sell, give away, or
          misuse your data. Period.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Information We Collect</strong>
          <br />
          1. <strong>User-Provided Information:</strong> When you register or
          interact with our services, you may provide personal details like your
          name, email address, and other preferences.
          <br />
          2. <strong>Automatic Information:</strong> We may collect data on how
          you use our service, such as device information, location, and usage
          patterns, but only to improve your experience.
          <br />
          3. <strong>Cookies:</strong> We may use cookies to remember your
          preferences and settings. You can manage or disable cookies through
          your browser.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>How We Use Your Information</strong>
          <br />
          1. <strong>To Provide and Improve Services:</strong> We use the data
          to personalize your experience and make our platform better suited to
          your needs.
          <br />
          2. <strong>To Communicate:</strong> We may send you important
          service-related notifications but will always respect your
          preferences.
          <br />
          3. <strong>No Third-Party Sharing:</strong> Your data is{' '}
          <strong>never</strong> sold, rented, or shared with third parties for
          marketing or other purposes.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Control Over Your Information</strong>
          <br />
          We are dedicated to putting you in control of your data. You decide:
          <br />- <strong>Who Can Contact You:</strong> You have full control
          over your messaging preferences and who can message you.
          <br />- <strong>What Data You Share:</strong> You can update or delete
          your personal data at any time.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Data Protection and Security</strong>
          <br />
          1. <strong>Encryption:</strong> All sensitive data, including
          passwords, are encrypted. We use secure methods to protect your
          information from unauthorized access.
          <br />
          2. <strong>Password Security:</strong> Your password is encrypted, and
          we do not have access to it. If forgotten, you will need to reset it
          as we cannot retrieve it for you.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Data Retention</strong>
          <br />
          We retain your data only as long as necessary to provide services or
          as required by law. You may request deletion of your data at any time.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Your Rights</strong>
          <br />
          1. <strong>Access and Update:</strong> You can access and update your
          personal information at any time.
          <br />
          2. <strong>Data Deletion:</strong> You may request that we delete your
          information from our system.
          <br />
          3. <strong>Opt-Out:</strong> You can opt-out of receiving
          non-essential communications at any time.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Policy Changes</strong>
          <br />
          We may update this policy periodically. Any changes will be
          communicated through the app and our website.
        </Typography>

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

PrivacyPolicyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PrivacyPolicyModal;
