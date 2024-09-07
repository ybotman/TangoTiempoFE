import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',  // Adjust width for mobile
    maxWidth: '400px',  // Max width for larger screens
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,  // Adjust padding for mobile
    borderRadius: '8px',  // Rounded corners for mobile design
    '@media (max-width: 600px)': {  // Media query for smaller screens
        width: '95%',
        p: 2,  // Reduce padding for smaller screens
    },
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
                <Typography id="no-region-modal-title" variant="h6" component="h2" align="center">
                    No Region Selected
                </Typography>
                <Typography id="no-region-modal-description" sx={{ mt: 2 }} align="center">
                    Please select a region, or sign-in for your defualts.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button onClick={onClose} variant="contained" color="primary">
                        Close
                    </Button>
                    <Button onClick={onClose} variant="text" color="primary">
                        Help
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default NoRegionSelectedModal;