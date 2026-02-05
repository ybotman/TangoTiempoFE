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
 * TIEMPO-360: Simple density cluster icon showing event + discovered counts.
 * @param {object} L - Leaflet instance (passed by caller to avoid require)
 * @param {number} totalCount - Total event count
 * @param {number} discoveredCount - AI-discovered event count
 */
export const createDensityClusterIcon = (L, totalCount, discoveredCount = 0) => {
  if (!L) return null;

  const regularCount = totalCount - discoveredCount;
  const label = discoveredCount > 0
    ? `${regularCount} / ${discoveredCount}`
    : `${totalCount}`;

  // Scale size by count
  const width = discoveredCount > 0 ? 72 : 44;
  const height = 24;

  const html = `
    <div style="
      background: #1976d2;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 2px solid white;
      cursor: pointer;
    ">${label}</div>
  `;

  return L.divIcon({
    className: 'density-cluster-icon',
    html,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2]
  });
};
