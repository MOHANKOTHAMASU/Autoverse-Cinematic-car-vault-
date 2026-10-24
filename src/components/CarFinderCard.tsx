import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ScoredVehicle } from '../utils/carFinder';
import { getVehicleSeatingCapacity } from '../utils/carFinder';
import { CarImage } from './CarImage';
import {
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Bookmark,
  Check,
  AlertTriangle,
  Calculator,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface CarFinderCardProps {
  scored: ScoredVehicle;
  onToggleSave: (vehicleSlug: string) => void;
  isSaved: boolean;
  onAddToCompare: (vehicleSlug: string) => void;
  onViewSimilar: (brand: string, bodyType: string) => void;
}

export const CarFinderCard: React.FC<CarFinderCardProps> = ({
  scored,
  onToggleSave,
  isSaved,
  onAddToCompare,
  onViewSimilar,
}) => {
  const navigate = useNavigate();
  const { vehicle, score, matchExplanation, isRelaxedMatch } = scored;
  const slug = vehicle.slug || vehicle.id;

  // 360-Degree Multi-Angle Photography System
  const gallery = Array.isArray(vehicle.imageGallery) && vehicle.imageGallery.length >= 4
    ? vehicle.imageGallery
    : [
        vehicle.heroImage || vehicle.thumbnail,
        vehicle.sideImage || vehicle.heroImage || vehicle.thumbnail,
        vehicle.heroImage || vehicle.thumbnail,
        vehicle.interiorImage || vehicle.heroImage || vehicle.thumbnail,
      ];

  const angleOptions = [
    { label: '0° Front', title: 'Front 3/4', img: gallery[0] || vehicle.heroImage },
    { label: '90° Side', title: 'Side Profile', img: gallery[1] || vehicle.sideImage || gallery[0] },
    { label: '180° Rear', title: 'Rear 3/4', img: gallery[2] || gallery[0] },
    { label: 'Cabin', title: 'Interior Cockpit', img: gallery[3] || vehicle.interiorImage || gallery[0] },
  ];

  const [angleIndex, setAngleIndex] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // Auto-Spin Turntable Animation
  useEffect(() => {
    if (!isAutoSpinning) return;
    const interval = setInterval(() => {
      setAngleIndex((prev) => (prev + 1) % angleOptions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoSpinning, angleOptions.length]);

  const handlePrevAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoSpinning(false);
    setAngleIndex((prev) => (prev - 1 + angleOptions.length) % angleOptions.length);
  };

  const handleNextAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoSpinning(false);
    setAngleIndex((prev) => (prev + 1) % angleOptions.length);
  };

  const handleSelectAngle = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setIsAutoSpinning(false);
    setAngleIndex(idx);
  };

  const handleToggleSpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoSpinning((prev) => !prev);
  };

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const seats = getVehicleSeatingCapacity(vehicle);
  const hp = vehicle.horsepower || vehicle.specs?.horsepower || 0;
  const accel = vehicle.accelerationSeconds || vehicle.specs?.acceleration0to60 || 0;
  const range = vehicle.electricRangeMiles || vehicle.specs?.electricRangeMiles || (vehicle.electricRangeKm ? Math.round(vehicle.electricRangeKm * 0.621371) : null);
  const mpg = vehicle.efficiencyDetails?.fuelEconomyMpgCombined;

  // Determine score color
  const getScoreColor = (sc: number) => {
    if (sc >= 85) return '#10b981'; // Emerald
    if (sc >= 70) return 'var(--accent-cyan)'; // Cyan
    if (sc >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Rose
  };

  const scoreColor = getScoreColor(score);

  return (
    <article
      className="card-glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: isRelaxedMatch ? '1px dashed rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
        backgroundColor: 'rgba(10, 14, 22, 0.9)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
        position: 'relative',
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Exterior Image Container with 360-Degree Controls */}
      <div
        style={{
          position: 'relative',
          height: '240px',
          backgroundColor: '#07090d',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => navigate(`/cars/${slug}`)}
      >
        <CarImage
          src={angleOptions[angleIndex].img}
          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.variant} - ${angleOptions[angleIndex].title}`}
          manufacturer={vehicle.brand}
          style={{
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
        />

        {/* Ambient Top & Bottom Shadow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(7, 9, 13, 0.75) 0%, transparent 45%, rgba(7, 9, 13, 0.92) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges: Match % and Active 360° Angle HUD */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(7, 9, 13, 0.88)',
              border: `1px solid ${scoreColor}`,
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={13} color={scoreColor} />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: scoreColor, letterSpacing: '0.04em' }}>
              {score}% MATCH
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(7, 9, 13, 0.88)',
              border: isAutoSpinning ? '1px solid #10b981' : '1px solid rgba(0, 240, 255, 0.35)',
              padding: '0.35rem 0.65rem',
              borderRadius: '999px',
              backdropFilter: 'blur(8px)',
              color: isAutoSpinning ? '#10b981' : 'var(--accent-cyan)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            <RotateCw size={11} style={{ animation: isAutoSpinning ? 'spin 2s linear infinite' : 'none' }} />
            <span>360° {angleOptions[angleIndex].title.toUpperCase()}</span>
          </div>
        </div>

        {/* Left & Right Chevrons to Step Through Angles */}
        <button
          onClick={handlePrevAngle}
          title="Previous Angle"
          style={{
            position: 'absolute',
            left: '0.65rem',
            top: '48%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(7, 9, 13, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(7, 9, 13, 0.75)')}
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={handleNextAngle}
          title="Next Angle"
          style={{
            position: 'absolute',
            right: '0.65rem',
            top: '48%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(7, 9, 13, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(7, 9, 13, 0.75)')}
        >
          <ChevronRight size={16} />
        </button>

        {/* Interactive 360° Angle Switcher Pill Bar & Turntable Toggle */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '0.85rem',
            right: '0.85rem',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          {angleOptions.map((opt, idx) => (
            <button
              key={opt.label}
              onClick={(e) => handleSelectAngle(e, idx)}
              style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                border: angleIndex === idx ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: angleIndex === idx ? 'rgba(0, 240, 255, 0.25)' : 'rgba(7, 9, 13, 0.8)',
                color: angleIndex === idx ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          ))}

          {/* 360° Turntable Auto-Spin Button */}
          <button
            onClick={handleToggleSpin}
            title={isAutoSpinning ? 'Pause 360° Auto-Spin' : 'Start 360° Turntable Auto-Spin'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.64rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              border: isAutoSpinning ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.25)',
              backgroundColor: isAutoSpinning ? 'rgba(16, 185, 129, 0.25)' : 'rgba(7, 9, 13, 0.85)',
              color: isAutoSpinning ? '#10b981' : '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.15s ease',
            }}
          >
            {isAutoSpinning ? <Pause size={10} /> : <Play size={10} />}
            <span>360° SPIN</span>
          </button>
        </div>

        {/* Action Pills Top Right: Save to Garage & Compare */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCompare(slug);
            }}
            title="Add to Side-by-Side Comparison"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(7, 9, 13, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            <ArrowLeftRight size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(slug);
            }}
            title={isSaved ? 'Remove from My Garage' : 'Save to My Garage'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isSaved ? 'var(--accent-cyan)' : 'rgba(7, 9, 13, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: isSaved ? '#07090d' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Bottom Tagline on Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '1rem',
            right: '1rem',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {vehicle.brand || vehicle.manufacturerName}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(7, 9, 13, 0.75)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textTransform: 'uppercase',
            }}
          >
            {vehicle.powertrain}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title and Model */}
        <div style={{ marginBottom: '0.75rem' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.3,
            }}
          >
            <Link
              to={`/cars/${slug}`}
              style={{ color: '#ffffff', textDecoration: 'none' }}
              className="hover-cyan"
            >
              {vehicle.model}
            </Link>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
            {vehicle.variant} • {vehicle.modelYear || vehicle.year}
          </span>
        </div>

        {/* Price and Market */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.85rem',
          }}
        >
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {formatPrice(vehicle.price || vehicle.priceStartingUsd, vehicle.currency || 'USD')}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              {vehicle.price ? 'Verified Ex-Factory' : 'Estimated Base'}
            </span>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {vehicle.market || 'Global Spec'}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.6rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              padding: '0.45rem',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Power
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
              {hp ? `${hp} HP` : 'N/A'}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              padding: '0.45rem',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              0–60 MPH
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
              {accel ? `${accel}s` : 'N/A'}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              padding: '0.45rem',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              {vehicle.powertrain === 'electric' ? 'EV Range' : (mpg ? 'Fuel Economy' : 'Seating')}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
              {vehicle.powertrain === 'electric'
                ? (range ? `${range} mi` : 'WLTP est.')
                : (mpg ? `${mpg} MPG` : `${seats} Seats`)}
            </span>
          </div>
        </div>

        {/* Why This Matches Explanation Section */}
        <div
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.04)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <Sparkles size={12} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Why It Matches
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
            {matchExplanation.primaryReason}
          </p>

          {/* Matched Criteria Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {matchExplanation.matchedCriteria.map((c, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.68rem',
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Check size={10} />
                {c}
              </span>
            ))}
          </div>

          {/* Trade-Offs / Missing Data Warnings */}
          {matchExplanation.tradeOffs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
              {matchExplanation.tradeOffs.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.66rem',
                    color: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <AlertTriangle size={10} />
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/cars/${slug}`}
            className="btn btn-primary"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.55rem 0.75rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
            }}
          >
            View Details
            <ArrowRight size={14} />
          </Link>

          <Link
            to={`/ownership-calculator?vehicle=${slug}`}
            style={{
              padding: '0.55rem 0.65rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            title="Calculate EMI, On-Road Price & 5-Year Ownership Costs"
          >
            <Calculator size={13} />
            <span>TCO</span>
          </Link>

          <button
            onClick={() => onViewSimilar(vehicle.brand, vehicle.bodyType)}
            style={{
              padding: '0.55rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Filter by similar brand and body style"
          >
            Similar
          </button>
        </div>
      </div>
    </article>
  );
};
