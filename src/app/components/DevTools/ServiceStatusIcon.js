// components/DevTools/ServiceStatusIcon.js
'use client';

import React, { useState } from 'react';
import { IconButton, Badge } from '@mui/material';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ServiceStatusModal from './ServiceStatusModal';
import { useServiceHealth } from '@/hooks/useServiceHealth';

/**
 * Service Status Icon Button
 * Displays a cloud icon with status indicator that opens the full service dashboard modal
 */
const ServiceStatusIcon = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const services = useServiceHealth();

  /**
   * Calculate overall service health
   * Returns 'healthy', 'warning', 'error'
   */
  const getOverallStatus = () => {
    const allServices = [
      services.expressBackend,
      services.firebase,
      services.mapbox,
      services.mongodb,
      services.googleAnalytics,
      services.geoAPI,
      services.azureFunctions,
      services.googleGeoAPI,
    ];

    const hasError = allServices.some(s => s.status === 'error');
    const hasChecking = allServices.some(s => s.status === 'checking');

    if (hasError) return 'error';
    if (hasChecking) return 'warning';
    return 'success';
  };

  /**
   * Get badge color based on status
   */
  const getBadgeColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'success':
        return '#4CAF50'; // Green
      case 'warning':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  };

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          position: 'absolute',
          top: '45px',
          left: '10px',
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
        title="View Service Status Dashboard"
      >
        <Badge
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: getBadgeColor(),
              boxShadow: '0 0 0 2px white',
            },
          }}
        >
          <CloudQueueIcon fontSize="small" />
        </Badge>
      </IconButton>

      <ServiceStatusModal open={modalOpen} onClose={handleClose} />
    </>
  );
};

export default ServiceStatusIcon;
