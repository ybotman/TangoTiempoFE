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
        <EventBusyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />

        <Typography variant="h4" component="h1" gutterBottom>
          Event Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This event may have been removed, cancelled, or the link may be incorrect.
        </Typography>

        <Button
          component={Link}
          href="/calendar"
          variant="contained"
          startIcon={<CalendarMonthIcon />}
          size="large"
        >
          Browse All Events
        </Button>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Looking for something specific? Check out{' '}
            <Link href="https://tangotiempo.com" style={{ color: '#1976d2' }}>
              TangoTiempo.com
            </Link>
            {' '}for all upcoming tango events.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
