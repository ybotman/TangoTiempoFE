'use client';

import { useState } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';

export default function TestGoogleAPI() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('1600 Amphitheatre Parkway, Mountain View, CA');

  const testGeocoding = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey) {
        setError('NEXT_PUBLIC_GOOGLE_API_KEY is not configured');
        setLoading(false);
        return;
      }
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        setResults({
          status: 'Success',
          location: data.results[0].geometry.location,
          formattedAddress: data.results[0].formatted_address,
          placeId: data.results[0].place_id
        });
      } else {
        setError(`API Status: ${data.status}. ${data.error_message || ''}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Google API Test Page
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Google Geocoding API
        </Typography>
        
        <TextField
          fullWidth
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          onClick={testGeocoding}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Geocoding'}
        </Button>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {results && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Results:</Typography>
          <Typography>Status: {results.status}</Typography>
          <Typography>Formatted Address: {results.formattedAddress}</Typography>
          <Typography>Latitude: {results.location.lat}</Typography>
          <Typography>Longitude: {results.location.lng}</Typography>
          <Typography>Place ID: {results.placeId}</Typography>
        </Paper>
      )}
    </Box>
  );
}