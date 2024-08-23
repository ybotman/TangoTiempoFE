import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/customDatePicker.css';
import axios from 'axios';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, // Increased width
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 6, // Increased padding
};

const EventCRUDModal = ({ open, onClose, selectedDate, selectedRegion, onCreate, onUpdate, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryFirst, setCategoryFirst] = useState('');
    const [categorySecond, setCategorySecond] = useState('');
    const [categoryThird, setCategoryThird] = useState('');
    const [startDate, setStartDate] = useState(selectedDate || new Date());
    const [endDate, setEndDate] = useState(selectedDate || new Date());
    const [cost, setCost] = useState('');
    const [recurrenceRule, setRecurrenceRule] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/categories`);
                setCategories(response.data); // Assuming response.data is an array of categories
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        if (open) {
            fetchCategories();
        }
    }, [open]);

    const handleSave = async () => {
        const eventData = {
            title,
            eventDescription: description,
            categoryFirst,
            categorySecond,
            categoryThird,
            startDate,
            endDate,
            calcuatedRegion: selectedRegion,
            cost,
            recurrenceRule,
            standardsTitle: '',
            ownerOrganizerID: '6442ccb5f88a6c48aa30be35',
            grantedOrganizerID: '6442ccb5f88a6c48aa30be35',
            alternateOrganizerID: '6442ccb5f88a6c48aa30be35',
            eventImage: 'https://example.com/image.jpg',
            locationID: '6449ee6895174c52123afd4c',
            active: true,
            featured: false,
            expiresAt: '2026-09-16T00:00:00.000+00:00',
        };

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_TangoTiempoBE_URL}/api/createEvent`, eventData);
            console.log('Event created successfully');
            if (onCreate) {
                onCreate();
            }
        } catch (error) {
            console.error('Error creating event:', error);
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
                    multiline
                    rows={4}
                />
                Starting:
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Start Date"
                    className="custom-datepicker"
                />
                Ending:
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="End Date"
                    className="custom-datepicker"

                />

                <TextField
                    fullWidth
                    select
                    label="Primary Category"
                    value={categoryFirst}
                    onChange={(e) => setCategoryFirst(e.target.value)}
                    margin="normal"
                >
                    {categories.map((category) => (
                        <MenuItem key={category._id} value={category.categoryName}>
                            {category.categoryName}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    select
                    label="Secondary Category"
                    value={categorySecond}
                    onChange={(e) => setCategorySecond(e.target.value)}
                    margin="normal"
                >
                    {categories.map((category) => (
                        <MenuItem key={category._id} value={category.categoryName}>
                            {category.categoryName}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    select
                    label="Tertiary Category"
                    value={categoryThird}
                    onChange={(e) => setCategoryThird(e.target.value)}
                    margin="normal"
                >
                    {categories.map((category) => (
                        <MenuItem key={category._id} value={category.categoryName}>
                            {category.categoryName}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    label="Cost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Recurrence Rule"
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    margin="normal"
                />

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