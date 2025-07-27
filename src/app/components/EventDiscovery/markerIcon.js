'use client';

let defaultIcon;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-undef
  const L = require('leaflet');
  
  // Fix for default markers in react-leaflet
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });

  defaultIcon = new L.Icon.Default();
}

export { defaultIcon };