// src/components/EventModal.js
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const EventDetailsModal = ({ open, onClose, event }) => {
    if (!event) return null;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ ...modalStyles }}>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2">{event.eventDescription}</Typography>
                <Typography variant="body2">
                    Start: {new Date(event.startDate).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                    End: {new Date(event.endDate).toLocaleString()}
                </Typography>
                <Button onClick={onClose}>Close</Button>
            </Box>
        </Modal>
    );
};

const modalStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default EventDetailsModal;