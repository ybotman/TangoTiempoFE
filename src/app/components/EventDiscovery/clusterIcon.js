'use client';

export const createClusterIcon = (count) => {
  if (typeof window === 'undefined') {
    return null;
  }

  // eslint-disable-next-line no-undef
  const L = require('leaflet');

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

/**
 * TIEMPO-360: Dual-color density cluster icon for MapCenterModal overlay.
 * Blue = regular events, purple = AI-discovered events.
 * Size scales with total count. Ready for discoveredCount when BEAF adds it (CALBEAF-76).
 */
export const createDensityClusterIcon = (totalCount, discoveredCount = 0) => {
  if (typeof window === 'undefined') {
    return null;
  }

  // eslint-disable-next-line no-undef
  const L = require('leaflet');

  // Scale size by count
  let size, fontSize;
  if (totalCount < 10) {
    size = 32;
    fontSize = 12;
  } else if (totalCount < 50) {
    size = 40;
    fontSize = 13;
  } else if (totalCount < 200) {
    size = 52;
    fontSize = 14;
  } else {
    size = 60;
    fontSize = 15;
  }

  const half = size / 2;
  const hasDiscovered = discoveredCount > 0;

  // Build SVG with proportional blue/purple segments
  let svgContent;
  if (!hasDiscovered) {
    // All regular — solid blue circle
    svgContent = `<circle cx="${half}" cy="${half}" r="${half - 2}" fill="#1976d2" stroke="white" stroke-width="2"/>`;
  } else {
    // Proportional arc: blue for regular, purple for discovered
    const discoveredRatio = discoveredCount / totalCount;
    const regularAngle = (1 - discoveredRatio) * 360;
    const startAngle = -90; // Start from top
    const regularEnd = startAngle + regularAngle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const r = half - 2;

    // Blue (regular) arc
    const x1 = half + r * Math.cos(toRad(startAngle));
    const y1 = half + r * Math.sin(toRad(startAngle));
    const x2 = half + r * Math.cos(toRad(regularEnd));
    const y2 = half + r * Math.sin(toRad(regularEnd));
    const largeArc1 = regularAngle > 180 ? 1 : 0;

    // Purple (discovered) arc
    const x3 = half + r * Math.cos(toRad(regularEnd));
    const y3 = half + r * Math.sin(toRad(regularEnd));
    const x4 = half + r * Math.cos(toRad(startAngle + 360));
    const y4 = half + r * Math.sin(toRad(startAngle + 360));
    const largeArc2 = (360 - regularAngle) > 180 ? 1 : 0;

    svgContent = `
      <path d="M${half},${half} L${x1},${y1} A${r},${r} 0 ${largeArc1},1 ${x2},${y2} Z" fill="#1976d2"/>
      <path d="M${half},${half} L${x3},${y3} A${r},${r} 0 ${largeArc2},1 ${x4},${y4} Z" fill="#7B1FA2"/>
      <circle cx="${half}" cy="${half}" r="${half - 2}" fill="none" stroke="white" stroke-width="2"/>
    `;
  }

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${svgContent}
      <text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central"
        fill="white" font-size="${fontSize}" font-weight="bold"
        style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
        ${totalCount}
      </text>
    </svg>
  `;

  return L.divIcon({
    className: 'density-cluster-icon',
    html: `<div style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">${svg}</div>`,
    iconSize: [size, size],
    iconAnchor: [half, half]
  });
};