'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, Divider } from '@mui/material';
import { useEventDiscovery } from '@/contexts/EventDiscoveryContext';
import { useUsers } from '@/hooks/useUsers';
import { locationEventBus, LOCATION_EVENTS } from '@/utils/LocationEventBus';

export default function TestContextsPage() {
  const { state: eventState, actions } = useEventDiscovery();
  const { userData, updateUserData } = useUsers();
  const [eventLog, setEventLog] = useState([]);
  const [testResults, setTestResults] = useState({});

  // Subscribe to location events
  useEffect(() => {
    const logEvent = (eventName) => (data) => {
      const logEntry = {
        time: new Date().toISOString(),
        event: eventName,
        data: JSON.stringify(data)
      };
      setEventLog(prev => [...prev.slice(-9), logEntry]);
      console.log(`Event: ${eventName}`, data);
    };

    const unsubscribers = Object.keys(LOCATION_EVENTS).map(key => {
      const eventName = LOCATION_EVENTS[key];
      return locationEventBus.on(eventName, logEvent(eventName));
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Test 1: Toggle AI Filter
  const testAIFilter = async () => {
    console.log('Test 1: Toggle AI Filter');
    const initialValue = eventState.filters.aiRecommendations;
    actions.setFilters({ aiRecommendations: !initialValue });
    
    // Wait for auto-save
    setTimeout(() => {
      const newValue = eventState.filters.aiRecommendations;
      setTestResults(prev => ({
        ...prev,
        aiFilter: newValue !== initialValue ? 'PASS' : 'FAIL'
      }));
    }, 3000);
  };

  // Test 2: Set Multiple Filters
  const testMultipleFilters = () => {
    console.log('Test 2: Set Multiple Filters');
    actions.setFilters({
      categories: ['Milonga', 'Workshop'],
      venues: ['venue1', 'venue2'],
      organizers: ['org1'],
      searchTerm: 'tango'
    });
    
    setTestResults(prev => ({
      ...prev,
      multipleFilters: 'TRIGGERED'
    }));
  };

  // Test 3: Manual Save
  const testManualSave = async () => {
    console.log('Test 3: Manual Save');
    try {
      await actions.savePreferences();
      setTestResults(prev => ({
        ...prev,
        manualSave: 'PASS'
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        manualSave: `FAIL: ${error.message}`
      }));
    }
  };

  // Test 4: Verify Persistence
  const testPersistence = () => {
    console.log('Test 4: Check Persistence');
    const savedData = userData?.localUserInfo?.userDefaults;
    const hasAIFlag = savedData?.searchSettings?.includeAiGenerated !== undefined;
    const hasFilters = savedData?.eventDiscoveryFilters !== undefined;
    
    setTestResults(prev => ({
      ...prev,
      persistence: {
        aiFlag: hasAIFlag ? 'FOUND' : 'NOT FOUND',
        filters: hasFilters ? 'FOUND' : 'NOT FOUND',
        raw: JSON.stringify(savedData, null, 2)
      }
    }));
  };

  // Test 5: Event Bus Communication
  const testEventBus = () => {
    console.log('Test 5: Event Bus Communication');
    locationEventBus.emit(LOCATION_EVENTS.LOCATION_SELECTED, {
      city: { id: 'test123', name: 'Test City' }
    });
    
    setTestResults(prev => ({
      ...prev,
      eventBus: 'EVENT EMITTED'
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Context Integration Tests
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Current State</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
          <pre>{JSON.stringify({
            filters: eventState.filters,
            hasUnsavedChanges: eventState.hasUnsavedChanges,
            isSaving: eventState.isSavingPreferences,
            error: eventState.preferencesError
          }, null, 2)}</pre>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Test Controls</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={testAIFilter}>
            Test AI Filter Toggle
          </Button>
          <Button variant="contained" onClick={testMultipleFilters}>
            Test Multiple Filters
          </Button>
          <Button variant="contained" onClick={testManualSave}>
            Test Manual Save
          </Button>
          <Button variant="contained" onClick={testPersistence}>
            Check Persistence
          </Button>
          <Button variant="contained" onClick={testEventBus}>
            Test Event Bus
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Test Results</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
          <pre>{JSON.stringify(testResults, null, 2)}</pre>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Event Log (Last 10)</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: '11px', maxHeight: 300, overflow: 'auto' }}>
          {eventLog.map((entry, idx) => (
            <div key={idx}>
              <strong>{entry.time.slice(11, 19)}</strong> - {entry.event}
              <div style={{ marginLeft: 20, color: '#666' }}>{entry.data}</div>
            </div>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}