'use client';

import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export const defaultIcon = new L.Icon.Default();