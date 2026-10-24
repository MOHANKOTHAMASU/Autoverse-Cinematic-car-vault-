import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import type { Vehicle } from '../types';

interface PorscheDramaticRevealProps {
  vehicle: Vehicle;
}

export const PorscheDramaticReveal: React.FC<PorscheDramaticRevealProps> = ({ vehicle }) => {
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [viewAngle, setViewAngle] = useState<'front' | 'side'>('front');
  const [isRevealed, setIsRevealed] = useState(false);

  // Auto trigger dramatic ignition after brief delay on initial load
  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 400);

    const headlightTimer = setTimeout(() => {
      setHeadlightsOn(true);
    }, 1200);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(headlightTimer);
    };
  }, []);

  const frontImage = vehicle.imageGallery?.[0] || vehicle.heroImage;
  const sideImage = vehicle.sideImage || vehicle.imageGallery?.[1] || vehicle.heroImage;
  const activeImage = viewAngle === 'front' ? frontImage : sideImage;

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '580px',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#04060a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '3rem',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Dark Ambient Dramatic Stage with Floor Grid & Spotlights */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(6, 182, 212, 0.12) 0%, rgba(4, 6, 10, 0.95) 70%, #04060a 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Perspective Floor Grid */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '240px',
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(600px) rotateX(65deg)',
          transformOrigin: 'bottom center',
          opacity: isRevealed ? 0.6 : 0.2,
          transition: 'opacity 1s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Car Visual Stage */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          minHeight: '420px',
        }}
      >
        {/* Silhouette / Illumination Transition */}
        <div
          style={{
            position: 'relative',
            maxWidth: '920px',
            width: '100%',
            aspectRatio: '16 / 9',
            maxHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={activeImage}
            alt={`${vehicle.brand} ${vehicle.model} Dramatic Reveal`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isRevealed
                ? headlightsOn
                  ? 'brightness(1.05) contrast(1.1) drop-shadow(0 20px 40px rgba(0,0,0,0.9))'
                  : 'brightness(0.35) contrast(1.4) drop-shadow(0 15px 30px rgba(0,0,0,0.9))'
                : 'brightness(0.08) contrast(2.0)',
              transition: 'filter 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ease',
              transform: viewAngle === 'front' ? 'scale(1)' : 'scale(1.02) translateX(-5px)',
            }}
          />

          {/* Matrix LED 4-Point Headlight Beams Glow Overlay */}
          {headlightsOn && viewAngle === 'front' && (
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '26%',
                right: '26%',
                height: '40px',
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {/* Left 4-Point Matrix LED cluster glow */}
              <div
                style={{
                  width: '70px',
                  height: '35px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(220, 245, 255, 0.95) 10%, rgba(6, 182, 212, 0.7) 45%, transparent 75%)',
                  filter: 'blur(4px)',
                  boxShadow: '0 0 35px rgba(6, 182, 212, 0.9), -20px -10px 50px rgba(255, 255, 255, 0.6)',
                  animation: 'pulse 3s infinite alternate',
                }}
              />
              {/* Right 4-Point Matrix LED cluster glow */}
              <div
                style={{
                  width: '70px',
                  height: '35px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(220, 245, 255, 0.95) 10%, rgba(6, 182, 212, 0.7) 45%, transparent 75%)',
                  filter: 'blur(4px)',
                  boxShadow: '0 0 35px rgba(6, 182, 212, 0.9), 20px -10px 50px rgba(255, 255, 255, 0.6)',
                  animation: 'pulse 3s infinite alternate',
                }}
              />
            </div>
          )}

          {/* Floor Reflection Gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '10%',
              right: '10%',
              height: '30px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Interactive Controls & Scene Selection Bar */}
      <div
        style={{
          position: 'relative',
          padding: '1.25rem 2rem',
          backgroundColor: 'rgba(8, 12, 18, 0.85)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 2,
        }}
      >
        {/* Left: Dramatic Mode Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setHeadlightsOn(!headlightsOn)}
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '6px',
              backgroundColor: headlightsOn ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${headlightsOn ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)'}`,
              color: headlightsOn ? 'var(--accent-cyan)' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={14} />
            <span>{headlightsOn ? 'Matrix LEDs Active' : 'Illuminate Headlights'}</span>
          </button>

          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
            <button
              onClick={() => setViewAngle('front')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: viewAngle === 'front' ? 700 : 500,
                backgroundColor: viewAngle === 'front' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.4)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Front 3/4
            </button>
            <button
              onClick={() => setViewAngle('side')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: viewAngle === 'side' ? 700 : 500,
                backgroundColor: viewAngle === 'side' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.4)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Right: Key Verified Specification Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Output</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
              {vehicle.horsepower}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>HP</span>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>0–60</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              {vehicle.accelerationSeconds}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>SEC</span>
          </div>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Architecture</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
              {vehicle.specs?.voltageArchitecture ? '800V DC' : 'Verified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
