// components/DevTools/ServiceStatusModal.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useServiceHealth } from '@/hooks/useServiceHealth';
import GeoComparisonDashboard from './GeoComparisonDashboard';

/**
 * Service Status Modal
 * Displays comprehensive service health information in a readable modal format
 *
 * TEMPORARY: Password protected with hardcoded "gotanman" - will be removed before production
 */
const ServiceStatusModal = ({ open, onClose }) => {
  const services = useServiceHealth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset authentication when modal closes
  useEffect(() => {
    if (!open) {
      setIsAuthenticated(false);
      setPassword('');
      setError('');
    }
  }, [open]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TEMPORARY: Hardcoded password - will be removed before production
    if (password === 'gotanman') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  /**
   * Get status color for chips
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'checking':
        return 'warning';
      case 'error':
        return 'error';
      case 'disabled':
        return 'default';
      default:
        return 'default';
    }
  };

  /**
   * Get accuracy color for geolocation services
   */
  const getAccuracyColor = (accuracy) => {
    if (accuracy === null) return '#757575';
    if (accuracy < 50) return '#00C853'; // Dark Green: <50m GPS
    if (accuracy < 500) return '#4CAF50'; // Green: 50-500m Neighborhood
    if (accuracy < 5000) return '#FFEB3B'; // Yellow: 500m-5km City
    if (accuracy < 50000) return '#FF9800'; // Orange: 5km-50km Regional
    return '#F44336'; // Red: >50km Country fallback
  };

  /**
   * Render service accordion
   */
  const renderServiceAccordion = (service, title) => {
    const isGeoService = service.accuracy !== null;
    const accuracyColor = isGeoService ? getAccuracyColor(service.accuracy) : null;

    return (
      <Accordion
        key={service.name}
        sx={{
          borderLeft: isGeoService ? `4px solid ${accuracyColor}` : 'none',
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${service.name}-content`}
          id={`${service.name}-header`}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {title || service.name}
            </Typography>
            <Chip
              label={service.status}
              size="small"
              color={getStatusColor(service.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {service.detail}
          </Typography>

          {/* Geolocation-specific info */}
          {isGeoService && (
            <Box sx={{ mb: 2 }}>
              {service.city && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  📍 <strong>Location:</strong> {service.city}{service.region_code && `, ${service.region_code}`}{service.postal && ` ${service.postal}`}
                </Typography>
              )}
              {service.country_name && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🌍 <strong>Country:</strong> {service.country_name} ({service.country_code})
                </Typography>
              )}
              {service.timezone && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🕐 <strong>Timezone:</strong> {service.timezone}
                </Typography>
              )}
              {service.latitude && service.longitude && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🧭 <strong>Coordinates:</strong> {service.latitude.toFixed(4)}, {service.longitude.toFixed(4)}
                </Typography>
              )}
              {service.accuracy && (
                <Typography variant="body2" display="block" sx={{ fontWeight: 600, color: accuracyColor, mb: 0.5 }}>
                  📏 <strong>Accuracy:</strong> ±{(service.accuracy / 1000).toFixed(1)}km
                </Typography>
              )}
              {service.distanceToGoogle && (
                <Typography variant="body2" display="block" sx={{ fontWeight: 600, color: '#FF5722', mb: 0.5 }}>
                  📊 <strong>Distance to Google Geo API:</strong> {service.distanceToGoogle.km.toFixed(1)}km / {service.distanceToGoogle.mi.toFixed(1)}mi
                </Typography>
              )}
              {service.distanceToIpapi && (
                <Typography variant="body2" display="block" sx={{ fontWeight: 600, color: '#FF5722', mb: 0.5 }}>
                  📊 <strong>Distance to ipapi.co:</strong> {service.distanceToIpapi.km.toFixed(1)}km / {service.distanceToIpapi.mi.toFixed(1)}mi
                </Typography>
              )}
              {service.fullAddress && (
                <Typography variant="body2" display="block">
                  🏠 <strong>Address:</strong> {service.fullAddress}
                </Typography>
              )}
            </Box>
          )}

          {/* Cloudflare-specific info */}
          {service.name === 'Cloudflare' && (
            <Box sx={{ mb: 2 }}>
              {service.ip && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🌐 <strong>Visitor IP:</strong> {service.ip}
                </Typography>
              )}
              {service.country && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🌍 <strong>Country Code:</strong> {service.country}
                </Typography>
              )}
              {service.ray && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🔍 <strong>Cloudflare Ray ID:</strong> {service.ray}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                ℹ️ Cloudflare provides real visitor IP (bypassing proxies) and country code from edge servers
              </Typography>
            </Box>
          )}

          {/* Timezone-specific info */}
          {service.timeZoneId && (
            <Box sx={{ mb: 2 }}>
              {service.timeZoneName && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  🕐 <strong>Timezone Name:</strong> {service.timeZoneName}
                </Typography>
              )}
              {service.rawOffset !== undefined && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  ⏰ <strong>UTC Offset:</strong> UTC{service.rawOffset >= 0 ? '+' : ''}{service.rawOffset} hours
                </Typography>
              )}
              {service.dstOffset !== undefined && service.dstOffset !== 0 && (
                <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                  ☀️ <strong>DST Offset:</strong> +{service.dstOffset} hours
                </Typography>
              )}
              {service.latitude && service.longitude && (
                <Typography variant="body2" display="block">
                  🧭 <strong>Coordinates:</strong> {service.latitude.toFixed(4)}, {service.longitude.toFixed(4)}
                </Typography>
              )}
            </Box>
          )}

          {/* Azure Functions Swagger link */}
          {service.name === 'AF Health' && service.status === 'healthy' && (
            <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                📚 Swagger Documentation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                localhost:7071/api/docs
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Render domain test accordion
   */
  const renderDomainTestAccordion = (domain, endpoint, requiresAppId = false) => {
    const baseUrl = 'https://calendar-be-af.azurewebsites.net/api';
    const fullUrl = requiresAppId ? `${baseUrl}/${endpoint}?appId=1` : `${baseUrl}/${endpoint}`;
    const curlCommand = `curl "${fullUrl}"`;

    return (
      <Accordion
        key={domain}
        sx={{
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${domain}-test-content`}
          id={`${domain}-test-header`}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {domain}
            </Typography>
            <Chip
              label={requiresAppId ? 'MongoDB' : 'Mock Data'}
              size="small"
              color={requiresAppId ? 'success' : 'warning'}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              🌐 Browser Test:
            </Typography>
            <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
              <Typography
                variant="caption"
                component="a"
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  wordBreak: 'break-all'
                }}
              >
                {fullUrl}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              💻 cURL Command:
            </Typography>
            <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, fontFamily: 'monospace' }}>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                {curlCommand}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Show password dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Access Required
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter password to view service status dashboard
            </Typography>
            <TextField
              autoFocus
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!password}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  // Show service dashboard if authenticated
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span">Service Status Dashboard</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Backend Services */}
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            Backend Services
          </Typography>
        </Box>
        {renderServiceAccordion(services.expressBackend, 'Express Backend')}
        {renderServiceAccordion(services.mongodb, 'MongoDB')}
        {renderServiceAccordion(services.firebase, 'Firebase Auth')}

        {/* Azure Functions */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            Azure Functions
          </Typography>
        </Box>
        {renderServiceAccordion(services.azureFunctions, 'AF Health')}

        {/* Domain Testing */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            Domain Testing (appId=1)
          </Typography>
        </Box>
        {renderDomainTestAccordion('Categories', 'categories', true)}
        {renderDomainTestAccordion('Venues', 'venues', true)}
        {renderDomainTestAccordion('Events', 'events', true)}

        {/* Geolocation Services */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            Geolocation Services (TIEMPO-321)
          </Typography>
        </Box>

        {/* Comparison Dashboard */}
        <Box sx={{ px: 3, pb: 2 }}>
          <GeoComparisonDashboard />
        </Box>

        {/* Individual Service Details */}
        {renderServiceAccordion(services.geoAPI, 'Geo API (ipapi.co)')}
        {renderServiceAccordion(services.googleGeoAPI, 'Google Geolocation API')}

        {/* Third-Party Services */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600 }}>
            Third-Party Services
          </Typography>
        </Box>
        {renderServiceAccordion(services.cloudflare, 'Cloudflare CDN')}
        {renderServiceAccordion(services.mapbox, 'Mapbox Maps')}
        {renderServiceAccordion(services.googleAnalytics, 'Google Analytics')}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceStatusModal;
