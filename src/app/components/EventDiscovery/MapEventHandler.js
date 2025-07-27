'use client';

import { useMapEvents } from 'react-leaflet';

const MapEventHandler = ({ onBoundsChange, onZoomChange }) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      if (onBoundsChange) {
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
      
      if (onZoomChange) {
        onZoomChange(zoom);
      }
    },
    zoomend: (e) => {
      const map = e.target;
      const zoom = map.getZoom();
      
      if (onZoomChange) {
        onZoomChange(zoom);
      }
    }
  });
  
  return null;
};

export default MapEventHandler;