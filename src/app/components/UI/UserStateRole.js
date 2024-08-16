import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import IconButton from '@mui/material/IconButton';

const UserStateRole = () => {
    const [icon, setIcon] = useState('person');

    const handleIconClick = () => {
        setIcon(icon === 'person' ? 'face' : 'person');
    };

    return (
        <IconButton onClick={handleIconClick}>
            {icon === 'person' ?
                <PersonIcon sx={{ color: 'lightgrey' }} /> :
                <FaceIcon sx={{ color: 'green' }} />}
        </IconButton>
    );
};

export default UserStateRole;