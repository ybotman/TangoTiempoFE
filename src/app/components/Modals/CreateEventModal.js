import React, { useState, useContext } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Grid,
    Tabs,
    Tab,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/customDatePicker.css';
import { RegionsContext } from '@/contexts/RegionsContext';
import { useLocations } from '@/hooks/useLocations';
import { useDropzone } from 'react-dropzone'; // Import dropzone for image upload
import { uploadToBlob } from '@/utils/uploadEventImages'; // Your utility for uploading to Azure Blob

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

const CreateEventModal = ({ open, onClose, selectedDate, onCreate }) => {
    const { selectedRegionID, selectedDivision, selectedCity } = useContext(RegionsContext);
    const { locations, loading, error } = useLocations(selectedRegionID, selectedDivision?._id, selectedCity?._id);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(selectedDate || new Date());
    const [endDate, setEndDate] = useState(selectedDate || new Date());
    const [cost, setCost] = useState('');
    const [location, setLocation] = useState('');
    const [categoryFirst, setCategoryFirst] = useState('');
    const [categorySecond, setCategorySecond] = useState('');
    const [categoryThird, setCategoryThird] = useState('');
    const [grantedOrganizer, setGrantedOrganizer] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [currentTab, setCurrentTab] = useState('basic');

    const handleSave = () => {
        const eventData = {
            title,
            description,
            startDate,
            endDate,
            cost,
            locationId: location,
            categoryFirst,
            categorySecond,
            categoryThird,
            grantedOrganizer,
            imageFile, // Include the image file in the event data
        };
        // Handle event creation or trigger the onCreate action
        console.log('Event data to save:', eventData);
        // Example API call to save the event
        // await saveEvent(eventData);
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0]; // Assuming only one image for the event
        try {
            const blobUrl = await uploadToBlob(file); // Upload to Azure Blob
            console.log('File uploaded successfully:', blobUrl);
            setImageFile(file); // Save the selected file
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    // Set up the dropzone hook at the top level of the component
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="create-event-title">
            <Box sx={modalStyle}>
                <Typography id="create-event-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Create Single Event
                </Typography>

                {/* Tab Navigation */}
                <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
                    <Tab label="Basic" value="basic" />
                    <Tab label="Image" value="image" />
                    <Tab label="Repeat" value="repeat" />
                    <Tab label="Promotion" value="promotion" />
                </Tabs>

                {/* Conditional Rendering Based on Tab */}
                {currentTab === 'basic' && (
                    <Box>
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
                        <TextField
                            fullWidth
                            select
                            label="Primary Category"
                            value={categoryFirst}
                            onChange={(e) => setCategoryFirst(e.target.value)}
                            margin="normal"
                        >
                            {/* Replace with actual category data */}
                            <MenuItem value="category1">Category 1</MenuItem>
                            <MenuItem value="category2">Category 2</MenuItem>
                        </TextField>
                    </Box>
                )}

                {currentTab === 'image' && (
                    <Box>
                        <Typography variant="h6">Upload Event Image</Typography>
                        <div {...getRootProps({ className: 'dropzone' })} style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop an image here, or click to select one</p>
                        </div>
                        {imageFile && <Typography>Selected Image: {imageFile.name}</Typography>}
                    </Box>
                )}

                {currentTab === 'repeat' && (
                    <Box>
                        <Typography variant="h6">Set Event Repetition</Typography>
                        <TextField
                            fullWidth
                            select
                            label="Repeat Frequency"
                            margin="normal"
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                        </TextField>
                        {/* Additional settings for repeat can be added here */}
                    </Box>
          )}
                          {currentTab === 'promotion' && (
                    <Box>
                        <Typography variant="h6">Promotion Settings</Typography>
                        <TextField
                            fullWidth
                            label="Granted Organizer"
                            value={grantedOrganizer}
                            onChange={(e) => setGrantedOrganizer(e.target.value)}
                            margin="normal"
                        />
                        <Box mt={2}>
                            <Button variant="contained" color="primary">
                                Post to Facebook
                            </Button>
                            <Button variant="contained" color="primary" style={{ marginLeft: '10px' }}>
                                Post to Twitter
                            </Button>
                            <Button variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                                Promote
                            </Button>
                        </Box>
                        <TextField
                            fullWidth
                            select
                            label="Secondary Category"
                            value={categorySecond}
                            onChange={(e) => setCategorySecond(e.target.value)}
                            margin="normal"
                        >
                            {/* Replace with actual category data */}
                            <MenuItem value="category1">Category 1</MenuItem>
                            <MenuItem value="category2">Category 2</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            select
                            label="Third Category"
                            value={categoryThird}
                            onChange={(e) => setCategoryThird(e.target.value)}
                            margin="normal"
                        >
                            {/* Replace with actual category data */}
                            <MenuItem value="category1">Category 1</MenuItem>
                            <MenuItem value="category2">Category 2</MenuItem>
                        </TextField>
                    </Box>
                )}

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

export default CreateEventModal;
