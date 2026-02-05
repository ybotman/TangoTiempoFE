'use client';

/**
 * Creates a simple blue cluster icon with event count.
 * @param {object} L - Leaflet instance (passed by caller to avoid require)
 * @param {number} count - Event count to display
 */
export const createClusterIcon = (L, count) => {
  if (!L) return null;

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
 * TIEMPO-360: Kayak Explore-style density cluster icon.
 * Colored dot with event count inside + location name label below.
 * Blue = regular events, purple ring accent = AI-discovered events.
 * @param {object} L - Leaflet instance (passed by caller to avoid require)
 * @param {number} totalCount - Total event count
 * @param {number} discoveredCount - AI-discovered event count
 * @param {string} name - Location name to display below the dot
 */
export const createDensityClusterIcon = (L, totalCount, discoveredCount = 0, name = '') => {
  if (!L) return null;

  // Scale dot size by count
  let dotSize, fontSize;
  if (totalCount < 10) {
    dotSize = 28;
    fontSize = 11;
  } else if (totalCount < 50) {
    dotSize = 34;
    fontSize = 12;
  } else if (totalCount < 200) {
    dotSize = 42;
    fontSize = 13;
  } else {
    dotSize = 50;
    fontSize = 14;
  }

  const half = dotSize / 2;
  const hasDiscovered = discoveredCount > 0;

  // Dot fill: solid blue or blue with purple ring for AI-discovered
  const ringStroke = hasDiscovered
    ? `<circle cx="${half}" cy="${half}" r="${half - 1}" fill="none" stroke="#7B1FA2" stroke-width="3"/>`
    : '';

  const dotSvg = `
    <svg width="${dotSize}" height="${dotSize}" viewBox="0 0 ${dotSize} ${dotSize}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${half}" cy="${half}" r="${half - 2}" fill="#1976d2" stroke="white" stroke-width="2"/>
      ${ringStroke}
      <text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central"
        fill="white" font-size="${fontSize}" font-weight="bold"
        style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
        ${totalCount}
      </text>
    </svg>
  `;

  // Truncate long names for the label
  const label = name.length > 18 ? name.substring(0, 16) + '...' : name;
  const labelFontSize = 10;
  const labelHeight = label ? 16 : 0;
  const totalHeight = dotSize + labelHeight;

  // Combine dot + name label
  const html = `
    <div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3)); cursor:pointer;">
      ${dotSvg}
      ${label ? `<div style="
        background: rgba(255,255,255,0.9);
        color: #333;
        font-size: ${labelFontSize}px;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 3px;
        white-space: nowrap;
        margin-top: -2px;
        line-height: 1.3;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      ">${label}</div>` : ''}
    </div>
  `;

  // iconAnchor: center of the dot (label hangs below)
  return L.divIcon({
    className: 'density-cluster-icon',
    html,
    iconSize: [Math.max(dotSize, label.length * 6 + 10), totalHeight],
    iconAnchor: [Math.max(dotSize, label.length * 6 + 10) / 2, half]
  });
};
