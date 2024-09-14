import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/customDatePicker.css';
import { useCreateEvent } from '@/hooks/useEvents';
import useCategories from '@/hooks/useCategories';
import PropTypes from 'prop-types';
import { validateEvent } from '@/utils/EventCreateRules'; // Import validation function


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    maxHeight: '90vh',
    overflowY: 'auto',
};

const EventCRUDModal = ({ open, onClose, selectedDate, selectedRegion, onCreate }) => {
    const createEvent = useCreateEvent(); // Use the createEvent function
    const categories = useCategories(); // Use the useCategories hook
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryFirst, setCategoryFirst] = useState('');
    const [categorySecond, setCategorySecond] = useState('');
    const [categoryThird, setCategoryThird] = useState('');
    const [startDate, setStartDate] = useState(selectedDate || new Date());
    const [endDate, setEndDate] = useState(selectedDate || new Date());
    const [cost, setCost] = useState('');
    const [recurrenceRule, setRecurrenceRule] = useState('');


    const handleSave = async () => {
        console.log('* * * * I AM DEFAULTING REGIONS AND LOCTIONS!  FIX FIX FIX via handleSave');
        const eventData = {
            title,
            description,
            categoryFirst,
            categorySecond,
            categoryThird,
            startDate,
            endDate,
            calculatedRegionName: 'Northeast', // Added calculatedRegionName
            calculatedDivisionName: 'New England', // Added calculatedDivisionName
            calculatedCityName: 'Boston', // Added calculatedCityName
            locationID: '66c8bc4c6b597390419b9187', // Added locationID
            locationName: 'Fake Tango Venue', // Added locationName
            cost,
            recurrenceRule,
            standardsTitle: '',
            ownerOrganizerID: '6442ccb5f88a6c48aa30be35',
            grantedOrganizerID: '6442ccb5f88a6c48aa30be35',
            alternateOrganizerID: '6442ccb5f88a6c48aa30be35',
            ownerOrganizerName: 'Your Organizer Name',
            regionID: '6442ccb5f88a6c48aa30be35',
            regionName: 'Northeast',
            eventImage: 'https://example.com/image.jpg',
            active: true,
            featured: false,
            expiresAt: '2026-09-16T00:00:00.000+00:00',
        };

        try {
            await createEvent(eventData); // Use the createEvent function
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

                <Typography variant="body2">Starting:</Typography>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Start Date"
                    className="custom-datepicker"
                />

                <Typography variant="body2">Ending:</Typography>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="End Date"
                    className="custom-datepicker"
                />

                <Grid container spacing={2}>
                    <Grid item xs={4}>
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
                    </Grid>
                    <Grid item xs={4}>
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
                    </Grid>
                    <Grid item xs={4}>
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
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Cost"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            margin="normal"
                            inputProps={{ maxLength: 10 }}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <TextField
                            fullWidth
                            label="Recurrence Rule"
                            value={recurrenceRule}
                            onChange={(e) => setRecurrenceRule(e.target.value)}
                            margin="normal"
                        />
                    </Grid>
                </Grid>

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