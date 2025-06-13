'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Paper, Grid, Box, Alert, Button, Switch, FormControlLabel, AppBar, Toolbar, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGeoLocation } from '../contexts/GeoLocationContext';
import { useMasteredLocation } from '../contexts/MasteredLocationContext';
import { AuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SiteHeader from '../components/UI/SiteHeader';
import styles from './page.module.css';

export default function GeoDiagnosticsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const geoContext = useGeoLocation();
  const masteredContext = useMasteredLocation();
  
  const [cfGeoData, setCfGeoData] = useState(null);
  const [currentSystemData, setCurrentSystemData] = useState(null);
  const [edgeEnabled, setEdgeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check access permissions
  useEffect(() => {
    const checkAccess = () => {
      // Allow in development
      if (process.env.NODE_ENV === 'development') return true;
      
      // In production, require admin role
      if (!user || !user.roles?.includes('SystemAdmin')) {
        router.push('/');
        return false;
      }
      return true;
    };

    if (!checkAccess()) return;
  }, [user, router]);

  // Get CF headers from cookie
  useEffect(() => {
    const getCfData = () => {
      // Debug: log all cookies
      console.log('All cookies:', document.cookie);
      
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('cf-geo-data='))
        ?.split('=')[1];
      
      console.log('CF cookie value:', cookieValue);
      
      if (cookieValue) {
        try {
          const data = JSON.parse(decodeURIComponent(cookieValue));
          console.log('Parsed CF data:', data);
          setCfGeoData(data);
        } catch (e) {
          console.error('Error parsing CF geo data:', e);
        }
      } else {
        console.log('No CF cookie found');
      }
    };

    getCfData();
    setLoading(false);
    
    // Refresh every 30 seconds
    const interval = setInterval(getCfData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get current system data
  useEffect(() => {
    if (geoContext) {
      setCurrentSystemData({
        userLocation: geoContext.userLocation,
        selectedLocation: geoContext.selectedLocation,
        loading: geoContext.loading,
        error: geoContext.error,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [geoContext]);

  // Toggle edge geolocation
  const handleEdgeToggle = (event) => {
    const enabled = event.target.checked;
    setEdgeEnabled(enabled);
    
    // Store in localStorage for persistence
    localStorage.setItem('edge-geolocation-enabled', enabled.toString());
    
    // In real implementation, this would switch the location provider
    console.log('Edge geolocation:', enabled ? 'ENABLED' : 'DISABLED');
  };

  // Load edge enabled state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('edge-geolocation-enabled');
    if (savedState !== null) {
      setEdgeEnabled(savedState === 'true');
    }
  }, []);

  // Format display data
  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    
    // Handle the nested location structure
    if (location.city?.name) {
      const parts = [
        location.city.name,
        location.division?.name || location.region?.name,
        location.country?.name
      ].filter(Boolean);
      return parts.join(', ');
    }
    
    // Fallback for other structures
    return `${location.city || 'Unknown'}, ${location.region || ''} ${location.country || ''}`.trim();
  };

  if (loading) {
    return (
      <div>
        <SiteHeader />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading diagnostics...</Typography>
        </Container>
      </div>
    );
  }

  return (
    <div>
      {isMobile ? (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => router.push('/')} 
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Geo-Diagnostics
            </Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <SiteHeader />
      )}
      <Container maxWidth={isMobile ? false : "lg"} sx={{ mt: isMobile ? 2 : 4, mb: 4, px: isMobile ? 2 : 3 }}>
        {!isMobile && (
          <Typography variant="h4" gutterBottom>
            Geolocation Diagnostics
          </Typography>
        )}
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This page displays all geolocation data for debugging and testing purposes.
        </Alert>

        <Grid container spacing={3}>
          {/* Cloudflare Edge Headers Panel */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cloudflare Edge Headers
              </Typography>
              {cfGeoData ? (
                <Box sx={{ fontFamily: 'monospace' }}>
                  <div>CF-IPCity: {cfGeoData.city || 'Not Available'}</div>
                  <div>CF-IPCountry: {cfGeoData.country || 'Not Available'}</div>
                  <div>CF-IPContinent: {cfGeoData.continent || 'Not Available'}</div>
                  <div>CF-Timezone: {cfGeoData.timezone || 'Not Available'}</div>
                  <div>CF-Region: {cfGeoData.region || 'Not Available'}</div>
                  <div>CF-IP: {cfGeoData.ip || 'Not Available'}</div>
                  {cfGeoData.latitude && <div>CF-Latitude: {cfGeoData.latitude}</div>}
                  {cfGeoData.longitude && <div>CF-Longitude: {cfGeoData.longitude}</div>}
                  {cfGeoData.postalCode && <div>CF-PostalCode: {cfGeoData.postalCode}</div>}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color={cfGeoData.city ? 'success.main' : 'error.main'}>
                      Status: {cfGeoData.city ? '✅ Available' : '❌ Not Available'}
                    </Typography>
                    {cfGeoData.workerActive && (
                      <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                        🔧 Cloudflare Worker: Active (X-Geo-* headers)
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">No CF headers detected</Typography>
              )}
            </Paper>
          </Grid>

          {/* Current System Panel */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current System (ipapi.co)
              </Typography>
              {currentSystemData ? (
                <Box sx={{ fontFamily: 'monospace' }}>
                  <div>Status: {currentSystemData.loading ? '⏳ Loading' : '✅ Active'}</div>
                  <div>User Location: {formatLocation(currentSystemData.userLocation)}</div>
                  <div>Selected Location: {formatLocation(currentSystemData.selectedLocation)}</div>
                  {currentSystemData.userLocation?.coords && (
                    <>
                      <div>Latitude: {currentSystemData.userLocation.coords.latitude}</div>
                      <div>Longitude: {currentSystemData.userLocation.coords.longitude}</div>
                    </>
                  )}
                  <div>Last Updated: {new Date(currentSystemData.lastUpdated).toLocaleTimeString()}</div>
                  {currentSystemData.error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      Error: {currentSystemData.error}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">No data available</Typography>
              )}
            </Paper>
          </Grid>

          {/* Comparison Panel */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Comparison
              </Typography>
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <table className={styles.comparisonTable}>
                  <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current System</th>
                    <th>Edge System</th>
                    <th>Better</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Response Time</td>
                    <td>~300ms</td>
                    <td>0ms</td>
                    <td>✅ Edge</td>
                  </tr>
                  <tr>
                    <td>Accuracy</td>
                    <td>City-level</td>
                    <td>City-level</td>
                    <td>➡️ Same</td>
                  </tr>
                  <tr>
                    <td>API Calls</td>
                    <td>Required</td>
                    <td>None</td>
                    <td>✅ Edge</td>
                  </tr>
                  <tr>
                    <td>Cost</td>
                    <td>Per request</td>
                    <td>Free</td>
                    <td>✅ Edge</td>
                  </tr>
                  <tr>
                    <td>Privacy</td>
                    <td>Good</td>
                    <td>Better</td>
                    <td>✅ Edge</td>
                  </tr>
                </tbody>
                </table>
              </Box>
            </Paper>
          </Grid>

          {/* Location Contexts Panel */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location Contexts State
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    GeoLocationContext:
                  </Typography>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {geoContext ? (
                      <>
                        <div>User Location: {formatLocation(geoContext.userLocation)}</div>
                        <div>Selected Location: {formatLocation(geoContext.selectedLocation)}</div>
                        <div>Loading: {geoContext.loading ? 'true' : 'false'}</div>
                        <div>Error: {geoContext.error || 'none'}</div>
                      </>
                    ) : (
                      <div>Context not available</div>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    MasteredLocationContext:
                  </Typography>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {masteredContext ? (
                      <>
                        <div>Current City: {masteredContext.currentCity?.city || 'N/A'}</div>
                        <div>Division: {masteredContext.currentDivision?.division || 'N/A'}</div>
                        <div>Region: {masteredContext.currentRegion?.region || 'N/A'}</div>
                        <div>Country: {masteredContext.currentCountry?.country || 'N/A'}</div>
                      </>
                    ) : (
                      <div>Context not available</div>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Feature Flag Control */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Beta Testing Control
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={edgeEnabled}
                    onChange={handleEdgeToggle}
                    color="primary"
                  />
                }
                label="Enable Edge Geolocation (Beta)"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                When enabled:
              </Typography>
              <ul>
                <li>Uses Cloudflare headers for location detection</li>
                <li>Falls back to current system if headers unavailable</li>
                <li>Logs performance metrics for comparison</li>
              </ul>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Current Status: {edgeEnabled ? 'ENABLED' : 'DISABLED'} - 
                {edgeEnabled ? ' Using edge geolocation' : ' Using traditional IP lookup'}
              </Alert>
            </Paper>
          </Grid>

          {/* Manual Testing Tools */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Manual Testing Tools
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Simulate Boston
                </Button>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Simulate New York
                </Button>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Simulate Los Angeles
                </Button>
                <Button variant="outlined" color="secondary">
                  Clear Override
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: Manual overrides are not yet implemented in this POC
              </Typography>
            </Paper>
          </Grid>

          {/* Debug Actions */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Debug Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.reload()}
                  sx={{ mr: 2 }}
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => {
                    const data = {
                      cfHeaders: cfGeoData,
                      currentSystem: currentSystemData,
                      edgeEnabled,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `geo-diagnostics-${Date.now()}.json`;
                    a.click();
                  }}
                >
                  Export Diagnostics
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}