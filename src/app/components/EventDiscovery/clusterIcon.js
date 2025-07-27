'use client';

import L from 'leaflet';

export const createClusterIcon = (count) => {
  return L.divIcon({
    className: 'custom-cluster-icon',
    html: `
      <div style="
        background: #1976d2;
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: 14px;
        border: 2px solid white;
      ">
        ${count}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};