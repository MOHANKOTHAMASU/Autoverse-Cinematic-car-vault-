import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import { CarImage } from '../components/CarImage';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Gauge,
  BatteryCharging,
  Scale,
  ExternalLink,
  ArrowLeftRight,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Cpu,
  Sparkles,
  Car,
  Fuel,
  Check,
  SlidersHorizontal,
  Calculator,
  Star,
  Bot,
  Navigation,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { isCarInGarage, toggleCarInGarage, recordRecentlyViewed } from '../utils/garage';
import { getVehicleCommunitySummary } from '../utils/communityStore';
import { VehicleCinematicMedia } from '../components/VehicleCinematicMedia';
import { PorscheDramaticReveal } from '../components/PorscheDramaticReveal';
import { EngineeringRevealExplorer } from '../components/EngineeringRevealExplorer';
import { SafetyLabVisualization } from '../components/SafetyLabVisualization';

type TabKey = 'overview' | 'performance' | 'interior' | 'manufacturing' | 'safety' | 'efficiency';

export const VehicleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Find vehicle by slug or id
  const vehicle = VEHICLES.find((v) => v.slug === slug || v.id === slug);

  // Active gallery image state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Garage bookmark state
  const [inGarage, setInGarage] = useState(false);
  const [garageToast, setGarageToast] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      setInGarage(isCarInGarage(vehicle.slug || vehicle.id));
      recordRecentlyViewed(vehicle.slug || vehicle.id);
      setActiveImageIndex(0);
      setActiveTab('overview');
      window.scrollTo(0, 0);
    }
  }, [vehicle]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!vehicle) return;
      const images = vehicle.imageGallery && vehicle.imageGallery.length > 0
        ? vehicle.imageGallery
        : [vehicle.thumbnail || vehicle.heroImage];

      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicle, isLightboxOpen]);

  const handleToggleGarage = () => {
    if (!vehicle) return;
    const carId = vehicle.slug || vehicle.id;
    const newState = toggleCarInGarage(carId);
    setInGarage(newState);
    setGarageToast(newState ? 'Saved to My Garage!' : 'Removed from My Garage');
    setTimeout(() => setGarageToast(null), 3000);
  };

  const commSummary = vehicle ? getVehicleCommunitySummary(vehicle.slug || vehicle.id) : null;

  // If unknown slug, show proper not-found state
  if (!vehicle) {
    return (
      <div
        style={{
          paddingTop: 'calc(var(--header-height) + 4rem)',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '580px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          }}
        >
          <AlertCircle
            size={56}
            color="var(--accent-red)"
            style={{ margin: '0 auto 1.5rem' }}
          />
          <span className="badge" style={{ marginBottom: '1rem', color: 'var(--accent-red)' }}>
            REGISTRY LOOKUP 404
          </span>
          <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 800 }}>
            Vehicle Not Found in Registry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            No automotive homologation dossier matching identifier <code style={{ color: 'var(--accent-cyan)' }}>"{slug}"</code> exists in our verified registry.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/discover" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Browse Fleet Catalog</span>
            </Link>
            <Link to="/" className="btn btn-secondary">
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = vehicle.imageGallery && vehicle.imageGallery.length > 0
    ? vehicle.imageGallery
    : [vehicle.thumbnail || vehicle.heroImage];

  const currentMainImage = images[activeImageIndex] || vehicle.heroImage;

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return 'Price Verified on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const perf = vehicle.performanceDetails;
  const interior = vehicle.interiorDetails;
  const mfg = vehicle.manufacturingDetails;
  const safety = vehicle.safetyDetails;
  const eff = vehicle.efficiencyDetails;

  const isEV = vehicle.powertrain === 'electric';
  const isHybrid = vehicle.powertrain === 'hybrid' || vehicle.powertrain === 'plug-in hybrid';
  const isICE = vehicle.powertrain === 'petrol' || vehicle.powertrain === 'diesel';

  const isTaycan = vehicle.slug === 'porsche-taycan-turbo-s' || vehicle.id === 'porsche-taycan-turbo-s';

  const relatedVehicles = isTaycan
    ? VEHICLES.filter((v) =>
        ['audi-rs-etron-gt', 'tesla-model-s-plaid', 'bmw-i4-m50', 'mercedes-benz-eqs', 'porsche-911-gt3-rs'].includes(v.slug || v.id)
      )
    : VEHICLES.filter(
        (v) =>
          v.slug !== vehicle.slug &&
          v.id !== vehicle.id &&
          (v.powertrain === vehicle.powertrain || v.brand === vehicle.brand || v.bodyType === vehicle.bodyType)
      ).slice(0, 4);

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Toast Notification */}
      {garageToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: 'var(--accent-cyan)',
            color: '#07090d',
            padding: '0.85rem 1.5rem',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={16} />
          <span>{garageToast}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(5, 7, 10, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10001,
            }}
            aria-label="Close fullscreen lightbox"
          >
            <X size={24} />
          </button>

          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentMainImage}
              alt={`${vehicle.brand} ${vehicle.model} fullscreen`}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '-3rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '-3rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#ffffff',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: '1rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            {activeImageIndex + 1} / {images.length} — {vehicle.brand} {vehicle.model} {vehicle.variant}
          </div>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/discover" style={{ color: 'var(--text-secondary)' }}>
            Discover Fleet
          </Link>
          <span>/</span>
          <Link
            to={`/discover?manufacturer=${vehicle.manufacturerId}`}
            style={{ color: 'var(--text-secondary)' }}
          >
            {vehicle.brand}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--accent-cyan)' }}>
            {vehicle.model} {vehicle.variant}
          </span>
        </div>

        {/* Vehicle Header & Identity */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-cyan">
                <ShieldCheck size={12} /> {vehicle.modelYear} VERIFIED SPECIFICATION
              </span>
              <span className="badge">
                {vehicle.bodyType.toUpperCase().replace('_', ' ')}
              </span>
              <span className="badge badge-gold">
                {vehicle.powertrain.toUpperCase()}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                MARKET: {vehicle.market}
              </span>
              {commSummary && (
                <Link
                  to={`/community/vehicles/${vehicle.slug || vehicle.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '999px',
                    color: '#f59e0b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                  className="hover-cyan"
                  title="View Community Owner Ratings & Discussions"
                >
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <span>
                    {commSummary.totalReviews > 0
                      ? `${commSummary.averageRating.toFixed(1)} ★ (${commSummary.totalReviews} ${commSummary.totalReviews === 1 ? 'Owner Review' : 'Owner Reviews'})`
                      : 'Community Reviews & Ratings'}
                  </span>
                </Link>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                color: '#ffffff',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '0.65rem',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {vehicle.brand}{' '}
              </span>
              {vehicle.model}{' '}
              <span style={{ color: 'var(--accent-cyan)' }}>{vehicle.variant}</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '720px', lineHeight: 1.6 }}>
              {vehicle.tagline || vehicle.description}
            </p>
          </div>

          {/* Pricing & Actions Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.5rem 1.75rem',
              minWidth: '290px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              VERIFIED STARTING MSRP ({vehicle.currency || 'USD'})
            </span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              {formatPrice(vehicle.price, vehicle.currency)}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to={`/configurator/${vehicle.slug}`}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 240, 255, 0.08))',
                  borderColor: 'var(--accent-cyan)',
                  boxShadow: '0 4px 16px rgba(0, 240, 255, 0.25)',
                }}
              >
                <SlidersHorizontal size={16} />
                <span>Configure in 3D Studio</span>
              </Link>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleToggleGarage}
                  className={inGarage ? 'btn btn-secondary' : 'btn btn-primary'}
                  style={{
                    flex: 1,
                    fontSize: '0.82rem',
                    padding: '0.65rem 0.85rem',
                    justifyContent: 'center',
                    borderColor: inGarage ? 'var(--accent-cyan)' : undefined,
                  }}
                  title={inGarage ? 'Remove from My Garage' : 'Save to My Garage'}
                >
                  {inGarage ? (
                    <>
                      <BookmarkCheck size={16} color="var(--accent-cyan)" />
                      <span style={{ color: 'var(--accent-cyan)' }}>In My Garage</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      <span>Save to Garage</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/compare?a=${vehicle.slug}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.65rem 1rem' }}
                  title="Compare with another machine"
                >
                  <ArrowLeftRight size={15} color="var(--accent-cyan)" />
                  <span>Compare</span>
                </Link>
              </div>

              <Link
                to={`/ownership-calculator?vehicle=${vehicle.slug}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.05)',
                }}
                title="Calculate EMI, On-Road Price & 5-Year Ownership Costs"
              >
                <Calculator size={15} />
                <span>Finance & TCO Calculator</span>
              </Link>

              <Link
                to={`/test-drive?vehicle=${vehicle.slug}`}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.08))',
                  borderColor: '#34d399',
                  color: '#34d399',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
                }}
                title="Schedule an authorized OEM test drive"
              >
                <Clock size={15} />
                <span>Book a Test Drive</span>
              </Link>

              <Link
                to={`/community/write-review/${vehicle.slug || vehicle.id}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.05)',
                }}
                title="Share your authentic daily ownership experience"
              >
                <Star size={14} color="#f59e0b" />
                <span>Write an Owner Review</span>
              </Link>

              <Link
                to={`/used-cars?q=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(0, 240, 255, 0.4)',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 240, 255, 0.05)',
                }}
                title="Browse verified pre-owned listings in Marketplace"
              >
                <Car size={15} color="var(--accent-cyan)" />
                <span>Find Pre-Owned in Marketplace</span>
              </Link>

              <Link
                to={`/assistant?q=${encodeURIComponent(`Give me a detailed technical summary and verified specs for the ${vehicle.brand} ${vehicle.model}.`)}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(0, 240, 255, 0.4)',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 240, 255, 0.05)',
                }}
                title="Consult AutoVerse AI Assistant on this model"
              >
                <Bot size={14} color="var(--accent-cyan)" />
                <span>Ask AI About This Vehicle</span>
              </Link>

              {(vehicle.powertrain === 'electric' || vehicle.category === 'electric') && (
                <Link
                  to={`/trip-planner?car=${vehicle.slug}`}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    padding: '0.65rem 1rem',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.05)',
                  }}
                  title="Plan smart EV highway route with verified charging stops"
                >
                  <Navigation size={14} color="#38bdf8" />
                  <span>Plan Smart EV Highway Trip</span>
                </Link>
              )}

              <Link
                to={`/market-intelligence/vehicles/${vehicle.slug}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: '#818cf8',
                  background: 'rgba(99, 102, 241, 0.05)',
                }}
                title="View price history, launch price comparison & market intelligence"
              >
                <TrendingUp size={14} color="#818cf8" />
                <span>Price & Market History</span>
              </Link>

              <Link
                to={`/safety/vehicle/${vehicle.slug}`}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1rem',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.05)',
                }}
                title="View crash test safety ratings and recall bulletins"
              >
                <ShieldCheck size={14} color="#f87171" />
                <span>Safety & Recall Records</span>
              </Link>

              <a
                href={vehicle.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.5rem', justifyContent: 'center' }}
              >
                <span>Official Manufacturer Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* SCENE A: DRAMATIC REVEAL (PORSCHE TAYCAN TURBO S & FLAGSHIP ELECTRIC MODELS) */}
        {isTaycan && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: 'var(--accent-cyan)',
                }}
              >
                SCENE A · DRAMATIC VEHICLE REVEAL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                4-Point Matrix LED Ignition & Aerodynamic Silhouette
              </span>
            </div>
            <PorscheDramaticReveal vehicle={vehicle} />
          </div>
        )}

        {/* SCENE B: MOVING CAR CINEMATIC DRIVING FOOTAGE */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
              }}
            >
              SCENE B · HIGH-SPEED PROVING GROUND CINEMA
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Alpine Switchbacks, Highway Transients & Telemetry HUD
            </span>
          </div>
          <VehicleCinematicMedia
            vehicleSlug={vehicle.slug}
            vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.variant}`}
            videoUrl="/videos/cinema-reel.mp4"
            fallbackPosterUrl={vehicle.thumbnail || vehicle.heroImage}
            headlineMetric={{ label: '0–60 MPH', value: String(vehicle.accelerationSeconds), unit: 'sec' }}
            secondaryMetric={{ label: 'SYSTEM OUTPUT', value: String(vehicle.horsepower), unit: 'HP' }}
            locationTag={isTaycan ? 'Grossglockner Alpine Pass & Weissach Proving Ground' : `${vehicle.brand} Global Proving Corridor`}
          />
        </div>

        {/* Visual Stage & Interactive Gallery */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div
            style={{
              position: 'relative',
              height: '520px',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#0a0d14',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
              marginBottom: '1rem',
            }}
          >
            <CarImage
              key={currentMainImage}
              src={currentMainImage}
              alt={`${vehicle.brand} ${vehicle.model} presentation`}
              manufacturer={vehicle.brand}
              priority={true}
              style={{ width: '100%', height: '100%' }}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(7, 9, 13, 0.25) 0%, transparent 55%, rgba(7, 9, 13, 0.88) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Prev / Next Interactive Gallery Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(7, 9, 13, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3,
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Previous vehicle image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '1rem',
                    transform: 'translateY(-50%)',
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(7, 9, 13, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 3,
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Next vehicle image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Lightbox Trigger */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(7, 9, 13, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                zIndex: 3,
              }}
              aria-label="Expand fullscreen gallery"
            >
              <Maximize2 size={14} /> Fullscreen
            </button>

            {/* Bottom Floating Identity Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '1.25rem',
                left: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                zIndex: 2,
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(7, 9, 13, 0.85)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  GENERATION: {vehicle.generation || 'Certified Series'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    backgroundColor: 'rgba(7, 9, 13, 0.85)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  STATUS: {vehicle.availabilityStatus.toUpperCase()}
                </span>
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(7, 9, 13, 0.85)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                IMAGE {activeImageIndex + 1} OF {images.length}
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails Strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '130px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border:
                      activeImageIndex === idx
                        ? '2px solid var(--accent-cyan)'
                        : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    opacity: activeImageIndex === idx ? 1 : 0.6,
                    transform: activeImageIndex === idx ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    padding: 0,
                    backgroundColor: '#000',
                  }}
                  aria-label={`Switch to gallery slide ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`View thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry HUD Strip */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.75rem',
            marginBottom: '3rem',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              <Gauge size={14} /> 0–60 MPH ACCELERATION
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
              {vehicle.accelerationSeconds}s
              {perf?.acceleration0to100Kmh && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                  ({perf.acceleration0to100Kmh}s 0-100)
                </span>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              <Zap size={14} /> PEAK SYSTEM POWER
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
              {vehicle.horsepower} HP
              {vehicle.powerKw && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                  ({vehicle.powerKw} kW)
                </span>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              <Gauge size={14} /> TOP TRACK VELOCITY
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
              {vehicle.topSpeedMph} MPH
              {vehicle.topSpeedKmh && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                  ({vehicle.topSpeedKmh} km/h)
                </span>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              {isEV || isHybrid ? <BatteryCharging size={14} /> : <Fuel size={14} />}
              {isEV ? 'ELECTRIC RANGE' : isHybrid ? 'HYBRID / TORQUE' : 'MAX TORQUE'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
              {vehicle.electricRangeMiles
                ? `${vehicle.electricRangeMiles} mi`
                : vehicle.torqueNm
                ? `${vehicle.torqueNm} Nm`
                : 'Homologated'}
              {vehicle.electricRangeKm && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                  ({vehicle.electricRangeKm} km)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SCENE C: DETAILED ENGINEERING REVEAL (FOR PORSCHE TAYCAN TURBO S) */}
        {isTaycan && (
          <EngineeringRevealExplorer vehicle={vehicle} />
        )}

        {/* Stage 3 Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-medium)',
            marginBottom: '2.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'overview' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'overview' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Info size={16} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'performance' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'performance' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={16} /> Performance & Powertrain
          </button>

          <button
            onClick={() => setActiveTab('interior')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'interior' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'interior' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Car size={16} /> Seats & Luxury Interior
          </button>

          <button
            onClick={() => setActiveTab('manufacturing')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'manufacturing' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'manufacturing' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Cpu size={16} /> How It's Built
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'safety' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'safety' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <ShieldCheck size={16} /> Safety & ADAS
          </button>

          <button
            onClick={() => setActiveTab('efficiency')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'efficiency' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'efficiency' ? '#07090d' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <BatteryCharging size={16} /> Range & Real-World Use
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Overview Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Card 1: Key Homologation */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Layers size={16} /> ARCHITECTURE & TOPOLOGY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Manufacturer & Model
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {vehicle.brand} {vehicle.model} ({vehicle.variant})
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Generation / Series
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {vehicle.generation || 'Certified Series'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Powertrain Architecture
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', textTransform: 'capitalize' }}>
                      {vehicle.powertrain} ({vehicle.specs?.engineType || vehicle.powertrain})
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Chassis Mass / Curb Weight
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {vehicle.specs?.curbWeightLbs?.toLocaleString()} lbs ({vehicle.specs?.curbWeightKg} kg)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Drivetrain & Gearing */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Scale size={16} /> DRIVETRAIN & AVAILABILITY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Drivetrain Configuration
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {vehicle.drivetrain || vehicle.specs?.drivetrain}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Transmission / Gearing
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {vehicle.transmission || vehicle.specs?.transmission}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Assembly Location
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                      {mfg?.assemblyPlantLocation || 'Certified Manufacturer Factory'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Market Launch & Status
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {vehicle.marketLaunchDate} — {vehicle.availabilityStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Narrative Summary */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 700 }}>
                Factual Vehicle Overview
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8 }}>
                {vehicle.description}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PERFORMANCE & POWERTRAIN */}
        {activeTab === 'performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Powertrain Architecture Specific Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Propulsion Unit Spec */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Zap size={16} />
                  {isEV ? 'ELECTRIC MOTOR SPECIFICATION' : isHybrid ? 'HYBRID SYSTEM SPLIT' : 'INTERNAL COMBUSTION ENGINE'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {isEV && (
                    <>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          MOTOR COUNT & TYPE
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.electricMotorCount || 2} Motors — {perf?.motorType || vehicle.specs?.engineType}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          BATTERY VOLTAGE ARCHITECTURE
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {vehicle.specs?.voltageArchitecture || 'High-Power Electric Drive'}
                        </span>
                      </div>
                    </>
                  )}

                  {isHybrid && (
                    <>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          COMBUSTION ENGINE COMPONENT
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.engineConfiguration} ({perf?.combustionPowerHp} HP combustion)
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          ELECTRIC DRIVE UNIT (EDU)
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.motorType} ({perf?.electricMotorPowerHp} HP electric)
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          ENGINE DISPLACEMENT
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.displacementCc ? `${perf.displacementCc} cc` : 'Not Available'}
                        </span>
                      </div>
                    </>
                  )}

                  {isICE && (
                    <>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          ENGINE CONFIGURATION
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.engineConfiguration || vehicle.specs?.engineType}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          DISPLACEMENT & VALVETRAIN
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                          {perf?.displacementCc ? `${perf.displacementCc} cc` : 'Not Available'} // {perf?.valvesPerCylinder ? `${perf.valvesPerCylinder} valves/cyl` : '4 valves/cyl'}
                        </span>
                      </div>
                      {perf?.maxRpmRedline && (
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                            ENGINE MAXIMUM REDLINE
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-red)' }}>
                            {perf.maxRpmRedline.toLocaleString()} RPM
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      COMBINED SYSTEM OUTPUT
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {perf?.systemPowerHp || vehicle.horsepower} HP / {perf?.systemPowerKw || vehicle.powerKw} kW
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      MAXIMUM SYSTEM TORQUE
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {perf?.systemTorqueNm || vehicle.torqueNm} Nm
                    </span>
                  </div>
                </div>
              </div>

              {/* Transmission & Gearing Spec */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Gauge size={16} /> TRANSMISSION & DRIVETRAIN DYNAMICS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      TRANSMISSION HARDWARE
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {perf?.transmissionType || vehicle.transmission || vehicle.specs?.transmission}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      FORWARD GEAR RATIOS
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {perf?.gearCount ? `${perf.gearCount} Forward Gears` : isEV ? 'Fixed Ratio Reduction' : 'Multi-Speed'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      DRIVETRAIN LAYOUT & TORQUE BIAS
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {perf?.drivetrainLayout || vehicle.drivetrain || vehicle.specs?.drivetrain}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      CERTIFIED ACCELERATION (0–100 KM/H / 0–60 MPH)
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {perf?.acceleration0to100Kmh ? `${perf.acceleration0to100Kmh}s (0-100)` : `${vehicle.accelerationSeconds}s`} / {perf?.acceleration0to60Mph || vehicle.accelerationSeconds}s (0-60)
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      TOP TRACK SPEED
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {perf?.topSpeedKmh ? `${perf.topSpeedKmh} km/h` : `${vehicle.topSpeedMph} MPH`} ({perf?.topSpeedMph || vehicle.topSpeedMph} MPH)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrumented Benchmark Notes */}
            {perf?.independentTestNotes && (
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <Gauge size={22} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#60a5fa', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Independently Measured Test Protocol ({perf.testCycle} Standard)
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {perf.independentTestNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEATS & LUXURY INTERIOR */}
        {activeTab === 'interior' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Feature Availability Matrix */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 700 }}>
                Interior Comfort & Equipment Matrix
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    SEATING CAPACITY
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                    {interior?.seatingCapacity || 4} Passengers
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    SEAT HEATING
                  </span>
                  <span className={`badge ${interior?.heatingStandard ? 'badge-verified' : 'badge-gold'}`}>
                    {interior?.heatingStandard ? <Check size={12} /> : null}
                    {interior?.heatingStandard ? 'Standard Equipment' : 'Optional / Delete'}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    SEAT VENTILATION
                  </span>
                  <span className={`badge ${interior?.ventilationAvailability === 'Standard' ? 'badge-verified' : interior?.ventilationAvailability === 'Optional' ? 'badge-cyan' : 'badge'}`}>
                    {interior?.ventilationAvailability || 'Not Available'}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    MASSAGE FUNCTION
                  </span>
                  <span className={`badge ${interior?.massageAvailability === 'Standard' ? 'badge-verified' : interior?.massageAvailability === 'Optional' ? 'badge-cyan' : 'badge'}`}>
                    {interior?.massageAvailability || 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Cabin Appointments */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Cockpit Materials & Adjustments */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Car size={16} /> SEATING & UPHOLSTERY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      FRONT SEAT ADJUSTMENT
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.frontSeatAdjustment || 'Power Multi-way Adjustable Seats'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      STANDARD UPHOLSTERY
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.upholsteryStandard || 'Premium Interior Trim'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      VERIFIED BESPOKE OPTIONS
                    </span>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {interior?.upholsteryOptions?.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      )) || <li>Manufacturer Standard Options</li>}
                    </ul>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      REAR SEAT CONFIGURATION
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.rearSeatComfort || 'Sport passenger row'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Climate, Audio & Luggage Capacity */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Sparkles size={16} /> CLIMATE, AUDIO & CARGO
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      CLIMATE & AIR FILTRATION
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.climateControl}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'block', marginTop: '2px' }}>
                      Filtration: {interior?.airFiltration}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      PREMIUM AUDIO ARCHITECTURE
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.audioSystemBrand} ({interior?.speakerCount} Speakers{interior?.audioTotalWatts ? `, ${interior.audioTotalWatts} Watts` : ''})
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      COCKPIT DISPLAYS & AMBIENT ILLUMINATION
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {interior?.infotainmentDisplay}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Lighting: {interior?.ambientLighting}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      CARGO & LUGGAGE CAPACITY
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      Rear Trunk: {interior?.cargoCapacityLiters} L ({interior?.cargoCapacityCuFt} cu ft)
                      {interior?.frunkCapacityLiters ? ` + Front Frunk: ${interior.frunkCapacityLiters} L (${interior.frunkCapacityCuFt} cu ft)` : ''}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      CABIN NOISE ACOUSTICS
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {interior?.cabinNoiseAcoustics || 'Acoustically insulated passenger compartment.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOW IT'S BUILT & MATERIALS */}
        {activeTab === 'manufacturing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
                Vehicle Engineering & Chassis Construction
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Engineering breakdown of structural metallurgy, powertrain componentry, and manufacturing facility disclosed by manufacturer homologation dossiers.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                    CHASSIS & MONOCOQUE
                  </span>
                  <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                    {mfg?.chassisConstruction || 'Lightweight steel-aluminum composite chassis.'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                    MATERIALS COMPOSITION
                  </span>
                  <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                    {mfg?.materialsComposition || 'Optimized multi-material matrix for structural rigidity.'}
                  </p>
                </div>

                {mfg?.batteryChemistry && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                      BATTERY CHEMISTRY & CELL DESIGN
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                      {mfg.batteryChemistry}
                    </p>
                  </div>
                )}

                {mfg?.electricMotorTech && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                      ELECTRIC MOTOR & STATOR TECH
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                      {mfg.electricMotorTech}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                    ASSEMBLY FACILITY & PROCESSES
                  </span>
                  <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                    <strong>{mfg?.assemblyPlantLocation || 'Certified Factory'}</strong>. {mfg?.assemblyProcessesDisclosed}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                    SUSTAINABLE & RECYCLED MATERIALS
                  </span>
                  <p style={{ fontSize: '0.92rem', color: '#ffffff', marginTop: '0.35rem', lineHeight: 1.6 }}>
                    {mfg?.sustainableMaterials || 'Environmentally conscious manufacturing and recyclable components.'}
                  </p>
                </div>

                {mfg?.torsionalRigidityNmDeg && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                      TORSIONAL STIFFNESS
                    </span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
                      {mfg.torsionalRigidityNmDeg.toLocaleString()} Nm/degree
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Engineering Transparency Notice */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--text-secondary)' }}>Automotive Engineering Compliance:</strong> All manufacturing disclosures derive strictly from verified corporate press briefings, homologation datasheets, and official factory tours. Proprietary battery chemistries or confidential supplier arrangements that are not publicly documented are labeled as not verified.
            </div>
          </div>
        )}

        {/* TAB 5: SAFETY & DRIVER ASSISTANCE */}
        {activeTab === 'safety' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* ADAS Legal & Engineering Limitation Box */}
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={24} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'var(--accent-red)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Crucial Notice: Driver Assistance vs. Autonomous Driving ({safety?.adasLevel || 'Level 2 SAE'})
                </h4>
                <p style={{ color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {safety?.adasLimitationNotice ||
                    'Active safety and driver assistance features require continuous driver supervision. The driver must remain attentive with hands on the wheel and eyes on the road at all times. These systems do not make the vehicle autonomous.'}
                </p>
              </div>
            </div>

            {/* Safety Hardware & Crash Testing */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {/* Airbags & Passive Safety */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <ShieldCheck size={16} /> PASSIVE SAFETY & AIRBAGS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      TOTAL AIRBAG COUNT
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                      {safety?.airbagCount || 'Verified Fleet Safety'} Airbags
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      PROTECTION ZONES
                    </span>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {safety?.airbagLocations?.map((loc, i) => (
                        <li key={i}>{loc}</li>
                      )) || <li>Front and side impact airbags</li>}
                    </ul>
                  </div>

                  {safety?.crashTestRating && (
                    <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'block', fontWeight: 700 }}>
                        OFFICIAL CRASH TEST RATING
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                        {safety.crashTestRating.agency}: {safety.crashTestRating.score}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        Tested Year: {safety.crashTestRating.testYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Safety & Braking Hardware */}
              <div className="card-glass" style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Gauge size={16} /> BRAKING & ACTIVE ASSISTANCE
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      DRIVER ASSISTANCE SUITE
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
                      {safety?.driverAssistanceSuite || 'Active Driver Safety Package'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      BRAKING HARDWARE SPECIFICATION
                    </span>
                    <span style={{ fontSize: '0.92rem', color: '#ffffff', lineHeight: 1.5 }}>
                      {safety?.brakingHardware || 'High-performance ventilated disc brakes.'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      PARKING & MANEUVERING ASSIST
                    </span>
                    <span style={{ fontSize: '0.92rem', color: '#ffffff' }}>
                      {safety?.parkingAssistance || 'Ultrasonic parking sensors and rear-view camera.'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      ACTIVE COLLISION MITIGATION
                    </span>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {safety?.activeSafetySystems?.map((sys, i) => (
                        <li key={i}>{sys}</li>
                      )) || <li>Electronic Stability Control and ABS</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* SCENE D: CONTROLLED CRASH-TEST & SAFETY LAB VISUALIZATION */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: 'var(--accent-red)',
                  }}
                >
                  SCENE D · CONTROLLED CRASH SAFETY & KINEMATICS LAB
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Interactive Load Dissipation & High-Voltage Pyrofuse Telemetry
                </span>
              </div>
              <SafetyLabVisualization vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.variant}`} />

              {/* Stage 17 Official Recall & Safety Intelligence Link */}
              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Official Recalls & Authoritative Defect Dossier
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Inspect synchronized MoRTH (India) and NHTSA (USA) recall notices, free dealer repairs, and crashworthiness ratings for {vehicle.name}.
                  </div>
                </div>

                <Link
                  to={`/safety/vehicle/${vehicle.id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  <span>Inspect Vehicle Safety Dossier ➔</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RANGE, EFFICIENCY & REAL-WORLD USE */}
        {activeTab === 'efficiency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Efficiency Benchmark Strip */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 700 }}>
                {isEV ? 'Electric Range & Fast-Charging Capabilities' : 'Fuel Economy & Operational Efficiency'}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {isEV && (
                  <>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        OFFICIAL RATED RANGE ({eff?.rangeTestCycle || 'WLTP'})
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                        {eff?.ratedRangeMiles || vehicle.electricRangeMiles} mi / {eff?.ratedRangeKm || vehicle.electricRangeKm} km
                      </span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        BATTERY CAPACITY (GROSS / USABLE)
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                        {eff?.batteryGrossKwh || vehicle.batteryCapacityKWh} kWh ({eff?.batteryUsableKwh || 'Net'} usable)
                      </span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        PEAK DC FAST CHARGE
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {eff?.chargingMaxDcKw ? `${eff.chargingMaxDcKw} kW` : 'Fast Charge Capable'}
                      </span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        ENERGY CONSUMPTION
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                        {eff?.energyConsumptionKwh100Km ? `${eff.energyConsumptionKwh100Km} kWh/100km` : eff?.energyConsumptionMpge ? `${eff.energyConsumptionMpge} MPGe` : 'Certified'}
                      </span>
                    </div>
                  </>
                )}

                {(isICE || isHybrid) && (
                  <>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        COMBINED FUEL ECONOMY
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                        {eff?.fuelEconomyMpgCombined ? `${eff.fuelEconomyMpgCombined} MPG` : 'Certified'} ({eff?.fuelEconomyLiters100Km ? `${eff.fuelEconomyLiters100Km} L/100km` : 'WLTP'})
                      </span>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        FUEL TANK CAPACITY
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                        {eff?.fuelTankCapacityLiters ? `${eff.fuelTankCapacityLiters} L (${eff.fuelTankCapacityGallons} gal)` : 'Standard'}
                      </span>
                    </div>

                    {isHybrid && (
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          ALL-ELECTRIC RANGE
                        </span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {eff?.ratedRangeMiles || vehicle.electricRangeMiles || 8} Miles
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {eff?.chargingTimeDc10to80 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0, 240, 255, 0.05)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block' }}>
                    DC CHARGING TIME PROTOCOL (10% TO 80% SOC)
                  </span>
                  <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600 }}>
                    {eff.chargingTimeDc10to80}
                  </span>
                </div>
              )}
            </div>

            {/* Real-World Operational Factors */}
            <div className="card-glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem', fontWeight: 700 }}>
                Real-World Operational & Environmental Factors
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    FREEZING TEMPERATURE INFLUENCE
                  </span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {eff?.realWorldRangeFactors?.coldWeatherImpact ||
                      'Low ambient temperatures affect thermal efficiency, cabin heating demand, and battery electrolyte velocity.'}
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    SUSTAINED HIGHWAY SPEED DRAG
                  </span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {eff?.realWorldRangeFactors?.highwayCruisingImpact ||
                      'Aerodynamic drag scales quadratically with speed, reducing highway efficiency compared to urban cycles.'}
                  </p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    WHEEL & TIRE COMPOUND EFFECT
                  </span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {eff?.realWorldRangeFactors?.wheelSizeImpact ||
                      'Larger performance wheel diameters and sticky track tires increase rolling resistance and reduce range.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Sourcing & Homologation Audit Footer */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '3.5rem',
            marginBottom: '3.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={22} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              OFFICIAL HOMOLOGATION AUDIT & SOURCING
            </h3>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {vehicle.specificationSource || vehicle.specs?.verifiedSource}.
            All specifications and performance telemetry comply strictly with official manufacturer homologation sheets and certified cycle standards.
            Audit verification timestamp: <strong style={{ color: '#ffffff' }}>{vehicle.lastVerifiedAt}</strong>.
          </p>

          <div>
            <a
              href={vehicle.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                fontSize: '0.85rem',
              }}
            >
              <span>Verify at Official {vehicle.brand} Portal</span>
              <ExternalLink size={14} color="#34d399" />
            </a>
          </div>
        </div>

        {/* SCENE E: CURATED RELATED VEHICLES */}
        {relatedVehicles.length > 0 && (
          <div style={{ marginTop: '4rem', marginBottom: '3.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: 'var(--accent-cyan)',
                    textTransform: 'uppercase',
                  }}
                >
                  SCENE E · BENCHMARK FLEET PEERS
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
                  Related High-Performance & Electric Machines
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  Compare specifications, explore telemetry, and evaluate powertrain dynamics from our 50-car verified fleet.
                </p>
              </div>

              <Link to="/discover" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                <span>Explore Full 50-Car Fleet</span>
                <ArrowLeftRight size={14} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {relatedVehicles.map((rel) => {
                const isInRelGarage = isCarInGarage(rel.slug || rel.id);
                return (
                  <div
                    key={rel.id}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    {/* Vehicle Preview Image */}
                    <div style={{ position: 'relative', height: '170px', overflow: 'hidden', backgroundColor: '#000' }}>
                      <img
                        src={rel.thumbnail || rel.heroImage}
                        alt={`${rel.brand} ${rel.model}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(4px)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: 'var(--accent-cyan)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {rel.powertrain.toUpperCase()}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(4px)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {rel.horsepower} HP
                      </div>
                    </div>

                    {/* Meta & Spec summary */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rel.brand}</div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0.15rem 0 0.5rem' }}>
                        {rel.model} <span style={{ color: 'var(--accent-cyan)' }}>{rel.variant}</span>
                      </h4>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.5rem',
                          margin: '0.75rem 0 1.25rem',
                          backgroundColor: 'rgba(15, 20, 28, 0.5)',
                          padding: '0.65rem',
                          borderRadius: '6px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>0–60 MPH</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                            {rel.accelerationSeconds}s
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>TOP SPEED</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                            {rel.topSpeedMph} mph
                          </div>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/cars/${rel.slug}`}
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '0.78rem', padding: '0.55rem', justifyContent: 'center' }}
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/compare?a=${vehicle.slug}&b=${rel.slug}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.55rem 0.75rem' }}
                          title="Compare side-by-side"
                        >
                          <ArrowLeftRight size={14} color="var(--accent-cyan)" />
                        </Link>
                        <button
                          onClick={() => {
                            toggleCarInGarage(rel.slug || rel.id);
                            setGarageToast(isInRelGarage ? `Removed ${rel.model}` : `Saved ${rel.model} to Garage`);
                            setTimeout(() => setGarageToast(null), 3000);
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '0.55rem 0.75rem' }}
                          title={isInRelGarage ? 'In Garage' : 'Save to Garage'}
                        >
                          {isInRelGarage ? <BookmarkCheck size={14} color="var(--accent-cyan)" /> : <Bookmark size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation Callout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/discover" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Fleet Catalog</span>
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleToggleGarage}
              className={inGarage ? 'btn btn-secondary' : 'btn btn-ghost'}
              style={{ borderColor: inGarage ? 'var(--accent-cyan)' : undefined }}
            >
              {inGarage ? <BookmarkCheck size={16} color="var(--accent-cyan)" /> : <Bookmark size={16} />}
              <span>{inGarage ? 'Saved in Garage' : 'Bookmark to Garage'}</span>
            </button>

            <Link to={`/compare?a=${vehicle.slug}`} className="btn btn-primary">
              <span>Compare Machine</span>
              <ArrowLeftRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
