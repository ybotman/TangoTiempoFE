// src/app/components/Modals/Messages/ComposeMessageModal.js
// TIEMPO-387: Modal for SA/SO to compose and send messages

import React, { useState, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Box,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';

const APP_ID = process.env.NEXT_PUBLIC_APPLICATION_ID || '1';

const ROLE_OPTIONS = [
  { code: 'NU', label: 'NamedUser (Milonger)' },
  { code: 'RO', label: 'RegionalOrganizer' },
  { code: 'RA', label: 'RegionalAdmin' },
  { code: 'SA', label: 'SystemAdmin' },
  { code: 'SO', label: 'SystemOwner' },
  { code: 'SL', label: 'Spotlighter' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const ROLE_CODE_MAP = {
  'NamedUser': 'NU',
  'RegionalOrganizer': 'RO',
  'RegionalAdmin': 'RA',
  'SystemAdmin': 'SA',
  'SystemOwner': 'SO',
  'Spotlighter': 'SL',
};

const ComposeMessageModal = ({ open, onClose, onSent }) => {
  const { user } = useContext(AuthContext);
  const { selectedRole } = useContext(RoleContext);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRoles, setTargetRoles] = useState(['RO', 'RA']);
  const [priority, setPriority] = useState('medium');
  const [requiresAck, setRequiresAck] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setBody(prev => prev + transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleRoleToggle = (roleCode) => {
    setTargetRoles(prev =>
      prev.includes(roleCode)
        ? prev.filter(r => r !== roleCode)
        : [...prev, roleCode]
    );
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim() || targetRoles.length === 0) {
      setError('Please fill in title, body, and select at least one target role.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const messageData = {
        appId: APP_ID,
        title: title.trim(),
        body: body.trim(),
        from: {
          displayName: user?.displayName || 'Admin',
          role: ROLE_CODE_MAP[selectedRole] || 'SA',
        },
        to: {
          roles: targetRoles,
          targetType: 'role',
        },
        priority,
        requiresAck,
        type: 'announcement',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Reset form
      setTitle('');
      setBody('');
      setTargetRoles(['RO', 'RA']);
      setPriority('medium');
      setRequiresAck(true);

      onSent?.();
      onClose();
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Compose Message</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          size="small"
          placeholder="Message title..."
        />

        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            placeholder="Type your message or use the mic..."
          />
          {voiceSupported && (
            <IconButton
              onClick={toggleVoice}
              sx={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                backgroundColor: isListening ? 'error.main' : 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: isListening ? 'error.dark' : 'primary.dark',
                },
                animation: isListening ? 'pulse 1s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          )}
        </Box>
        {isListening && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            Listening... speak now
          </Typography>
        )}

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">Send to roles:</FormLabel>
          <FormGroup row>
            {ROLE_OPTIONS.map((role) => (
              <FormControlLabel
                key={role.code}
                control={
                  <Checkbox
                    checked={targetRoles.includes(role.code)}
                    onChange={() => handleRoleToggle(role.code)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{role.code}</Typography>}
              />
            ))}
          </FormGroup>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={requiresAck}
                onChange={(e) => setRequiresAck(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Require acknowledgment</Typography>}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={sending || !title.trim() || !body.trim() || targetRoles.length === 0}
          startIcon={<SendIcon />}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ComposeMessageModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSent: PropTypes.func,
};

export default ComposeMessageModal;
