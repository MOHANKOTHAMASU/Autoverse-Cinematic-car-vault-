// AutoVerse Stage 16: Interactive EV Route Map & SoC Profile Visualizer
// Renders dynamic highway geometries, charging station pins, and battery State-of-Charge trajectories.

import React, { useState } from 'react';
import {
  Zap,
  BatteryCharging,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { TripPlanResult, PlannedChargingStop } from '../../types/tripPlanner';

interface InteractiveRouteMapProps {
  plan: TripPlanResult;
  selectedStopId?: string | null;
  onSelectStop?: (stop: PlannedChargingStop) => void;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  plan,
  selectedStopId,
  onSelectStop,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredStop, setHoveredStop] = useState<PlannedChargingStop | null>(null);

  const points = plan.routePolylinePoints;
  if (!points || points.length === 0) {
    return (
      <div
        style={{
          height: '340px',
          backgroundColor: '#070a0e',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <span>No route coordinates available</span>
      </div>
    );
  }

  // Calculate bounding box for SVG projection
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(0.05, maxLat - minLat);
  const lngSpan = Math.max(0.05, maxLng - minLng);

  // SVG viewBox coordinates
  const svgWidth = 800;
  const svgHeight = 420;
  const padding = 60;

  const project = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / lngSpan) * (svgWidth - padding * 2);
    // Invert Y because SVG coordinates go down, whereas latitude goes up
    const y = svgHeight - (padding + ((lat - minLat) / latSpan) * (svgHeight - padding * 2));
    return [x, y];
  };

  const pathD = points
    .map((p, idx) => {
      const [x, y] = project(p[0], p[1]);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const [originX, originY] = project(plan.origin.coordinates.lat, plan.origin.coordinates.lng);
  const [destX, destY] = project(plan.destination.coordinates.lat, plan.destination.coordinates.lng);

  return (
    <div
      style={{
        borderRadius: '14px',
        backgroundColor: '#05070a',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Map Header Toolbar */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(9, 13, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
            Interactive Highway Corridor & Charging Nodes
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              fontWeight: 600,
            }}
          >
            {plan.routePolylinePoints.length} GPS Waypoints
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {plan.energySummary.totalDistanceKm} km • ~{Math.floor(plan.energySummary.totalDrivingMinutes / 60)}h{' '}
            {plan.energySummary.totalDrivingMinutes % 60}m
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div
        style={{
          position: 'relative',
          height: isExpanded ? '540px' : '360px',
          width: '100%',
          backgroundColor: '#040608',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle grid backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 70%),
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            pointerEvents: 'none',
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="routeGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <filter id="neonRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Glow Line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(0, 240, 255, 0.2)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Primary Route Highway Polyline */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGlowGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonRouteGlow)"
          />

          {/* Origin Marker */}
          <g transform={`translate(${originX}, ${originY})`}>
            <circle r="14" fill="rgba(0, 240, 255, 0.2)" />
            <circle r="7" fill="#00f0ff" stroke="#040608" strokeWidth="2" />
            <text
              y="-16"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              fontFamily="var(--font-sans)"
            >
              {plan.origin.name} (Start)
            </text>
          </g>

          {/* Destination Marker */}
          <g transform={`translate(${destX}, ${destY})`}>
            <circle r="14" fill="rgba(16, 185, 129, 0.2)" />
            <circle r="7" fill="#10b981" stroke="#040608" strokeWidth="2" />
            <text
              y="-16"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              fontFamily="var(--font-sans)"
            >
              {plan.destination.name} (Goal)
            </text>
          </g>

          {/* Charging Stops Nodes */}
          {plan.chargingStops.map((stop, idx) => {
            const [stopX, stopY] = project(
              stop.station.coordinates.lat,
              stop.station.coordinates.lng
            );
            const isSelected = selectedStopId === stop.id;

            return (
              <g
                key={stop.id}
                transform={`translate(${stopX}, ${stopY})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectStop && onSelectStop(stop)}
                onMouseEnter={() => setHoveredStop(stop)}
                onMouseLeave={() => setHoveredStop(null)}
              >
                <circle
                  r={isSelected ? '22' : '16'}
                  fill={isSelected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.15)'}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                />
                <circle r="10" fill="#f59e0b" stroke="#040608" strokeWidth="2" />
                <text
                  textAnchor="middle"
                  dy="3.5"
                  fill="#040608"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="var(--font-mono)"
                >
                  {idx + 1}
                </text>

                {/* Station Tag */}
                <text
                  y="24"
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-sans)"
                >
                  {stop.station.city} ({stop.effectiveChargingPowerKw} kW)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Station Hover / Info Card */}
        {hoveredStop && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(10, 15, 24, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
              maxWidth: '320px',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Zap size={15} color="#f59e0b" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                Stop {hoveredStop.stopSequenceIndex}: {hoveredStop.station.name}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              {hoveredStop.station.operator} • {hoveredStop.station.city}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '0.35rem',
              }}
            >
              <span>Arrive: <strong style={{ color: '#ffffff' }}>{hoveredStop.arrivalSoC}%</strong></span>
              <span>➔ Depart: <strong style={{ color: '#10b981' }}>{hoveredStop.departureSoC}%</strong></span>
              <span>Time: <strong style={{ color: 'var(--accent-cyan)' }}>{hoveredStop.chargingDurationMinutes}m</strong></span>
            </div>
          </div>
        )}

        {/* Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            backgroundColor: 'rgba(5, 8, 14, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00f0ff' }} />
            <span>Origin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>Charging Stop</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Destination</span>
          </div>
        </div>
      </div>

      {/* Battery State-of-Charge (SoC) Trajectory Profile Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(7, 10, 16, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <BatteryCharging size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
              Battery State-of-Charge (SoC) Trajectory
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Start: <strong style={{ color: '#ffffff' }}>{plan.preferences.startingSoC}%</strong> • Reserve Buffer:{' '}
            <strong style={{ color: 'var(--accent-cyan)' }}>{plan.preferences.desiredArrivalSoC}%</strong>
          </span>
        </div>

        {/* Visual Multi-Segment SoC Progression Bar */}
        <div
          style={{
            height: '14px',
            borderRadius: '7px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative',
          }}
        >
          {plan.chargingStops.length === 0 ? (
            <div
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #00f0ff 0%, #10b981 100%)',
                height: '100%',
              }}
            />
          ) : (
            plan.chargingStops.map((stop, sIdx) => (
              <React.Fragment key={stop.id}>
                {/* Leg Depletion */}
                <div
                  style={{
                    flex: stop.distanceFromPreviousStopKm,
                    background: 'linear-gradient(90deg, #00f0ff 0%, #f59e0b 100%)',
                    height: '100%',
                    position: 'relative',
                  }}
                  title={`Leg ${sIdx + 1}: ${stop.distanceFromPreviousStopKm} km to ${stop.station.city}`}
                />
                {/* Charging Replenishment Divider */}
                <div
                  style={{
                    width: '6px',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    zIndex: 2,
                  }}
                  title={`Fast Charge +${stop.energyAddedKwh} kWh (${stop.chargingDurationMinutes}m)`}
                />
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
