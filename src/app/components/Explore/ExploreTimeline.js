'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Group } from '@visx/group';
import { scaleTime, scaleBand } from '@visx/scale';
import { Circle } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import dayjs from 'dayjs';

// TIEMPO-404 Milestone A: basic scatter plot on /explore.
// No scroll, no filters, no density bar — proves the visx pipeline.

const WIDTH = 1000;
const HEIGHT = 520;
const MARGIN = { top: 20, right: 40, bottom: 48, left: 160 };

const CATEGORY_COLORS = {
  Festival: '#e94560',
  Marathon: '#f97316',
  Encuentro: '#22c55e',
  Workshop: '#ec4899',
  Trip: '#3b82f6',
  Class: '#8b5cf6',
  Other: '#6b7280',
};

const categoryLabel = (c) => (c && c !== 'unknown' ? c : 'Other');
const colorFor = (c) => CATEGORY_COLORS[categoryLabel(c)] || CATEGORY_COLORS.Other;

const tooltipStyles = {
  ...defaultStyles,
  background: '#16213e',
  color: '#eee',
  border: '1px solid #3b82f6',
  padding: '0.6rem 0.8rem',
  fontSize: '0.8rem',
  maxWidth: 280,
};

export default function ExploreTimeline({ events }) {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip();

  const countries = React.useMemo(
    () => Array.from(new Set(events.map((e) => e.masteredCountryName))).sort(),
    [events]
  );

  const { xScale, yScale, xMax, yMax } = React.useMemo(() => {
    const allMs = events.flatMap((e) => [new Date(e.startDate).getTime(), new Date(e.endDate).getTime()]);
    const minDate = allMs.length ? new Date(Math.min(...allMs)) : new Date();
    const maxDate = allMs.length ? new Date(Math.max(...allMs)) : dayjs().add(6, 'month').toDate();
    const paddedMin = dayjs(minDate).subtract(14, 'day').toDate();
    const paddedMax = dayjs(maxDate).add(14, 'day').toDate();
    const xMax = WIDTH - MARGIN.left - MARGIN.right;
    const yMax = HEIGHT - MARGIN.top - MARGIN.bottom;
    return {
      xMax,
      yMax,
      xScale: scaleTime({ domain: [paddedMin, paddedMax], range: [0, xMax] }),
      yScale: scaleBand({ domain: countries, range: [0, yMax], padding: 0.3 }),
    };
  }, [events, countries]);

  const handleEnter = (event, datum) => {
    const svg = event.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    showTooltip({
      tooltipData: datum,
      tooltipLeft: event.clientX - rect.left,
      tooltipTop: event.clientY - rect.top,
    });
  };

  const handleClick = (datum) => {
    const q = encodeURIComponent(`${datum.title} ${datum.masteredCityName || ''} tango`.trim());
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg width={WIDTH} height={HEIGHT} role="img" aria-label="Travel-worthy events timeline">
        <rect width={WIDTH} height={HEIGHT} fill="#fafafa" rx={6} />
        <Group left={MARGIN.left} top={MARGIN.top}>
          {/* Horizontal gridlines per country */}
          {countries.map((country) => {
            const y = yScale(country) + yScale.bandwidth() / 2;
            return <line key={country} x1={0} x2={xMax} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="2 4" />;
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
            const x = xScale(new Date(e.startDate));
            const y = yScale(e.masteredCountryName) + yScale.bandwidth() / 2;
            return (
              <Circle
                key={e._id}
                cx={x}
                cy={y}
                r={8}
                fill={colorFor(e.categoryFirst)}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onMouseMove={(evt) => handleEnter(evt, e)}
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
            Click to search organizer ↗
          </div>
        </TooltipWithBounds>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: 8, fontSize: '0.75rem', color: '#6b7280', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
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
};
