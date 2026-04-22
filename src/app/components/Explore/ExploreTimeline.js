'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { Group } from '@visx/group';
import { scaleTime, scaleOrdinal } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Zoom } from '@visx/zoom';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { Box, Button, Popover, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { CATEGORY_COLORS, colorFor, categoryLabel } from './exploreConstants';
import { useGeoLocation } from '@/contexts/GeoLocationContext';

// TIEMPO-404 D.4: zoom + pan timeline. visx/zoom applies an X-only
// transform; countries (Y axis) stay fixed.

const MARGIN = { top: 16, right: 32, bottom: 44, left: 160 };
const MIN_BAR_WIDTH = 10;
const DEFAULT_WIDTH = 1100;
const DEFAULT_HEIGHT_BASE = 480;
const LANE_H = 24;   // px per sub-lane within a country band
const LANE_GAP = 8;  // px gap between country bands

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

function resolveVenueGeo(e) {
  const vg = e.venueGeolocation;
  if (!vg) return null;
  if (Array.isArray(vg.coordinates) && vg.coordinates.length >= 2) {
    const [lng, lat] = vg.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }
  if (Number.isFinite(vg.lat) && Number.isFinite(vg.lng)) return [vg.lat, vg.lng];
  return null;
}

function truncate(str, n) {
  if (!str) return '';
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length > n ? `${clean.slice(0, n).trim()}…` : clean;
}

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

function assignEventLanes(events) {
  const byCountry = new Map();
  for (const e of events) {
    const c = e.masteredCountryName || 'Other';
    if (!byCountry.has(c)) byCountry.set(c, []);
    byCountry.get(c).push(e);
  }
  const laneOf = new Map();   // _id → lane index (0-based)
  const laneCount = new Map(); // country → number of lanes needed
  for (const [country, evts] of byCountry) {
    const sorted = [...evts].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const laneEnd = []; // laneEnd[i] = end-ms of the last event placed in lane i
    for (const e of sorted) {
      const start = new Date(e.startDate).getTime();
      const end   = new Date(e.endDate).getTime();
      let placed = false;
      for (let i = 0; i < laneEnd.length; i++) {
        if (start >= laneEnd[i]) {
          laneEnd[i] = end;
          laneOf.set(e._id, i);
          placed = true;
          break;
        }
      }
      if (!placed) {
        laneOf.set(e._id, laneEnd.length);
        laneEnd.push(end);
      }
    }
    laneCount.set(country, Math.max(1, laneEnd.length));
  }
  return { laneOf, laneCount };
}

export default function ExploreTimeline({ events, countries, dateRange, onXScaleReady }) {
  const router = useRouter();
  const { setSessionLocation } = useGeoLocation();
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip();
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const [clickedEvent, setClickedEvent] = React.useState(null);
  const [popoverAnchor, setPopoverAnchor] = React.useState(null);

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

  const xMax = width - MARGIN.left - MARGIN.right;

  const baseXScale = React.useMemo(
    () => scaleTime({ domain: dateRange, range: [0, xMax] }),
    [dateRange, xMax]
  );

  const { laneOf, laneCount } = React.useMemo(() => assignEventLanes(events), [events]);

  // yLayout[country] = { y: number (top of band), height: number, center: number }
  const yLayout = React.useMemo(() => {
    const layout = {};
    let y = 0;
    for (const country of countries) {
      const lanes = laneCount.get(country) || 1;
      const h = lanes * LANE_H;
      layout[country] = { y, height: h, center: y + h / 2, lanes };
      y += h + LANE_GAP;
    }
    return layout;
  }, [countries, laneCount]);

  const totalContentH = React.useMemo(() => {
    if (!countries.length) return DEFAULT_HEIGHT_BASE - MARGIN.top - MARGIN.bottom;
    const last = yLayout[countries[countries.length - 1]];
    return last ? last.y + last.height : 200;
  }, [countries, yLayout]);

  const yMax = totalContentH;
  const height = Math.max(DEFAULT_HEIGHT_BASE, MARGIN.top + yMax + MARGIN.bottom + 44);

  // Y-axis scale: ordinal scale mapping country → center Y of its band
  // Used by AxisLeft so labels appear centered in each (possibly expanded) band.
  const yAxisScale = React.useMemo(
    () =>
      scaleOrdinal({
        domain: countries,
        range: countries.map((c) => yLayout[c]?.center ?? 0),
      }),
    [countries, yLayout]
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

  const handleBarClick = (evt, datum) => {
    evt.stopPropagation();
    hideTooltip();
    setClickedEvent(datum);
    setPopoverAnchor({ left: evt.clientX, top: evt.clientY });
  };

  const handlePopoverClose = () => {
    setClickedEvent(null);
    setPopoverAnchor(null);
  };

  const handleDrillThrough = () => {
    if (!clickedEvent) return;
    const ll = resolveVenueGeo(clickedEvent);
    if (ll) setSessionLocation({ lat: ll[0], lng: ll[1], zoomRange: 50 });
    router.push(`/calendar?event=${clickedEvent._id}`);
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
                  {/* TIEMPO-408: AI-Found bar overlay — diagonal stripe pattern
                      makes AI-sourced events visually distinguishable at a glance. */}
                  <pattern id="tt-ai-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="rgba(0,0,0,0)" />
                    <rect width="2" height="6" fill="rgba(0,0,0,0.35)" />
                  </pattern>
                </defs>
                <rect width={width} height={height} fill="#fafafa" rx={6} />

                {/* Y-axis (fixed, outside zoom transform) */}
                <Group left={MARGIN.left} top={MARGIN.top}>
                  <AxisLeft
                    scale={yAxisScale}
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
                  onTouchStart={zoom.dragStart}
                  onTouchMove={zoom.dragMove}
                  onTouchEnd={zoom.dragEnd}
                  onDoubleClick={zoom.reset}
                  onWheel={(e) => {
                    e.preventDefault();
                    const point = { x: e.clientX, y: e.clientY };
                    zoom.handleWheel({ ...e, deltaY: e.deltaY, clientX: e.clientX, clientY: e.clientY, point });
                  }}
                />

                {/* Zoomed content — gridlines, x-axis, bars — clipped to chart area */}
                <Group left={MARGIN.left} top={MARGIN.top} clipPath="url(#tt-timeline-clip)">
                  {/* Alternating band backgrounds + solid separator lines */}
                  {countries.map((country, i) => {
                    const ly = yLayout[country];
                    if (!ly) return null;
                    return (
                      <g key={country}>
                        {i % 2 === 1 && (
                          <rect
                            x={0} y={ly.y}
                            width={xMax} height={ly.height}
                            fill="rgba(0,0,0,0.03)"
                          />
                        )}
                        <line
                          x1={0} x2={xMax}
                          y1={ly.y + ly.height + LANE_GAP / 2}
                          y2={ly.y + ly.height + LANE_GAP / 2}
                          stroke="#94a3b8"
                          strokeWidth={1}
                        />
                      </g>
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
                    const end   = new Date(e.endDate);
                    const x1 = zoomedXScale(start);
                    const x2 = zoomedXScale(end);
                    const barW = Math.max(MIN_BAR_WIDTH, x2 - x1);
                    const ly = yLayout[e.masteredCountryName];
                    if (!ly) return null;
                    if (x1 + barW < -10 || x1 > xMax + 10) return null;
                    const lane = laneOf.get(e._id) ?? 0;
                    const barY = ly.y + lane * LANE_H + 1;   // 1px top padding within lane
                    const barH = LANE_H - 2;                  // 2px bottom gap within lane
                    const isAI = Boolean(e.isAiGenerated || e.isDiscovered);
                    const categoryColor = colorFor(e.categoryFirst);
                    const commonProps = {
                      x: x1, y: barY, width: barW, height: barH, rx: 3, ry: 3,
                      style: { cursor: 'pointer' },
                      onMouseMove: (evt) => handleBarMove(evt, e),
                      onMouseLeave: hideTooltip,
                      onClick: (evt) => handleBarClick(evt, e),
                      onMouseDown: (evt) => evt.stopPropagation(),
                      onTouchStart: zoom.dragStart,
                      onTouchMove: zoom.dragMove,
                      onTouchEnd: zoom.dragEnd,
                    };
                    return (
                      <g key={e._id}>
                        <rect {...commonProps} fill={categoryColor} stroke={isAI ? '#d97706' : '#fff'} strokeWidth={isAI ? 1.5 : 1} strokeDasharray={isAI ? '3 2' : undefined} />
                        {isAI && (
                          <rect x={x1} y={barY} width={barW} height={barH} rx={3} ry={3} fill="url(#tt-ai-stripes)" style={{ pointerEvents: 'none' }} />
                        )}
                      </g>
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

      {/* Click popup — same content as ExploreMap popup */}
      <Popover
        open={Boolean(clickedEvent)}
        anchorReference="anchorPosition"
        anchorPosition={popoverAnchor ?? { top: 0, left: 0 }}
        onClose={handlePopoverClose}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 1.5, maxWidth: 280, borderRadius: 2 } }}
      >
        {clickedEvent && (() => {
          const color = colorFor(clickedEvent.categoryFirst);
          const isAI = Boolean(clickedEvent.isAiGenerated || clickedEvent.isDiscovered);
          return (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color, lineHeight: 1.3, mb: 0.25 }}>
                {clickedEvent.title}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                {formatDateRange(clickedEvent.startDate, clickedEvent.endDate)}
              </Typography>
              {(clickedEvent.masteredCityName || clickedEvent.masteredCountryName) && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  {[clickedEvent.masteredCityName, clickedEvent.masteredCountryName].filter(Boolean).join(', ')}
                </Typography>
              )}
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 600, color }}>
                {categoryLabel(clickedEvent.categoryFirst)}
                {isAI && <span style={{ marginLeft: 6, color: '#d97706', fontWeight: 700 }}>🤖 AI-Found</span>}
              </Typography>
              {clickedEvent.description && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.75, lineHeight: 1.4, fontStyle: 'italic' }}>
                  {truncate(clickedEvent.description, 180)}
                </Typography>
              )}
              <Button
                size="small"
                variant="contained"
                onClick={handleDrillThrough}
                fullWidth
                sx={{ mt: 1, bgcolor: color, color: '#fff', fontSize: '0.7rem', textTransform: 'none', py: 0.25, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}
              >
                View full event →
              </Button>
            </>
          );
        })()}
      </Popover>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: colorFor(tooltipData.categoryFirst) }}>
            {tooltipData.title}
          </div>
          <div>{formatDateRange(tooltipData.startDate, tooltipData.endDate)}</div>
          <div style={{ color: '#cbd5e1' }}>
            {[tooltipData.masteredCityName, tooltipData.masteredCountryName].filter(Boolean).join(', ')}
          </div>
          {(tooltipData.isAiGenerated || tooltipData.isDiscovered) && (
            <div style={{ marginTop: 4, color: '#fbbf24', fontWeight: 600 }}>
              🤖 AI-Found
            </div>
          )}
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
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
          <svg width={10} height={10} style={{ display: 'inline-block' }}>
            <rect width={10} height={10} fill="#9ca3af" />
            <rect width={10} height={10} fill="url(#tt-ai-stripes)" />
          </svg>
          AI-Found
        </Box>
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
      description: PropTypes.string,
      venueGeolocation: PropTypes.object,
      isAiGenerated: PropTypes.bool,
      isDiscovered: PropTypes.bool,
    })
  ).isRequired,
  countries: PropTypes.arrayOf(PropTypes.string).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onXScaleReady: PropTypes.func,
};
