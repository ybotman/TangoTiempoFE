// src/app/components/Modals/Messages/MessagesModal.js
// TIEMPO-387: Modal for displaying organizer messages

import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const PRIORITY_CONFIG = {
  low: { color: 'default', icon: InfoIcon },
  medium: { color: 'info', icon: AnnouncementIcon },
  high: { color: 'warning', icon: WarningIcon },
  urgent: { color: 'error', icon: ErrorIcon },
};

const TYPE_LABELS = {
  announcement: 'Announcement',
  update: 'Update',
  error: 'Alert',
};

const MessagesModal = ({
  open,
  onClose,
  messages,
  onAcknowledge,
  currentIndex = 0,
  onNext,
  onPrevious,
}) => {
  if (!messages || messages.length === 0 || !messages[currentIndex]) {
    return null;
  }

  const message = messages[currentIndex];
  const priorityConfig = PRIORITY_CONFIG[message?.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priorityConfig.icon;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleAcknowledge = () => {
    onAcknowledge(message.id);
    // If there are more messages, go to next, otherwise close
    if (currentIndex < messages.length - 1) {
      onNext?.();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: `4px solid`,
          borderColor: `${priorityConfig.color}.main`,
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PriorityIcon color={priorityConfig.color} />
          <Typography variant="h6" component="span">
            {message.title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Message metadata */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={TYPE_LABELS[message.type] || message.type}
            color={priorityConfig.color}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Priority: ${message.priority}`}
            variant="outlined"
          />
          {message.to?.roles?.map((role) => (
            <Chip
              key={role}
              size="small"
              label={role}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Message body - supports markdown */}
        <Box
          sx={{
            '& p': { mt: 0, mb: 1.5 },
            '& h1, & h2, & h3': { mt: 2, mb: 1 },
            '& ul, & ol': { pl: 2, mb: 1.5 },
            '& li': { mb: 0.5 },
            '& a': { color: 'primary.main' },
            '& code': {
              backgroundColor: 'grey.100',
              px: 0.5,
              borderRadius: 0.5,
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: 'grey.100',
              p: 1.5,
              borderRadius: 1,
              overflow: 'auto',
            },
            lineHeight: 1.7,
          }}
        >
          <ReactMarkdown>{message.body}</ReactMarkdown>
        </Box>

        <Divider sx={{ mt: 2, mb: 1 }} />

        {/* Message footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            From: {message.from?.displayName || 'Admin'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(message.createdAt)}
          </Typography>
        </Box>

        {/* Message counter */}
        {messages.length > 1 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            Message {currentIndex + 1} of {messages.length}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {messages.length > 1 && currentIndex > 0 && (
          <Button onClick={onPrevious} variant="outlined" size="small">
            Previous
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!message.requiresAck ? (
          <Button onClick={handleAcknowledge} variant="contained" color="primary">
            Got it
          </Button>
        ) : (
          <Button
            onClick={handleAcknowledge}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            I Read and Understand
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

MessagesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      type: PropTypes.string,
      priority: PropTypes.string,
      requiresAck: PropTypes.bool,
      from: PropTypes.shape({
        displayName: PropTypes.string,
      }),
      to: PropTypes.shape({
        roles: PropTypes.arrayOf(PropTypes.string),
      }),
      createdAt: PropTypes.instanceOf(Date),
    })
  ),
  onAcknowledge: PropTypes.func.isRequired,
  currentIndex: PropTypes.number,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
};

export default MessagesModal;
