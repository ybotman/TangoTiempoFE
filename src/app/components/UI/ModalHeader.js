import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalHeader = ({ title, onClose, actions, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        ...sx
      }}
    >
      <Toolbar variant={isMobile ? "regular" : "dense"}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 500
          }}
          noWrap
        >
          {title}
        </Typography>
        {actions && (
          <div style={{ marginRight: '8px' }}>
            {actions}
          </div>
        )}
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          size={isMobile ? "medium" : "small"}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

ModalHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.node,
  sx: PropTypes.object
};

export default ModalHeader;