'use client';

import React, { useState } from 'react';
import { Button, Container, Typography } from '@mui/material';
import ViewEventDetailModal from '@/components/Modals/ViewEvents/ViewEventDetailModal';

export default function TestModalPage() {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Mock event data
  const mockEventDetails = {
    title: 'Buenos Aires Tango Festival - A Very Long Title That Should Test Mobile Header Display',
    _instance: {
      range: {
        start: new Date('2025-06-15T20:00:00'),
        end: new Date('2025-06-15T23:00:00')
      }
    },
    allDay: false,
    extendedProps: {
      _id: 'test123',
      categoryFirst: 'Milonga',
      categorySecond: 'Workshop',
      categoryThird: 'Festival',
      description: 'Join us for an amazing night of tango dancing with live music and professional dancers.',
      eventImage: '/TangoQuestion.jpg',
      ownerOrganizerID: '123456'
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Modal Mobile Responsiveness
      </Typography>
      
      <Typography variant="body1" paragraph>
        Click the button below to test the modal on different screen sizes.
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => setModalOpen(true)}
        size="large"
      >
        Open Event Modal
      </Button>
      
      <ViewEventDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eventDetails={mockEventDetails}
        onEventUpdated={() => console.log('Event updated')}
      />
    </Container>
  );
}