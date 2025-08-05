import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  LinearProgress,
  IconButton
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';

const RestartRequiredModal = ({ open, onClose, reason, onRestart }) => {
  const [countdown, setCountdown] = useState(5);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (open && countdown === 0 && !isRestarting) {
      handleRestart();
    }
  }, [open, countdown, isRestarting]);

  const handleRestart = () => {
    setIsRestarting(true);
    // Store any necessary state before restart
    sessionStorage.setItem('restartReason', reason || 'App configuration updated');
    
    // Call parent handler which will reload
    if (onRestart) {
      onRestart();
    } else {
      // Fallback reload
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setCountdown(5); // Reset countdown
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isRestarting}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RestartAltIcon sx={{ mr: 1, color: 'warning.main' }} />
            Restart Required
          </Box>
          {!isRestarting && (
            <IconButton
              aria-label="close"
              onClick={handleCancel}
              sx={{ color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          {reason || 'The application needs to restart to apply your new configuration.'}
        </Typography>
        
        {!isRestarting ? (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              The app will automatically restart in {countdown} seconds, or you can restart now.
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(5 - countdown) * 20} 
              sx={{ mb: 2 }}
            />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Restarting application...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {!isRestarting && (
          <>
            <Button onClick={handleCancel} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleRestart}
              color="warning"
              variant="contained"
              startIcon={<RestartAltIcon />}
            >
              Restart Now
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

RestartRequiredModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reason: PropTypes.string,
  onRestart: PropTypes.func
};

export default RestartRequiredModal;