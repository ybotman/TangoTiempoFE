'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Group } from '@visx/group';
import { scaleTime, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Zoom } from '@visx/zoom';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { CATEGORY_COLORS, colorFor } from './exploreConstants';

// TIEMPO-404 D.4: zoom + pan timeline. visx/zoom applies an X-only
// transform; countries (Y axis) stay fixed.

const MARGIN = { top: 16, right: 32, bottom: 44, left: 160 };
const MIN_BAR_WIDTH = 10;
const ROW_PADDING = 0.3;
const DEFAULT_WIDTH = 1100;
const DEFAULT_HEIGHT_BASE = 480;

const SCALE_X_MIN = 0.5;
const SCALE_X_MAX = 8;

const tooltipStyles = {
  ...defaultStyles,
  background: '#16213e',
  color: '#eee',
  border: '1px solid #3b82f6',
  padding: '0.6rem 0.8rem',
  fontSize: '0.8rem',
  maxWidth: 280,
};

function formatDateRange(start, end) {
  const s = dayjs(start);
  const e = dayjs(end);
  if (s.year() !== e.year()) {
    return `${s.format('MMM D, YYYY')} – ${e.format('MMM D, YYYY')}`;
  }
  if (s.month() === e.month() && s.date() !== e.date()) {
    return `${s.format('MMM D')}–${e.format('D, YYYY')}`;
  }
  if (s.month() === e.month() && s.date() === e.date()) {
    return s.format('MMM D, YYYY');
  }
  return `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`;
}

const INITIAL_MATRIX = { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, skewX: 0, skewY: 0 };

export default function ExploreTimeline({ events, countries, dateRange, onXScaleReady }) {
  const router = useRouter();
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip();
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);

  // Measure container width so SVG fits viewport
  React.useEffect(() => {
    if (!containerRef.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && Math.abs(w - width) > 2) setWidth(Math.floor(w));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width]);

  const rowCount = Math.max(1, countries.length);
  const height = Math.max(DEFAULT_HEIGHT_BASE, MARGIN.top + MARGIN.bottom + rowCount * 44);
  const xMax = width - MARGIN.left - MARGIN.right;
  const yMax = height - MARGIN.top - MARGIN.bottom;

  const baseXScale = React.useMemo(
    () => scaleTime({ domain: dateRange, range: [0, xMax] }),
    [dateRange, xMax]
  );
  const yScale = React.useMemo(
    () => scaleBand({ domain: countries, range: [0, yMax], padding: ROW_PADDING }),
    [countries, yMax]
  );

  // Parent gets the (un-transformed) xScale + width for DensityBar alignment
  React.useEffect(() => {
    if (onXScaleReady) onXScaleReady({ xScale: baseXScale, width, leftMargin: MARGIN.left, rightMargin: MARGIN.right });
  }, [baseXScale, width, onXScaleReady]);

  const handleBarMove = (event, datum) => {
    const svg = event.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    showTooltip({
      tooltipData: datum,
      tooltipLeft: event.clientX - rect.left,
      tooltipTop: event.clientY - rect.top,
    });
  };

  const handleClick = (datum) => {
    if (datum?._id) router.push(`/event/${datum._id}`);
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <Zoom
        width={width}
        height={height}
        scaleXMin={SCALE_X_MIN}
        scaleXMax={SCALE_X_MAX}
        scaleYMin={1}
        scaleYMax={1}
        initialTransformMatrix={INITIAL_MATRIX}
      >
        {(zoom) => {
          // Derive a zoom-aware xScale for rendering bars + x-axis labels.
          // zoom.transformMatrix.scaleX scales X; translateX shifts.
          const zoomedXScale = baseXScale.copy().range([
            zoom.transformMatrix.translateX,
            xMax * zoom.transformMatrix.scaleX + zoom.transformMatrix.translateX,
          ]);

          return (
            <>
              <svg width={width} height={height} role="img" aria-label="Travel-worthy events timeline">
                <defs>
                  <clipPath id="tt-timeline-clip">
                    <rect x={0} y={0} width={xMax} height={yMax} />
                  </clipPath>
                </defs>
                <rect width={width} height={height} fill="#fafafa" rx={6} />

                {/* Y-axis (fixed, outside zoom transform) */}
                <Group left={MARGIN.left} top={MARGIN.top}>
                  <AxisLeft
                    scale={yScale}
                    stroke="#9ca3af"
                    tickStroke="#9ca3af"
                    tickLabelProps={() => ({ fill: '#374151', fontSize: 12, textAnchor: 'end', dx: -4, dy: '0.33em' })}
                  />
                </Group>

                {/* Drag/wheel capture surface — covers the chart area */}
                <rect
                  x={MARGIN.left}
                  y={MARGIN.top}
                  width={xMax}
                  height={yMax}
                  fill="transparent"
                  style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
                  onMouseDown={zoom.dragStart}
                  onMouseMove={zoom.dragMove}
                  onMouseUp={zoom.dragEnd}
                  onMouseLeave={() => { if (zoom.isDragging) zoom.dragEnd(); }}
                  onDoubleClick={zoom.reset}
                  onWheel={(e) => {
                    e.preventDefault();
                    const point = { x: e.clientX, y: e.clientY };
                    zoom.handleWheel({ ...e, deltaY: e.deltaY, clientX: e.clientX, clientY: e.clientY, point });
                  }}
                />

                {/* Zoomed content — gridlines, x-axis, bars — clipped to chart area */}
                <Group left={MARGIN.left} top={MARGIN.top} clipPath="url(#tt-timeline-clip)">
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
                    scale={zoomedXScale}
                    stroke="#9ca3af"
                    tickStroke="#9ca3af"
                    numTicks={Math.max(4, Math.floor(xMax / 100))}
                    tickLabelProps={() => ({ fill: '#6b7280', fontSize: 11, textAnchor: 'middle' })}
                  />

                  {events.map((e) => {
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    const x1 = zoomedXScale(start);
                    const x2 = zoomedXScale(end);
                    const barW = Math.max(MIN_BAR_WIDTH, x2 - x1);
                    const rowY = yScale(e.masteredCountryName);
                    if (rowY === undefined) return null;
                    // Skip if completely off-screen horizontally (perf)
                    if (x1 + barW < -10 || x1 > xMax + 10) return null;
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
                        onMouseMove={(evt) => handleBarMove(evt, e)}
                        onMouseLeave={hideTooltip}
                        onClick={(evt) => { evt.stopPropagation(); handleClick(e); }}
                        onMouseDown={(evt) => evt.stopPropagation()}
                      />
                    );
                  })}
                </Group>
              </svg>

              {/* Zoom controls */}
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.5 }}>
                <Button size="small" onClick={() => zoom.scale({ scaleX: 1.5, scaleY: 1 })}>+</Button>
                <Button size="small" onClick={() => zoom.scale({ scaleX: 1 / 1.5, scaleY: 1 })}>−</Button>
                <Button size="small" onClick={zoom.reset}>Reset</Button>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'right', pr: 0.5 }}>
                Drag to pan · scroll to zoom · double-click to reset
              </Typography>
            </>
          );
        }}
      </Zoom>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: colorFor(tooltipData.categoryFirst) }}>
            {tooltipData.title}
          </div>
          <div>{formatDateRange(tooltipData.startDate, tooltipData.endDate)}</div>
          <div style={{ color: '#cbd5e1' }}>
            {[tooltipData.masteredCityName, tooltipData.masteredCountryName].filter(Boolean).join(', ')}
          </div>
        </TooltipWithBounds>
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center', p: 0.5, fontSize: '0.7rem', color: '#6b7280', flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '2px', background: color, display: 'inline-block' }} />
            {name}
          </Box>
        ))}
      </Box>
    </Box>
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
