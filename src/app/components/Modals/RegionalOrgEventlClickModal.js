import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const RegionalOrgEventClickModal = ({ isOpen, onClose, onEdit, onDelete }) => {
    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={{ ...modalStyle }}>
                <Typography variant="h6">Event Actions</Typography>

                <Button onClick={onEdit} sx={{ mt: 2 }}>
                    Edit
                </Button>
                <Button onClick={onDelete} sx={{ mt: 2 }}>
                    Delete
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

export default RegionalOrgEventClickModal;