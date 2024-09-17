// CreateSingleEventModal.js
import React, { useState, useContext, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/customDatePicker.css';
import { useCreateEvent } from '@/hooks/useEvents';
import useCategories from '@/hooks/useCategories';
import { RegionsContext } from '@/contexts/RegionsContext';
import { useLocations } from '@/hooks/useLocations';

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

const CreateSingleEventModal = ({ open, onClose, selectedDate, onCreate }) => {
  const { selectedRegion, selectedRegionID, selectedDivision, selectedCity } = useContext(RegionsContext);
  console.log('CreateSingleEventModal Selected Region:2', selectedRegion, selectedRegionID);

    const { locations, loading, error } = useLocations(selectedRegionID, selectedDivision?._id, selectedCity?._id);
console.log("Locations:", locations);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(selectedDate || new Date());
    const [endDate, setEndDate] = useState(selectedDate || new Date());
    const [cost, setCost] = useState('');
    const [location, setLocation] = useState('');

    const handleSave = () => {
        const eventData = {
            title,
            description,
            startDate,
            endDate,
            cost,
            locationId: location,
        };
        // Handle event creation or trigger the onCreate action
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="create-event-title">
            <Box sx={modalStyle}>
                <Typography id="create-event-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Create Single Event
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

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Starting:</Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="Start Date"
                            className="custom-datepicker"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">Ending:</Typography>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="End Date"
                            className="custom-datepicker"
                        />
                    </Grid>
                </Grid>

                <TextField
                    fullWidth
                    label="Cost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    margin="normal"
                />

                {/* Locations Dropdown */}
                <TextField
                    fullWidth
                    select
                    label="Select Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    margin="normal"
                >
                    {loading ? (
                        <MenuItem value="" disabled>
                            Loading locations...
                        </MenuItem>
                    ) : error ? (
                        <MenuItem value="" disabled>
                            Error fetching locations
                        </MenuItem>
                    ) : (
                        locations.map((loc) => (
                            <MenuItem key={loc._id} value={loc._id}>
                                {loc.name}
                            </MenuItem>
                        ))
                    )}
                </TextField>

                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreateSingleEventModal;