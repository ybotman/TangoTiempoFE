'use client';

import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography,
  CircularProgress,
  Drawer,
  Button,
  Chip,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import PublicIcon from '@mui/icons-material/Public';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiBaseUrl } from '@/utils/apiUrlResolver';
import dayjs from 'dayjs';
import 'leaflet/dist/leaflet.css';
import { createClusterIcon } from '@/components/EventDiscovery/clusterIcon';
import { AuthContext } from '@/contexts/AuthContext';

// Dynamic imports for Leaflet (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <CircularProgress />
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Dynamic import for MapEventHandler
const MapEventHandler = dynamic(() => import('@/components/EventDiscovery/MapEventHandler'), { ssr: false });

// Event categories
const EVENT_CATEGORIES = [
  'Milonga',
  'Festival',
  'Workshop',
  'DayWorkshop',
  'Classes',
  'Practices',
  'Concerts',
  'Other'
];

// Geographic regions
const REGIONS = [
  { id: 'usa', name: 'USA', bounds: [[49, -125], [25, -66]] },
  { id: 'europe', name: 'Europe', bounds: [[71, -25], [35, 40]] },
  { id: 'asia', name: 'Asia', bounds: [[55, 60], [5, 150]] },
  { id: 'argentina', name: 'Argentina', bounds: [[-22, -73], [-55, -53]] },
  { id: 'south_america', name: 'South America', bounds: [[12, -82], [-55, -34]] }
];

const ExplorerPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getIdToken } = useContext(AuthContext) || {};
  
  // State
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [mapCenter] = useState([20, 0]); // World center
  const [mapZoom, setMapZoom] = useState(2);
  const [mapBounds, setMapBounds] = useState(null);
  
  // Handle bounds change from map
  const handleBoundsChange = (bounds) => {
    setMapBounds(bounds);
  };
  
  // Handle zoom change from map
  const handleZoomChange = (zoom) => {
    setMapZoom(zoom);
  };
  
  // Filters
  const [dateRange, setDateRange] = useState({
    start: dayjs().format('YYYY-MM'),
    end: dayjs().add(12, 'month').format('YYYY-MM')
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [includeAIEvents, setIncludeAIEvents] = useState(false);
  
  // Fetch events based on current map state and filters
  const fetchEvents = async () => {
    if (!mapBounds) return;
    
    setLoading(true);
    try {
      const params = {
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID || '1',
        zoom: mapZoom,
        bounds: JSON.stringify(mapBounds),
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: mapZoom < 8 ? 'clusters' : 'events'
      };
      
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }
      
      // Get auth token if user is logged in
      const headers = {};
      if (user && getIdToken) {
        try {
          const token = await getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (tokenError) {
          console.error('Error getting auth token:', tokenError);
        }
      }
      
      const response = await axios.get(`${getApiBaseUrl()}/api/events/summary`, { 
        params,
        headers 
      });
      
      if (params.format === 'clusters') {
        setClusters(response.data.clusters || []);
        setEvents([]);
      } else {
        setEvents(response.data.events || []);
        setClusters([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Map event handler component must be created inside the MapContainer
  // We'll create it as a separate file or handle events differently
  
  // Fetch events when filters or map state changes
  useEffect(() => {
    if (mapBounds) {
      const debounceTimer = setTimeout(() => {
        fetchEvents();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapBounds, mapZoom, dateRange, selectedCategories, selectedRegion, includeAIEvents]);
  
  // Handle region selection
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    // TODO: Implement map bounds update without ref
    // Dynamic imports don't support refs properly
  };
  
  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          zIndex: 1000,
          borderRadius: 0
        }}
      >
        <IconButton onClick={() => router.push('/calendar')}>
          <CloseIcon />
        </IconButton>
        
        <PublicIcon color="primary" sx={{ fontSize: 28 }} />
        
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Event Explorer
        </Typography>
        
        <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
          <FilterListIcon />
        </IconButton>
      </Paper>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
        {/* Filter Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant={isMobile ? 'temporary' : 'persistent'}
          sx={{
            '& .MuiDrawer-paper': {
              width: 320,
              top: '64px',
              height: 'calc(100% - 64px)'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            
            {/* Date Range */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              <TextField
                type="month"
                label="Start"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                fullWidth
                sx={{ mb: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="month"
                label="End"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Categories */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Event Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {EVENT_CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryToggle(category)}
                    color={selectedCategories.includes(category) ? 'primary' : 'default'}
                    variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Regions */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Geographic Regions
              </Typography>
              {REGIONS.map(region => (
                <Button
                  key={region.id}
                  variant={selectedRegion?.id === region.id ? 'contained' : 'outlined'}
                  onClick={() => handleRegionSelect(region)}
                  fullWidth
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  {region.name}
                </Button>
              ))}
              {selectedRegion && (
                <Button
                  variant="text"
                  onClick={() => setSelectedRegion(null)}
                  fullWidth
                  size="small"
                >
                  Clear Region
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* AI Events Toggle */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeAIEvents}
                  onChange={(e) => setIncludeAIEvents(e.target.checked)}
                />
              }
              label="Include AI-discovered events"
            />
          </Box>
        </Drawer>
        
        {/* Map */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            ml: drawerOpen && !isMobile ? '320px' : 0,
            transition: 'margin-left 0.3s',
            position: 'relative'
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              tileSize={512}
              zoomOffset={-1}
            />
            
            <MapEventHandler 
              onBoundsChange={handleBoundsChange}
              onZoomChange={handleZoomChange}
            />
            
            {/* Render clusters */}
            {clusters.map(cluster => (
              <Marker
                key={cluster.id}
                position={[cluster.center.lat, cluster.center.lng]}
                icon={createClusterIcon(cluster.eventCount)}
                eventHandlers={{
                  click: () => {
                    // TODO: Implement zoom to cluster without ref
                    // Dynamic imports don't support refs properly
                  }
                }}
              >
                <Popup>
                  <Typography variant="subtitle2">{cluster.name}</Typography>
                  <Typography variant="body2">{cluster.eventCount} events</Typography>
                  {cluster.categories && (
                    <Box sx={{ mt: 1 }}>
                      {Object.entries(cluster.categories).map(([cat, count]) => (
                        <Typography key={cat} variant="caption" display="block">
                          {cat}: {count}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Popup>
              </Marker>
            ))}
            
            {events.map(event => {
              // Skip events without proper coordinates
              if (!event.venue?.coordinates?.lat || !event.venue?.coordinates?.lng) {
                return null;
              }
              
              return (
                <Marker
                  key={event._id}
                  position={[event.venue.coordinates.lat, event.venue.coordinates.lng]}
                >
                  <Popup>
                    <Typography variant="subtitle2">{event.title}</Typography>
                    <Typography variant="body2">{event.categoryFirst}</Typography>
                    <Typography variant="caption">
                      {dayjs(event.startDate).format('MMM DD, YYYY')}
                    </Typography>
                    {event.venue?.name && (
                      <Typography variant="caption" display="block">
                        @ {event.venue.name}
                      </Typography>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Loading overlay */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">Loading events...</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ExplorerPage;