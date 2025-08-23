'use client';

import React, { useEffect, useState } from 'react';
import { useVenues } from '@/hooks/useVenues';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';

export default function TestVenueCreation() {
  const { venues, loading } = useVenues();
  const [testResults, setTestResults] = useState([]);

  const testVenues = [
    { name: 'EPIC. Q-BALLROOM', expected: 'success' },
    { name: 'Dance Union', expected: 'might fail - no shortName' },
    { name: '(Maine) Maine Ballroom Dance', expected: 'might fail - inactive' },
    { name: 'Allston Abbey', expected: 'might fail - isApproved false' },
  ];

  useEffect(() => {
    if (!loading && venues.length > 0) {
      const results = testVenues.map(test => {
        const venue = venues.find(v => v.name === test.name);
        if (!venue) return { ...test, status: 'NOT FOUND' };
        
        return {
          ...test,
          venue,
          isActive: venue.isActive,
          isApproved: venue.isApproved,
          hasShortName: !!venue.shortName,
          shortName: venue.shortName || 'MISSING',
          status: venue.isActive && venue.isApproved && venue.shortName ? 'GOOD' : 'ISSUES'
        };
      });
      setTestResults(results);
    }
  }, [venues, loading]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Venue Test Results</Typography>
      {testResults.map((result, idx) => (
        <Card key={idx} sx={{ mb: 2, bgcolor: result.status === 'GOOD' ? 'success.light' : 'warning.light' }}>
          <CardContent>
            <Typography variant="h6">{result.name}</Typography>
            <Typography>Status: {result.status}</Typography>
            <Typography>isActive: {String(result.isActive)}</Typography>
            <Typography>isApproved: {String(result.isApproved)}</Typography>
            <Typography>shortName: {result.shortName}</Typography>
            <Typography color="text.secondary">{result.expected}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}