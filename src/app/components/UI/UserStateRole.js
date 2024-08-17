import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { IconButton, Tooltip } from '@mui/material';

const UserStateRole = ({ currentRole, setCurrentRole }) => {
    const handleRoleClick = () => {
        let newRole;
        switch (currentRole) {
            case 'anonomous':
                newRole = 'User';
                break;
            case 'User':
                newRole = 'Organizer';
                break;
            case 'Organizer':
                newRole = 'RegionalAdmin';
                break;
            case 'RegionalAdmin':
                newRole = 'anonomous';
                break;
            default:
                newRole = 'anonomous';
                break;
        }
        setCurrentRole(newRole);
        console.log('Current Role:', newRole); // Log the current role
    };

    const getCurrentIcon = () => {
        switch (currentRole) {
            case 'anonomous':
                return <PersonIcon />;
            case 'User':
                return <FaceIcon />;
            case 'Organizer':
                return <SupervisedUserCircleIcon />;
            case 'RegionalAdmin':
                return <AdminPanelSettingsIcon />;
            default:
                return <PersonIcon />;
        }
    };

    const getTooltipTitle = () => {
        switch (currentRole) {
            case 'anonomous':
                return 'Anonymous';
            case 'User':
                return 'User';
            case 'Organizer':
                return 'Organizer';
            case 'RegionalAdmin':
                return 'Regional Admin';
            default:
                return 'Anonymous';
        }
    };

    return (
        <Tooltip title={getTooltipTitle()}>
            <IconButton onClick={handleRoleClick} color="inherit">
                {getCurrentIcon()}
            </IconButton>
        </Tooltip>
    );
};

export default UserStateRole;