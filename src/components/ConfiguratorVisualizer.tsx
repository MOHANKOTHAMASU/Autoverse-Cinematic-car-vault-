// AutoVerse Bespoke Studio 3D Dynamic Visualizer
// Real-time camera angles (Front 3/4, Left Side, Right Side, Rear 3/4 Back View, Cockpit),
// dynamic paintwork shader color transformations, studio lighting atmospheres, and optics.

import React, { useState } from 'react';
import type { Vehicle } from '../types';
import type {
  VehicleConfigProfile,
  ActiveConfigurationState,
  PaintOption,
  WheelOption,
  InteriorOption,
} from '../data/configuratorData';
import {
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Zap,
  Sparkles,
} from 'lucide-react';

interface ConfiguratorVisualizerProps {
  vehicle: Vehicle;
  profile: VehicleConfigProfile;
  activeState: ActiveConfigurationState;
  selectedPaint: PaintOption;
  selectedWheel: WheelOption;
  selectedInterior: InteriorOption;
}

export type StudioLightingMode = 'studio' | 'golden_hour' | 'midnight_neon';
export type CameraAngle =
  | 'front_34'
  | 'side_profile'
  | 'side_left'
  | 'side_right'
  | 'rear_34'
  | 'cockpit_interior';

export const ConfiguratorVisualizer: React.FC<ConfiguratorVisualizerProps> = ({
  vehicle,
  profile,
  activeState: _activeState,
  selectedPaint,
  selectedWheel,
  selectedInterior,
}) => {
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front_34');
  const [lightingMode, setLightingMode] = useState<StudioLightingMode>('studio');
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Background lighting moods
  const getLightingStyles = () => {
    switch (lightingMode) {
      case 'golden_hour':
        return {
          spotlight1: 'radial-gradient(circle at 25% 20%, rgba(245, 158, 11, 0.28) 0%, transparent 60%)',
          spotlight2: 'radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.18) 0%, transparent 55%)',
          rimColor: 'rgba(251, 191, 36, 0.45)',
          floorGrid: 'rgba(245, 158, 11, 0.12)',
        };
      case 'midnight_neon':
        return {
          spotlight1: 'radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.32) 0%, transparent 55%)',
          spotlight2: 'radial-gradient(circle at 85% 70%, rgba(139, 92, 246, 0.28) 0%, transparent 60%)',
          rimColor: 'rgba(6, 182, 212, 0.75)',
          floorGrid: 'rgba(6, 182, 212, 0.14)',
        };
      case 'studio':
      default:
        return {
          spotlight1: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)',
          spotlight2: 'radial-gradient(circle at 50% 90%, rgba(6, 182, 212, 0.14) 0%, transparent 65%)',
          rimColor: 'rgba(255, 255, 255, 0.3)',
          floorGrid: 'rgba(255, 255, 255, 0.07)',
        };
    }
  };

  const lighting = getLightingStyles();

  // Dynamic image resolution by perspective
  const getImageForAngle = () => {
    switch (cameraAngle) {
      case 'side_profile':
      case 'side_left':
      case 'side_right':
        return vehicle.sideImage || vehicle.heroImage;
      case 'rear_34':
        return (vehicle.imageGallery && vehicle.imageGallery[1]) || vehicle.heroImage;
      case 'cockpit_interior':
        return (
          vehicle.interiorImage ||
          (vehicle.imageGallery && vehicle.imageGallery[2]) ||
          vehicle.heroImage
        );
      case 'front_34':
      default:
        return vehicle.heroImage;
    }
  };

  const activeImage = getImageForAngle();

  // Compute realistic color grading matrix and filter styles based on selected paint
  const getDynamicPaintFilter = () => {
    if (cameraAngle === 'cockpit_interior') {
      return 'none';
    }

    const family = selectedPaint.colorFamily;
    const nameLower = selectedPaint.name.toLowerCase();

    // Black / Jet Black / Dark
    if (family === 'black' || nameLower.includes('black') || nameLower.includes('shadow')) {
      return 'grayscale(100%) brightness(0.28) contrast(150%)';
    }
    // White / Carrara White
    if (family === 'white' || nameLower.includes('white')) {
      return 'grayscale(100%) brightness(1.42) contrast(110%)';
    }
    // Grey / Volcano / Silver
    if (family === 'grey' || family === 'silver' || nameLower.includes('grey') || nameLower.includes('silver')) {
      return 'grayscale(100%) brightness(0.68) contrast(125%)';
    }
    // Red / Carmine
    if (family === 'red' || nameLower.includes('red') || nameLower.includes('carmine') || nameLower.includes('crimson')) {
      return 'hue-rotate(145deg) saturate(240%) brightness(88%)';
    }
    // Green / Mamba / Oak
    if (family === 'green' || nameLower.includes('green') || nameLower.includes('mamba') || nameLower.includes('oak')) {
      return 'hue-rotate(245deg) saturate(185%) brightness(82%)';
    }
    // Yellow / Gold
    if (family === 'yellow' || nameLower.includes('yellow') || nameLower.includes('gold')) {
      return 'hue-rotate(185deg) saturate(230%) brightness(125%)';
    }
    // Blue / Gentian / Frozen
    if (family === 'blue' || nameLower.includes('blue')) {
      if (nameLower.includes('frozen') || nameLower.includes('ice')) {
        return 'hue-rotate(-12deg) saturate(110%) brightness(115%)';
      }
      return 'hue-rotate(0deg) saturate(160%) brightness(90%)';
    }

    // Default metallic enhancer
    return 'saturate(130%) contrast(110%)';
  };

  // Flip horizontally for right side profile
  const isFlippedHorizontal = cameraAngle === 'side_right';

  return (
    <div
      className="configurator-studio-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '460px',
        backgroundColor: '#05070a',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Dynamic Ambient Spotlights */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `${lighting.spotlight1}, ${lighting.spotlight2}`,
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
          zIndex: 1,
        }}
      />

      {/* Perspective Studio Floor Grid */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48%',
          backgroundImage: `linear-gradient(${lighting.floorGrid} 1px, transparent 1px), linear-gradient(90deg, ${lighting.floorGrid} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(450px) rotateX(68deg)',
          transformOrigin: 'bottom center',
          opacity: 0.9,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Dynamic Floor Shadow & Vehicle Reflection */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '12%',
          right: '12%',
          height: '32px',
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.92) 0%, rgba(0,0,0,0) 72%)',
          filter: 'blur(10px)',
          zIndex: 2,
        }}
      />

      {/* Main Studio Viewport */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          zIndex: 3,
        }}
      >
        {/* Center Vehicle Image Container */}
        <div
          style={{
            position: 'relative',
            width: isZoomed ? '95%' : '86%',
            maxWidth: '840px',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            transform: `${isZoomed ? 'scale(1.14)' : 'scale(1.0)'} ${
              isFlippedHorizontal ? 'scaleX(-1)' : ''
            }`,
          }}
        >
          {/* Base Vehicle Canvas / Image with Dynamic Color Grading */}
          <img
            key={`${vehicle.slug}-${cameraAngle}`}
            src={activeImage}
            alt={`${vehicle.brand} ${vehicle.model} - ${cameraAngle} in ${selectedPaint.name}`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '390px',
              objectFit: 'contain',
              display: 'block',
              filter: `${getDynamicPaintFilter()} drop-shadow(0 20px 32px rgba(0,0,0,0.75))`,
              transition: 'filter 0.4s ease, transform 0.3s ease, opacity 0.3s ease',
              animation: 'fadeIn 0.35s ease-out',
            }}
          />

          {/* Dynamic Paint Tint Overlay (Enhances deep color tone onto exterior surfaces) */}
          {cameraAngle !== 'cockpit_interior' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: selectedPaint.hex,
                opacity: selectedPaint.finish === 'Matte' ? 0.32 : 0.22,
                mixBlendMode: 'color',
                pointerEvents: 'none',
                transition: 'background-color 0.35s ease, opacity 0.35s ease',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 15%, rgba(0,0,0,0.85) 75%, transparent 95%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 15%, rgba(0,0,0,0.85) 75%, transparent 95%)',
              }}
            />
          )}

          {/* Specular Metallic Luster Coat (Metallic / Special finishes) */}
          {cameraAngle !== 'cockpit_interior' &&
            (selectedPaint.finish === 'Metallic' || selectedPaint.finish === 'Special') && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.15) 60%, transparent 100%)',
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                  opacity: 0.6,
                }}
              />
            )}

          {/* Cockpit Interior Ambient Glow */}
          {cameraAngle === 'cockpit_interior' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 50%, ${selectedInterior.ambientLightDefaultHex}30 0%, transparent 70%)`,
                pointerEvents: 'none',
                mixBlendMode: 'screen',
                transition: 'background 0.4s ease',
              }}
            />
          )}

          {/* Headlights / Matrix LED Beam Flare */}
          {headlightsOn && cameraAngle === 'front_34' && (
            <div
              style={{
                position: 'absolute',
                bottom: '38%',
                left: '12%',
                width: '140px',
                height: '50px',
                background:
                  'radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(6, 182, 212, 0.45) 40%, transparent 80%)',
                filter: 'blur(10px)',
                pointerEvents: 'none',
                transform: 'rotate(-12deg)',
              }}
            />
          )}
        </div>

        {/* Top-Left Telemetry Badges */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(7, 9, 13, 0.9)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {profile.isFullyCustomizable ? 'Bespoke Studio 3D' : 'Configurator Preview'}
          </span>

          {/* Live Selected Color Swatch Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(7, 9, 13, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: selectedPaint.hex,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `0 0 8px ${selectedPaint.hex}80`,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ffffff' }}>
              {selectedPaint.name}
            </span>
            <span
              style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
              }}
            >
              {selectedPaint.finish}
            </span>
          </div>
        </div>

        {/* Top-Right Studio Quick Toggles */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Lighting Mode Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(7, 9, 13, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '0.2rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <button
              onClick={() => setLightingMode('studio')}
              style={{
                background: lightingMode === 'studio' ? 'rgba(255, 255, 255, 0.18)' : 'none',
                border: 'none',
                color: lightingMode === 'studio' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '0.3rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Clean Studio White Lighting"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setLightingMode('golden_hour')}
              style={{
                background: lightingMode === 'golden_hour' ? 'rgba(245, 158, 11, 0.28)' : 'none',
                border: 'none',
                color: lightingMode === 'golden_hour' ? '#f59e0b' : 'var(--text-muted)',
                padding: '0.3rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Sunset Golden Hour Ambient"
            >
              <Sparkles size={14} />
            </button>
            <button
              onClick={() => setLightingMode('midnight_neon')}
              style={{
                background: lightingMode === 'midnight_neon' ? 'rgba(6, 182, 212, 0.28)' : 'none',
                border: 'none',
                color: lightingMode === 'midnight_neon' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '0.3rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Midnight Cyber Neon"
            >
              <Moon size={14} />
            </button>
          </div>

          {/* Headlights Toggle */}
          <button
            onClick={() => setHeadlightsOn(!headlightsOn)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: headlightsOn ? 'rgba(6, 182, 212, 0.25)' : 'rgba(7, 9, 13, 0.9)',
              border: `1px solid ${headlightsOn ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.12)'}`,
              color: headlightsOn ? 'var(--accent-cyan)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={headlightsOn ? 'Turn Matrix Headlights Off' : 'Turn Matrix Headlights On'}
          >
            <Zap size={14} />
          </button>

          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(7, 9, 13, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: isZoomed ? 'var(--accent-cyan)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isZoomed ? 'Reset Studio Zoom' : 'Zoom 1.25x Detail'}
          >
            {isZoomed ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {/* Bottom Center Dynamic Camera Angle Bar (Front 3/4, Left Side, Right Side, Rear 3/4 Back View, Cockpit) */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(7, 9, 13, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '0.35rem',
            borderRadius: '999px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
            maxWidth: '95%',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'front_34', label: 'Front 3/4' },
            { id: 'side_left', label: 'Side Left' },
            { id: 'side_right', label: 'Side Right' },
            { id: 'rear_34', label: 'Rear / Back' },
            { id: 'cockpit_interior', label: 'Cockpit Interior' },
          ].map((angle) => (
            <button
              key={angle.id}
              onClick={() => setCameraAngle(angle.id as CameraAngle)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: cameraAngle === angle.id ? 'var(--accent-cyan)' : 'transparent',
                color: cameraAngle === angle.id ? '#07090d' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {angle.label}
            </button>
          ))}
        </div>
      </div>

      {/* Studio Footer Specs Bar */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(7, 9, 13, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          zIndex: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Mounted Wheels:</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
            {selectedWheel.name} ({selectedWheel.sizeInches}")
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Interior Theme:</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
            {selectedInterior.name}
          </span>
        </div>
      </div>
    </div>
  );
};
