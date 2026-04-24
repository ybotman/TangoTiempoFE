'use client';

import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

// TIEMPO-404 Milestone B: events-per-week density bar.
// Aligned to the timeline's xScale via shared dateRange + dims.

const HEIGHT = 48;
const BAR_COLOR = '#3b82f6';

export default function DensityBar({ events, xScale, leftMargin, width }) {
  if (!xScale || !events?.length) {
    return <div style={{ height: HEIGHT }} />;
  }

  // Bucket events into calendar weeks by startDate.
  const buckets = new Map(); // weekStartISO -> count
  events.forEach((e) => {
    const wk = dayjs(e.startDate).startOf('week').toISOString();
    buckets.set(wk, (buckets.get(wk) || 0) + 1);
  });

  const maxCount = Math.max(...buckets.values(), 1);
  const chartHeight = HEIGHT - 6; // leave space for bottom margin

  return (
    <div style={{ width }}>
      <svg width={width} height={HEIGHT} aria-label="Events per week density">
        <rect width={width} height={HEIGHT} fill="#f5f7fa" rx={4} />
        {Array.from(buckets.entries()).map(([weekISO, count]) => {
          const weekStart = new Date(weekISO);
          const weekEnd = dayjs(weekStart).add(7, 'day').toDate();
          const x1 = leftMargin + xScale(weekStart);
          const x2 = leftMargin + xScale(weekEnd);
          const barW = Math.max(2, x2 - x1 - 1);
          const h = Math.round((count / maxCount) * chartHeight);
          const y = HEIGHT - h - 3;
          return (
            <rect
              key={weekISO}
              x={x1}
              y={y}
              width={barW}
              height={h}
              fill={BAR_COLOR}
              opacity={0.75}
              rx={1}
            >
              <title>
                {dayjs(weekStart).format('MMM D')}: {count} event{count !== 1 ? 's' : ''}
              </title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}

DensityBar.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  xScale: PropTypes.func,
  leftMargin: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};
