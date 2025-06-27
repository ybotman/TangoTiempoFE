// src/app/message-admin/page.js

'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  Paper,
  IconButton,
  Snackbar,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';

export default function MessageAdminPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState({});

  const subjects = [
    'General Inquiry',
    'Technical Issue',
    'Feature Request',
    'Report a Problem',
    'Organizer Support',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate sending message (in real implementation, this would call an API)
    try {
      // Create mailto link as fallback
      const mailtoSubject = encodeURIComponent(`[TangoTiempo] ${formData.subject}: ${formData.name}`);
      const mailtoBody = encodeURIComponent(
        `From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      );
      
      // In production, this would be an API call to send the email
      // For now, we'll use mailto as a fallback
      window.location.href = `mailto:admin@tangotiempo.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      setShowSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, px: isMobile ? 1 : 3 }}>
      {/* Header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/calendar" passHref>
          <IconButton size="small">
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'left' : 'center' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" gutterBottom>
            Message Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get in touch with TangoTiempo administrators
          </Typography>
        </Box>
      </Box>

      {/* Disclaimer Alert */}
      <Alert 
        severity="warning" 
        icon={<WarningIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Important Notice:
        </Typography>
        <Typography variant="body2" paragraph sx={{ mb: 1 }}>
          TangoTiempo is NOT responsible for incorrect dates and events. Event information is 
          provided by organizers and may change without notice.
        </Typography>
        <Typography variant="body2">
          <strong>For questions about specific events, please contact the event organizer directly.</strong>
        </Typography>
      </Alert>

      {/* Contact Options */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Contact Options
        </Typography>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} mt={2}>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            sx={{ 
              backgroundColor: '#1877F2', 
              '&:hover': { backgroundColor: '#145dbf' },
              flex: isMobile ? 'none' : 1
            }}
            href="https://www.facebook.com/tangotiempo"
            target="_blank"
            rel="noopener noreferrer"
            fullWidth={isMobile}
          >
            Message on Facebook
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            sx={{ 
              backgroundColor: '#EA4335', 
              '&:hover': { backgroundColor: '#d33b2c' },
              flex: isMobile ? 'none' : 1
            }}
            href="mailto:admin@tangotiempo.com"
            fullWidth={isMobile}
          >
            Email Directly
          </Button>
        </Box>
      </Paper>

      {/* Contact Form */}
      <Paper sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant="h6" gutterBottom>
          Send a Message
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For all other inquiries, feature requests, or general feedback, please use the form below.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            error={!!errors.subject}
            helperText={errors.subject}
            required
            sx={{ mb: 2 }}
          >
            {subjects.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            error={!!errors.message}
            helperText={errors.message}
            multiline
            rows={6}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={loading}
            fullWidth={isMobile}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Message sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          Failed to send message. Please try again or use the direct contact options above.
        </Alert>
      </Snackbar>
    </Container>
  );
}