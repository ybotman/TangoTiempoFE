import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const NoRegionSelectedModal = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="no-region-modal-title"
            aria-describedby="no-region-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="no-region-modal-title" variant="h6" component="h2">
                    No Region Selected
                </Typography>
                <Typography id="no-region-modal-description" sx={{ mt: 2 }}>
                    Select a region first, or
                    sign-up/in to have you defaults
                </Typography>
                <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
                    Close
                </Button>
                <Button variant="text" sx={{ mt: 2 }}>
                    Help
                </Button>
                <Button variant="text" sx={{ mt: 2 }}>
                    SignUp
                </Button>
            </Box>
        </Modal >
    );
};

export default NoRegionSelectedModal;