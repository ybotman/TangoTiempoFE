import React from 'react';
import { Modal, Box, Typography } from '@mui/material';
//import { modalStyle } from '@/app/styles'; // Import the style from the styles file


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    backgroundColor: 'lightBlue', // Dark background
    color: 'Black', // White text color
    borderRadius: '8px',
}

    ;


const EventDetailsModal = ({ event, open, onClose }) => {
    if (!event) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="event-details-title"
            aria-describedby="event-details-description"
        >
            <Box sx={modalStyle}>
                <Typography id="event-details-title" variant="h6" component="h2">
                    {event.title}
                </Typography>
                <Typography id="event-details-description" sx={{ mt: 2 }}>
                    {event.extendedProps.description || 'No description available.'}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Start: {event.start.toLocaleString()}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    End: {event.end ? event.end.toLocaleString() : 'N/A'}
                </Typography>
            </Box>
        </Modal>
    );
};

export default EventDetailsModal;