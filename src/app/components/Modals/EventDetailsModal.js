import React from 'react';
import { Modal, Box, Typography, Button, Grid, CardMedia } from '@mui/material';
import { Close } from '@mui/icons-material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'white',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    color: 'black'
};

const titleStyle = {
    color: 'blue',
    fontWeight: 'bold',
};

const textStyle = {
    color: 'grey',
};

const EventDetailsModal = ({ event, open, onClose }) => {
    if (!event) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="event-details-modal-title"
            aria-describedby="event-details-modal-description"
        >
            <Box sx={modalStyle}>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography id="event-details-modal-title" variant="h5" component="h2" sx={titleStyle}>
                        {event.title}
                    </Typography>
                    <Button onClick={onClose} startIcon={<Close />} />
                </Grid>
                {event.extendedProps.eventImage && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={event.extendedProps.eventImage}
                        alt={event.title}
                        sx={{ borderRadius: '8px', mb: 2 }}
                    />
                )}
                <Typography id="event-details-modal-description" sx={textStyle}>
                    <strong style={{ color: 'black' }}>Description:</strong> {event.extendedProps.description}<br />
                    <strong style={{ color: 'black' }}>Location:</strong> {event.extendedProps.location}<br />
                    <strong style={{ color: 'black' }}>Cost:</strong> {event.extendedProps.cost}<br />
                    <strong style={{ color: 'black' }}>Region:</strong> {event.extendedProps.region}<br />
                    <strong style={{ color: 'black' }}>Recurrence:</strong> {event.extendedProps.recurrence}<br />
                    <strong style={{ color: 'black' }}>Categories:</strong> {`${event.extendedProps.categoryFirst || ''}, ${event.extendedProps.categorySecond || ''}, ${event.extendedProps.categoryThird || ''}`.replace(/, ,/g, '')}
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button variant="contained" color="primary" onClick={onClose}>
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EventDetailsModal;