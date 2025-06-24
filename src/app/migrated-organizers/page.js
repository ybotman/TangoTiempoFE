// @/migrated-organizers/page.js

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Button,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMigratedOrganizers } from '@/hooks/useMigratedOrganizers';

export default function MigratedOrganizersPage() {
  const { organizers, loading, error, refreshData } = useMigratedOrganizers();
  const [expandedInfo, setExpandedInfo] = useState(false);

  const handleRefresh = () => {
    refreshData();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Migration Data</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Organizer Migration Status
          </Typography>
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Chip 
              label="TEMPORARY PAGE" 
              color="warning" 
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Tracking migration status for approved organizers
        </Typography>
      </Paper>

      {/* Migration Instructions */}
      <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">Migration Information</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This page displays the current migration status of all approved organizers. 
            It shows authentication linkages, profile completeness, and event management status.
          </Typography>
          <Typography variant="body2">
            <strong>Note:</strong> This is a temporary page for migration purposes. 
            Full migration instructions will be added shortly.
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => setExpandedInfo(!expandedInfo)}
          >
            {expandedInfo ? 'Hide' : 'Show'} Detailed Instructions
          </Button>
          {expandedInfo && (
            <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Migration Process:</strong>
              </Typography>
              <ol style={{ paddingLeft: '20px' }}>
                <li>Verify organizer has Auth ID linked</li>
                <li>Ensure Firebase User ID is connected</li>
                <li>Check organizer photo is uploaded</li>
                <li>Confirm at least one managed event exists</li>
                <li>Review and maintain shortName (cannot be changed)</li>
              </ol>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Box display="flex" gap={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Organizers
            </Typography>
            <Typography variant="h4">
              {organizers.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Fully Migrated
            </Typography>
            <Typography variant="h4" color="success.main">
              {organizers.filter(org => org.authId && org.firebaseUserId && org.hasEvents).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Pending Migration
            </Typography>
            <Typography variant="h4" color="warning.main">
              {organizers.filter(org => !org.authId || !org.firebaseUserId || !org.hasEvents).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Organizers Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="migrated organizers table">
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Organizer Name</TableCell>
              <TableCell>Short Name</TableCell>
              <TableCell align="center">Auth ID</TableCell>
              <TableCell align="center">Firebase User ID</TableCell>
              <TableCell align="center">Approved</TableCell>
              <TableCell align="center">Has Events</TableCell>
              <TableCell align="center">Migration Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizers.map((organizer) => {
              const isMigrated = organizer.authId && organizer.firebaseUserId && organizer.hasEvents;
              
              return (
                <TableRow
                  key={organizer._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Avatar
                      src={organizer.organizerPhoto}
                      alt={organizer.organizerName}
                      sx={{ width: 40, height: 40 }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {organizer.organizerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {organizer._id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={organizer.shortName} 
                      size="small" 
                      variant="outlined"
                      icon={<InfoIcon />}
                      title="Short name cannot be changed"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {organizer.authId ? (
                      <Tooltip title={`Auth ID: ${organizer.authId}`}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <CancelIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {organizer.firebaseUserId ? (
                      <Tooltip title={`Firebase ID: ${organizer.firebaseUserId}`}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <CancelIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={organizer.isApproved ? 'Approved' : 'Pending'}
                      color={organizer.isApproved ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {organizer.hasEvents ? (
                      <Tooltip title={`${organizer.eventCount} events`}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <EventIcon color="success" fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {organizer.eventCount}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <CancelIcon color="error" fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={isMigrated ? 'Complete' : 'Pending'}
                      color={isMigrated ? 'success' : 'warning'}
                      size="small"
                      variant={isMigrated ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Note */}
      <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
        <Typography variant="caption" color="text.secondary">
          * This is a temporary migration tracking page. Data shown includes all approved organizers 
          with their authentication status, profile completeness, and event management verification.
        </Typography>
      </Box>
    </Container>
  );
}