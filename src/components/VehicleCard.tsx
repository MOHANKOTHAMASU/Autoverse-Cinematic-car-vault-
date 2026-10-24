import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Vehicle } from '../types';
import { CarImage } from './CarImage';
import {
  ArrowUpRight,
  ArrowLeftRight,
  Bookmark,
  ShieldCheck,
  Info,
  SlidersHorizontal,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onOpenSpecs?: (vehicle: Vehicle) => void;
  onToggleSave?: (vehicle: Vehicle) => void;
  isSaved?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onOpenSpecs,
  onToggleSave,
  isSaved = false,
}) => {
  const navigate = useNavigate();
  const slug = vehicle.slug || vehicle.id;

  // 360-Degree Multi-Angle System
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
    { label: 'Cabin', title: 'Cockpit', img: gallery[3] || vehicle.interiorImage || gallery[0] },
  ];

  const [angleIndex, setAngleIndex] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

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

  const handleCardClick = () => {
    navigate(`/cars/${slug}`);
  };

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return 'Price Verified on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article
      className="card-glass vehicle-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
      tabIndex={0}
      role="link"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Explore ${vehicle.brand} ${vehicle.model} ${vehicle.variant}`}
    >
      {/* Exterior Image Container with 360-Degree Controls */}
      <div
        style={{
          position: 'relative',
          height: '240px',
          overflow: 'hidden',
          backgroundColor: '#0a0d14',
        }}
      >
        <CarImage
          src={angleOptions[angleIndex].img}
          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.variant} - ${angleOptions[angleIndex].title}`}
          manufacturer={vehicle.brand}
          style={{
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
        />

        {/* Ambient Top Shadow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(7, 9, 13, 0.6) 0%, transparent 40%, rgba(7, 9, 13, 0.85) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className="badge badge-cyan">
              <ShieldCheck size={11} />
              {vehicle.modelYear || vehicle.year} VERIFIED
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'rgba(7, 9, 13, 0.88)',
                border: isAutoSpinning ? '1px solid #10b981' : '1px solid rgba(0, 240, 255, 0.35)',
                padding: '0.25rem 0.55rem',
                borderRadius: '999px',
                color: isAutoSpinning ? '#10b981' : 'var(--accent-cyan)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              <RotateCw size={10} style={{ animation: isAutoSpinning ? 'spin 2s linear infinite' : 'none' }} />
              <span>360° {angleOptions[angleIndex].title.toUpperCase()}</span>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(vehicle);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: isSaved
                  ? 'var(--accent-cyan)'
                  : 'rgba(7, 9, 13, 0.75)',
                color: isSaved ? '#07090d' : '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title={isSaved ? 'Saved to Garage' : 'Save to Garage'}
              aria-label={`Save ${vehicle.model} to garage`}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
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

        {/* Manufacturer & Body Style / Powertrain Badges */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {vehicle.brand || vehicle.manufacturerName}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(7, 9, 13, 0.8)',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                textTransform: 'uppercase',
              }}
            >
              {vehicle.bodyType || 'Sedan'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                padding: '0.15rem 0.45rem',
                borderRadius: '3px',
                textTransform: 'uppercase',
              }}
            >
              {vehicle.powertrain || vehicle.category}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '0.2rem',
            }}
          >
            {vehicle.model || vehicle.name}{' '}
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {vehicle.variant}
            </span>
          </h3>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
            }}
          >
            {vehicle.generation || vehicle.tagline}
          </div>
        </div>

        {/* Meaningful Performance Specs Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.4rem',
            padding: '0.75rem 0.5rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
            marginTop: 'auto',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                marginBottom: '2px',
              }}
            >
              0–60 MPH
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {vehicle.accelerationSeconds || vehicle.specs?.acceleration0to60
                ? `${vehicle.accelerationSeconds || vehicle.specs.acceleration0to60}s`
                : 'Not available'}
            </span>
          </div>

          <div
            style={{
              textAlign: 'center',
              borderLeft: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                marginBottom: '2px',
              }}
            >
              POWER
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {vehicle.horsepower || vehicle.specs?.horsepower
                ? `${vehicle.horsepower || vehicle.specs.horsepower} HP`
                : 'Not available'}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                marginBottom: '2px',
              }}
            >
              {vehicle.electricRangeMiles || vehicle.specs?.electricRangeMiles ? 'RANGE' : 'TOP SPEED'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {vehicle.electricRangeMiles || vehicle.specs?.electricRangeMiles
                ? `${vehicle.electricRangeMiles || vehicle.specs.electricRangeMiles} mi`
                : vehicle.topSpeedMph || vehicle.specs?.topSpeedMph
                ? `${vehicle.topSpeedMph || vehicle.specs.topSpeedMph} MPH`
                : 'Not available'}
            </span>
          </div>
        </div>

        {/* Verified Market Price */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1rem',
            paddingTop: '0.25rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            MSRP ({vehicle.currency || 'USD'})
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: vehicle.price || vehicle.priceStartingUsd ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            }}
          >
            {formatPrice(vehicle.price || vehicle.priceStartingUsd, vehicle.currency)}
          </span>
        </div>

        {/* Card Actions (Explore Vehicle, Specs & Compare) */}
        <div style={{ display: 'grid', gridTemplateColumns: onOpenSpecs ? '1fr auto auto auto' : '1fr auto auto', gap: '0.45rem' }}>
          <Link
            to={`/cars/${slug}`}
            className="btn btn-primary"
            style={{
              fontSize: '0.78rem',
              padding: '0.65rem 0.75rem',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Explore</span>
            <ArrowUpRight size={14} />
          </Link>

          <Link
            to={`/configurator/${slug}`}
            className="btn btn-secondary"
            style={{
              padding: '0.65rem 0.75rem',
              borderColor: 'rgba(0, 240, 255, 0.35)',
            }}
            title={`Configure ${vehicle.brand} ${vehicle.model} in 3D Studio`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Configure ${vehicle.model} in 3D Studio`}
          >
            <SlidersHorizontal size={14} color="var(--accent-cyan)" />
          </Link>

          {onOpenSpecs && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSpecs(vehicle);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 0.75rem' }}
              title="Inspect Quick Specifications"
              aria-label="Inspect Quick Specifications"
            >
              <Info size={14} />
            </button>
          )}

          <Link
            to={`/compare?a=${slug}`}
            className="btn btn-secondary"
            style={{
              padding: '0.65rem 0.75rem',
            }}
            title={`Compare ${vehicle.model} against another machine`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Compare ${vehicle.model}`}
          >
            <ArrowLeftRight size={14} color="var(--accent-cyan)" />
          </Link>
        </div>
      </div>
    </article>
  );
};
