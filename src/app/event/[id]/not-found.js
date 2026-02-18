// TIEMPO-256: Custom 404 page for invalid event IDs
// Shows when an event doesn't exist or has been removed

import { Box, Typography, Button, Paper } from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Link from 'next/link';

export default function EventNotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <EventBusyIcon sx={{ fontSize: 80, color: '#f57c00', mb: 2 }} />

        <Typography variant="h4" component="h1" gutterBottom>
          Site Being Fixed
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Thank you for your patience.
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, fontWeight: 500, color: '#388e3c' }}>
          All data will be back very soon.
        </Typography>

        <Button
          component={Link}
          href="/calendar"
          variant="contained"
          startIcon={<CalendarMonthIcon />}
          size="large"
        >
          Browse Calendar
        </Button>
      </Paper>
    </Box>
  );
}
