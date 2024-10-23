import React, { useContext } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { RegionsContext } from '@/contexts/RegionsContext';
import PropTypes from 'prop-types';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CreateEventDetailsBasic = ({ open, onClose, selectedDate }) => {
  const { selectedRegion } = useContext(RegionsContext); // Get the selected region from context

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" component="h2">
          {`Event in: ${selectedRegion || 'Unknown Region'}`}
        </Typography>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Close
        </Button>
      </Box>
    </Modal>
  );
};

CreateEventDetailsBasic.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default CreateEventDetailsBasic;
