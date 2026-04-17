'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Group } from '@visx/group';
import { scaleTime, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import dayjs from 'dayjs';
import { CATEGORY_COLORS, categoryLabel, colorFor } from './exploreConstants';

// TIEMPO-404 Milestone B: date-range bars, horizontal scroll, click → /event/[id].

const HEIGHT_BASE = 480;
const MARGIN = { top: 16, right: 32, bottom: 44, left: 160 };
const PX_PER_DAY = 4; // 4 → ~120px/month, readable without being giant
const MIN_BAR_WIDTH = 6; // single-day events still clickable
const MIN_CHART_WIDTH = 960;
const ROW_PADDING = 0.35;

const tooltipStyles = {
  ...defaultStyles,
  background: '#16213e',
  color: '#eee',
  border: '1px solid #3b82f6',
  padding: '0.6rem 0.8rem',
  fontSize: '0.8rem',
  maxWidth: 280,
};

export default function ExploreTimeline({ events, countries, dateRange, onXScaleReady }) {
  const router = useRouter();
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip();

  const { xScale, yScale, xMax, yMax, height, width } = React.useMemo(() => {
    const totalDays = Math.max(1, dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day'));
    const width = Math.max(MIN_CHART_WIDTH, Math.ceil(totalDays * PX_PER_DAY) + MARGIN.left + MARGIN.right);
    // Stretch chart vertically based on how many rows we have
    const rowCount = Math.max(1, countries.length);
    const height = Math.max(HEIGHT_BASE, MARGIN.top + MARGIN.bottom + rowCount * 44);
    const xMax = width - MARGIN.left - MARGIN.right;
    const yMax = height - MARGIN.top - MARGIN.bottom;
    return {
      xMax,
      yMax,
      width,
      height,
      xScale: scaleTime({ domain: dateRange, range: [0, xMax] }),
      yScale: scaleBand({ domain: countries, range: [0, yMax], padding: ROW_PADDING }),
    };
  }, [countries, dateRange]);

  // Expose xScale + width to parent so DensityBar can align
  React.useEffect(() => {
    if (onXScaleReady) onXScaleReady({ xScale, width, leftMargin: MARGIN.left, rightMargin: MARGIN.right });
  }, [xScale, width, onXScaleReady]);

  const handleMove = (event, datum) => {
    const svg = event.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    showTooltip({
      tooltipData: datum,
      tooltipLeft: event.clientX - rect.left,
      tooltipTop: event.clientY - rect.top,
    });
  };

  const handleClick = (datum) => {
    if (!datum?._id) return;
    router.push(`/event/${datum._id}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height} role="img" aria-label="Travel-worthy events timeline">
        <rect width={width} height={height} fill="#fafafa" rx={6} />
        <Group left={MARGIN.left} top={MARGIN.top}>
          {/* Horizontal gridlines per country */}
          {countries.map((country) => {
            const y = yScale(country) + yScale.bandwidth() / 2;
            return (
              <line
                key={country}
                x1={0}
                x2={xMax}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="2 4"
              />
            );
          })}

          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="#9ca3af"
            tickStroke="#9ca3af"
            tickLabelProps={() => ({ fill: '#6b7280', fontSize: 11, textAnchor: 'middle' })}
          />
          <AxisLeft
            scale={yScale}
            stroke="#9ca3af"
            tickStroke="#9ca3af"
            tickLabelProps={() => ({ fill: '#374151', fontSize: 12, textAnchor: 'end', dx: -4, dy: '0.33em' })}
          />

          {events.map((e) => {
            const start = new Date(e.startDate);
            const end = new Date(e.endDate);
            const x1 = xScale(start);
            const x2 = xScale(end);
            const barW = Math.max(MIN_BAR_WIDTH, x2 - x1);
            const rowY = yScale(e.masteredCountryName);
            if (rowY === undefined) return null; // country not in current filter
            const barH = yScale.bandwidth();
            return (
              <rect
                key={e._id}
                x={x1}
                y={rowY}
                width={barW}
                height={barH}
                rx={3}
                ry={3}
                fill={colorFor(e.categoryFirst)}
                stroke="#fff"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
                onMouseMove={(evt) => handleMove(evt, e)}
                onMouseLeave={hideTooltip}
                onClick={() => handleClick(e)}
              />
            );
          })}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{tooltipData.title}</div>
          <div>
            {dayjs(tooltipData.startDate).format('MMM D')} – {dayjs(tooltipData.endDate).format('MMM D, YYYY')}
          </div>
          <div>
            {[tooltipData.masteredCityName, tooltipData.masteredCountryName].filter(Boolean).join(', ')}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: 4 }}>
            {categoryLabel(tooltipData.categoryFirst)}
            {tooltipData.cost ? ` · ${tooltipData.cost}` : ''}
          </div>
          <div style={{ color: '#93c5fd', fontSize: '0.7rem', marginTop: 6 }}>
            Click to open on TangoTiempo ↗
          </div>
        </TooltipWithBounds>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: 8, fontSize: '0.75rem', color: '#6b7280', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

ExploreTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      categoryFirst: PropTypes.string,
      masteredCountryName: PropTypes.string,
      masteredCityName: PropTypes.string,
      cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  countries: PropTypes.arrayOf(PropTypes.string).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onXScaleReady: PropTypes.func,
};
