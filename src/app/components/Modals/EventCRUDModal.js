import React, { useState } from 'react';
import { Modal, Button, TextField, Select, MenuItem } from '@mui/material';

const EventCRUDModal = ({ event = null, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(event ? event.title : '');
    const [description, setDescription] = useState(event ? event.description : '');
    const [categoryFirst, setCategoryFirst] = useState(event ? event.categoryFirst : '');
    const [categorySecond, setCategorySecond] = useState(event ? event.categorySecond : '');
    const [categoryThird, setCategoryThird] = useState(event ? event.categoryThird : '');
    const [startDate, setStartDate] = useState(event ? event.startDate : '');
    const [endDate, setEndDate] = useState(event ? event.endDate : '');

    const handleSave = () => {
        if (!categoryFirst) {
            alert('Category First is required.');
            return;
        }

        const newEvent = {
            title,
            description,
            categoryFirst,
            categorySecond,
            categoryThird,
            startDate,
            endDate,
            // Add other fields as needed
        };

        onSave(newEvent);
    };

    return (
        <Modal open={true} onClose={onClose}>
            <div className="modal-content">
                <h2>{event ? 'Update Event' : 'Create Event'}</h2>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                />
                <Select
                    label="Category First"
                    value={categoryFirst}
                    onChange={(e) => setCategoryFirst(e.target.value)}
                    fullWidth
                    required
                >
                    {/* Render category options */}
                </Select>
                {/* Additional fields for categorySecond, categoryThird, dates, etc. */}

                <Button onClick={handleSave}>
                    {event ? 'Save' : 'Create'}
                </Button>
                {event && (
                    <Button onClick={() => onDelete(event._id)} color="secondary">
                        Delete
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default EventCRUDModal;