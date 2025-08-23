// src/app/message-admin/page.js

'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';

export default function MessageAdminPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Link href="/" passHref>
          <IconButton 
            aria-label="back to home"
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Contact Admin
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
        <Typography variant="body2" sx={{ mb: 1 }}>
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
            href={user 
              ? `mailto:admin@tangotiempo.com?subject=[TangoTiempo] Contact from ${user.displayName || user.email}&body=From: ${user.displayName || 'User'}%0AEmail: ${user.email}%0A${user.backendInfo?.regionalOrganizerInfo?.organizerId ? 'Role: Regional Organizer%0A' : ''}%0A%0A[Your message here]`
              : 'mailto:admin@tangotiempo.com'
            }
            fullWidth={isMobile}
          >
            Email Directly
          </Button>
        </Box>
      </Paper>

      {/* Future Feature Notice */}
      <Paper sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant="h6" gutterBottom>
          Send a Message
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For all other inquiries, feature requests, or general feedback, please use the contact options above.
        </Typography>

        {/* Coming Soon Notice */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Two-way messaging coming soon!
          </Typography>
          <Typography variant="body2">
            We&apos;re working on a new feature that will allow you to send messages directly through TangoTiempo. 
            For now, please use the contact options above.
          </Typography>
        </Alert>

        {/* Show logged-in user info */}
        {user && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Logged in as: <strong>{user.displayName || user.email}</strong>
              {user.backendInfo?.regionalOrganizerInfo?.organizerId && (
                <> (Regional Organizer)</>
              )}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
