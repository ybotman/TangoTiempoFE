//FE/src/app/components/Modals/EventDetailsModal.js

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
    const [isImageValid, setIsImageValid] = useState(true);

    useEffect(() => {
        if (event?.extendedProps?.eventImage) {
            const img = new Image();
            img.src = event.extendedProps.eventImage;
            img.onload = () => setIsImageValid(true);
            img.onerror = () => setIsImageValid(false);
        } else {
            setIsImageValid(false);
        }
    }, [event]);

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
                {isImageValid ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={event.extendedProps.eventImage}
                        alt={event.title}
                        sx={{ borderRadius: '8px', mb: 2 }}
                    />
                ) : (
                    <Typography variant="subtitle1" color="error" sx={{ mb: 2 }}>
                        Image Broken
                    </Typography>
                )}
                <Typography id="event-details-modal-description" sx={textStyle}>
                    <strong style={{ color: 'black' }}>Description:</strong> {event.extendedProps.description}<br />
                    <strong style={{ color: 'black' }}>Location:</strong> {event.extendedProps.locationName}<br />
                    <strong style={{ color: 'black' }}>Cost:</strong> {event.extendedProps.cost}<br />
                    <strong style={{ color: 'black' }}>Region:</strong> {event.extendedProps.calculatedRegionName}<br />
                    <strong style={{ color: 'black' }}>Division:</strong> {event.extendedProps.calculatedDivisionName}<br />
                    <strong style={{ color: 'black' }}>City:</strong> {event.extendedProps.calculatedCityName}<br />
                    <strong style={{ color: 'black' }}>Recurrence:</strong> {event.extendedProps.recurrenceRule}<br />
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

EventDetailsModal.propTypes = {
    event: PropTypes.shape({
        title: PropTypes.string.isRequired,
        extendedProps: PropTypes.shape({
            eventImage: PropTypes.string,
            description: PropTypes.string,
            locationName: PropTypes.string,
            cost: PropTypes.string,
            calculatedRegionName: PropTypes.string,
            calculatedDivisionName: PropTypes.string,
            calculatedCityName: PropTypes.string,
            recurrenceRule: PropTypes.string,
            categoryFirst: PropTypes.string,
            categorySecond: PropTypes.string,
            categoryThird: PropTypes.string,
        }).isRequired,
    }).isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default EventDetailsModal;