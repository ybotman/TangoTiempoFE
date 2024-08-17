import React from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
//import { EventCreateRules } from '@/utils/EventCreateRules';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const EventCRUDModal = ({ open, onClose, selectedDate, selectedRegion, onCreate, onUpdate, onDelete }) => {
    console.log('EventCRUDModal:selectedDate', selectedDate);
    console.log('EventCRUDModal:selectedRegion', selectedRegion);

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [categoryFirst, setCategoryFirst] = React.useState('');
    const [categorySecond, setCategorySecond] = React.useState('');
    const [categoryThird, setCategoryThird] = React.useState('');
    const [startDate, setStartDate] = React.useState(selectedDate || new Date());
    const [endDate, setEndDate] = React.useState(selectedDate || new Date());
    // const [region, setRegion] = React.useState(selectedRegion || '');

    const handleSave = async () => {
        const eventData = {
            title,
            eventDescription: description,
            categoryFirst,
            categorySecond,
            categoryThird,
            startDate,
            endDate,
            region: selectedRegion,
            standardsTitle: '',
            ownerOrganizerID: '6442ccb5f88a6c48aa30be35',
            eventOrganizerID: '6442ccb5f88a6c48aa30be35',
            altOrganizerID: '6442ccb5f88a6c48aa30be35',
            eventImage: 'https://example.com/image.jpg',
            locationID: '6449ee6895174c52123afd4c',
            recurrenceRule: '',
            active: true,
            featured: false,
            cost: '123',
            expiresAt: '2026-09-16T00:00:00.000+00:00',
        };

        //        if (EventCreateRules(eventData)) {
        if (true) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_TANGO_API_URL}/api/createEvent`, eventData);
                console.log('Event created successfully');
                if (onCreate) {
                    onCreate(); // Trigger the onCreate callback
                }
            } catch (error) {
                console.error('Error creating event:', error);
            }
        }

        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalStyle}>
                {/* Region Display */}
                <Typography variant="caption" color="textSecondary" sx={{ color: 'blue', mt: 2 }}>
                    Region: {selectedRegion}
                </Typography>

                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: 'blue' }}>
                    Create Event
                </Typography>
                <TextField
                    fullWidth
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Start Date"
                    className="form-control"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="End Date"
                    className="form-control"
                />
                <TextField
                    fullWidth
                    select
                    label="Primary Category"
                    value={categoryFirst}
                    onChange={(e) => setCategoryFirst(e.target.value)}
                    margin="normal"
                >
                    <MenuItem value="Milonga">Milonga</MenuItem>
                    <MenuItem value="Workshop">Workshop</MenuItem>
                    <MenuItem value="Performance">Performance</MenuItem>
                </TextField>


                <Button onClick={handleSave} variant="contained" color="primary" sx={{ mt: 2 }}>
                    Save
                </Button>
                <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mt: 2, ml: 2 }}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default EventCRUDModal;