import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const RegionalOrgDateClickModal = ({ isOpen, onClose, onCreate }) => {
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
    });

    const handleChange = (e) => {
        setNewEvent({
            ...newEvent,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreate = () => {
        onCreate(newEvent);
        onClose();
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={{ ...modalStyle }}>
                <Typography variant="h6">Create New Event</Typography>

                <TextField
                    label="Title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />

                <Button onClick={handleCreate} sx={{ mt: 2 }}>
                    Create Event
                </Button>
                <Button onClick={onClose} sx={{ mt: 2 }}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default RegionalOrgDateClickModal;