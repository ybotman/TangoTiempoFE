'use client';

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
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
  // MongoDB GeoJSON: { type: 'Point', coordinates: [lng, lat] }
  if (Array.isArray(vg.coordinates) && vg.coordinates.length >= 2) {
    const [lng, lat] = vg.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') return [lat, lng];
  }
  if (typeof vg.lat === 'number' && typeof vg.lng === 'number') return [vg.lat, vg.lng];
  return null;
}

export default function ExploreMap({ events }) {
  const router = useRouter();

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

  if (!events || events.length === 0) {
    return <Alert severity="info">No events match the current filter.</Alert>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
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
                radius={7}
                pathOptions={{
                  color: isAI ? '#d97706' : '#ffffff',
                  weight: isAI ? 2 : 1,
                  dashArray: isAI ? '3 2' : undefined,
                  fillColor: color,
                  fillOpacity: 0.92,
                }}
                eventHandlers={{ click: () => router.push(`/calendar?event=${e._id}`) }}
              >
                <Popup>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
                      {e.title}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      {dayjs(e.startDate).format('MMM D')} – {dayjs(e.endDate).format('MMM D, YYYY')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {[e.masteredCityName, e.masteredCountryName].filter(Boolean).join(', ')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 600, color }}>
                      {categoryLabel(e.categoryFirst)}
                    </Typography>
                    {isAI && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: '#d97706', fontWeight: 700 }}>
                        🤖 AI-Found
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center', p: 0.5, mt: 1, fontSize: '0.7rem', color: '#6b7280', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1px solid #fff' }} />
            {name}
          </Box>
        ))}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#9ca3af', border: '2px dashed #d97706' }} />
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
