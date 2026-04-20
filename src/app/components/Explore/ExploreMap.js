'use client';

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Box, Typography, Alert, CircularProgress, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { colorFor, categoryLabel, CATEGORY_COLORS } from './exploreConstants';
import { centroidFor, jitterPosition } from './countryCentroids';

// TIEMPO-408 item 6: world map of travelWorthy events — respects rules 1-5.
// Category = marker fill color.
// Country = marker position (venue geo if present, else country centroid).
// AI-Found = dashed amber ring + small 🤖 in popup.

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress />
  </Box>
);

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false, loading: Loading });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

function resolveVenueGeo(e) {
  const vg = e.venueGeolocation;
  if (!vg) return null;
  // TIEMPO-414: Number.isFinite catches NaN / Infinity / null / undefined that
  // `typeof x === 'number'` silently lets through for `NaN`.
  // MongoDB GeoJSON: { type: 'Point', coordinates: [lng, lat] }
  if (Array.isArray(vg.coordinates) && vg.coordinates.length >= 2) {
    const [lng, lat] = vg.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }
  if (Number.isFinite(vg.lat) && Number.isFinite(vg.lng)) return [vg.lat, vg.lng];
  return null;
}

function truncate(str, n) {
  if (!str) return '';
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length > n ? `${clean.slice(0, n).trim()}…` : clean;
}

export default function ExploreMap({ events }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const markerRadius = isMobile ? 11 : 7;
  const popupMinWidth = isMobile ? 140 : 180;

  const { positioned, skipped } = useMemo(() => {
    const groupCounters = new Map();
    const out = [];
    let skip = 0;
    for (const e of events) {
      const venueLL = resolveVenueGeo(e);
      if (venueLL) {
        out.push({ e, ll: venueLL, fromVenue: true });
        continue;
      }
      const c = e.masteredCountryName && centroidFor(e.masteredCountryName);
      if (!c) { skip += 1; continue; }
      // Count per-country so we can jitter overlapping centroid markers
      const prev = groupCounters.get(e.masteredCountryName) || 0;
      groupCounters.set(e.masteredCountryName, prev + 1);
      out.push({ e, ll: c, fromVenue: false, _groupIdx: prev, _groupKey: e.masteredCountryName });
    }
    // Apply jitter for multi-event centroids
    const counts = new Map(groupCounters);
    for (const item of out) {
      if (item.fromVenue) continue;
      const total = counts.get(item._groupKey) || 1;
      item.ll = jitterPosition(item.ll, item._groupIdx, total);
    }
    return { positioned: out, skipped: skip };
  }, [events]);

  const noEvents = !events || events.length === 0;

  return (
    <Box sx={{ position: 'relative' }}>
      {noEvents && (
        <Alert severity="info" sx={{ mb: 1 }}>
          No events match the current filter.
        </Alert>
      )}
      <Box
        sx={{
          height: { xs: 420, md: 560 },
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <MapContainer
          center={[25, 10]}
          zoom={2}
          minZoom={2}
          maxZoom={10}
          worldCopyJump
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positioned.map(({ e, ll }) => {
            const isAI = Boolean(e.isAiGenerated || e.isDiscovered);
            const color = colorFor(e.categoryFirst);
            return (
              <CircleMarker
                key={e._id}
                center={ll}
                radius={markerRadius}
                pathOptions={{
                  color: isAI ? '#d97706' : '#ffffff',
                  weight: isAI ? 2 : 2,
                  dashArray: isAI ? '3 2' : undefined,
                  fillColor: color,
                  fillOpacity: 0.92,
                }}
              >
                <Popup>
                  <Box sx={{ minWidth: popupMinWidth, maxWidth: isMobile ? 240 : 300 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color, lineHeight: 1.3, mb: 0.25 }}>
                      {e.title}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                      {dayjs(e.startDate).format('MMM D')} – {dayjs(e.endDate).format('MMM D, YYYY')}
                    </Typography>
                    {(e.masteredCityName || e.masteredCountryName) && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {[e.masteredCityName, e.masteredCountryName].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 600, color }}>
                      {categoryLabel(e.categoryFirst)}
                      {isAI && <span style={{ marginLeft: 6, color: '#d97706', fontWeight: 700 }}>🤖 AI-Found</span>}
                    </Typography>
                    {e.description && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                          display: 'block',
                          mt: 0.75,
                          lineHeight: 1.4,
                          fontStyle: 'italic',
                        }}
                      >
                        {truncate(e.description, 180)}
                      </Typography>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => router.push(`/calendar?event=${e._id}`)}
                      sx={{
                        mt: 1,
                        bgcolor: color,
                        color: '#fff',
                        fontSize: '0.7rem',
                        textTransform: 'none',
                        py: 0.25,
                        '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
                      }}
                      fullWidth
                    >
                      View full event →
                    </Button>
                  </Box>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </Box>

      <Box sx={{
        display: 'flex',
        gap: { xs: 0.75, sm: 1.25 },
        justifyContent: 'center',
        p: 0.5,
        mt: 1,
        fontSize: { xs: '0.62rem', sm: '0.7rem' },
        color: '#6b7280',
        flexWrap: 'wrap',
      }}>
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{
              width: { xs: 8, sm: 10 },
              height: { xs: 8, sm: 10 },
              borderRadius: '50%',
              background: color,
              border: '1px solid #fff',
            }} />
            {name}
          </Box>
        ))}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
          <Box sx={{
            width: { xs: 8, sm: 10 },
            height: { xs: 8, sm: 10 },
            borderRadius: '50%',
            background: '#9ca3af',
            border: '2px dashed #d97706',
          }} />
          AI-Found
        </Box>
      </Box>

      {skipped > 0 && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem' }}>
          {skipped} event{skipped === 1 ? '' : 's'} not placed on the map (missing venue coordinates + unknown country centroid).
        </Alert>
      )}
    </Box>
  );
}

ExploreMap.propTypes = {
  events: PropTypes.array.isRequired,
};
