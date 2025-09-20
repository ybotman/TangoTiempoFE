'use client';

import React, { useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import VenueGeocodeModal from '../components/Modals/VenueGeocode/VenueGeocodeModal';

export default function TestVenueGeocode() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Venue Geocoding Modal
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This is a test page for the venue geocoding modal. Click the button below to open it.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddLocationIcon />}
          onClick={() => setModalOpen(true)}
        >
          Open Venue Geocode Modal
        </Button>
      </Box>

      <VenueGeocodeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Test Instructions:
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Enter venue name and address details</li>
          <li>Click &quot;Geocode&quot; to get coordinates and see map</li>
          <li>Shows nearest mastered city (e.g., &quot;Boston&quot; for Quincy addresses)</li>
          <li>Low confidence addresses show warning to verify map location</li>
          <li>Nearby venues within 100 yards are displayed as warnings</li>
          <li>Save button creates the venue after validation</li>
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Sample Addresses to Test:
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Empire State Building, New York, NY 10118</li>
          <li>100 City Hall Plaza, Boston, MA 02108</li>
          <li>1600 Pennsylvania Avenue NW, Washington, DC 20500</li>
          <li>Golden Gate Bridge, San Francisco, CA 94129</li>
        </Typography>
        
        <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
          Note: Generic addresses like &quot;123 Main St&quot; may fail geocoding. Use real, well-known addresses for testing.
        </Typography>
      </Box>
    </Container>
  );
}