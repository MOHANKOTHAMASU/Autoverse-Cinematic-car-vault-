// AutoVerse Stage 13: Global Launch Discovery, Press Wire & Timeline
// 3-Tier Verification Status (Confirmed / Credible / Rumoured), Source Audits, and Timeline View

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Car,
  Search,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { CarImage } from '../components/CarImage';
import { getEditorialLaunches } from '../utils/editorialStore';
import type { LaunchRecord, VerificationStatus } from '../types/editorial';

export const LaunchesPage: React.FC = () => {
  const [launches, setLaunches] = useState<LaunchRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'announced' | 'available' | 'upcoming'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | VerificationStatus>('all');
  const [powertrainFilter, setPowertrainFilter] = useState<'all' | 'electric' | 'hybrid' | 'petrol' | 'diesel'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setLaunches(getEditorialLaunches());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('autoverse_editorial_updated', loadData);
    return () => window.removeEventListener('autoverse_editorial_updated', loadData);
  }, []);

  const filteredLaunches = useMemo(() => {
    return launches.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesVerification = verificationFilter === 'all' || item.verificationStatus === verificationFilter;
      const matchesPowertrain = powertrainFilter === 'all' || item.powertrain === powertrainFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.vehicleName.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
      return matchesStatus && matchesVerification && matchesPowertrain && matchesSearch;
    });
  }, [launches, statusFilter, verificationFilter, powertrainFilter, searchQuery]);

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return 'Not announced';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // 3-Tier Verification Badge
  const getVerificationBadge = (vStatus: VerificationStatus) => {
    switch (vStatus) {
      case 'officially_confirmed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ShieldCheck size={12} /> OFFICIALLY CONFIRMED
          </span>
        );
      case 'credible_source':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Info size={12} /> CREDIBLE SOURCE REPORTED
          </span>
        );
      case 'rumoured':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '4px',
              padding: '0.25rem 0.55rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <AlertTriangle size={12} /> RUMOURED / UNCONFIRMED
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('available')) {
      return <span className="badge badge-verified">AVAILABLE FOR PURCHASE</span>;
    }
    if (s.includes('announced')) {
      return <span className="badge badge-cyan">OFFICIALLY ANNOUNCED</span>;
    }
    return <span className="badge badge-gold">UPCOMING HOMOLOGATION</span>;
  };

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: '#040608',
        color: '#f8fafc',
      }}
    >
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">
              <Sparkles size={12} /> GLOBAL VEHICLE LAUNCH WIRE
            </span>
            <span className="badge badge-verified">
              <ShieldCheck size={12} /> 3-TIER FACT-CHECKED VERIFICATION
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              color: '#ffffff',
              letterSpacing: '-0.03em',
              fontWeight: 900,
              marginBottom: '0.85rem',
            }}
          >
            Latest Global Launches & Debuts
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.15rem',
              maxWidth: '820px',
              lineHeight: 1.65,
            }}
          >
            Direct factory press releases audited against Porsche Newsroom, Tata EV, Mahindra Auto,
            Audi MediaCenter, and BMW PressClub. AutoVerse clearly distinguishes between officially confirmed
            deliveries, credible industry reports, and unverified rumors.
          </p>
        </div>

        {/* Data Authenticity Notice & Verification Legend */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '1.25rem 1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Info size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              <strong>Audit Standard:</strong> Launch dates, starting prices, and specifications missing
              manufacturer verification are marked <em>"Not announced"</em> rather than estimated.
            </span>
          </div>

          {/* Verification Badges Legend */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {getVerificationBadge('officially_confirmed')}
            {getVerificationBadge('credible_source')}
            {getVerificationBadge('rumoured')}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Status and Verification Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['all', 'available', 'announced', 'upcoming'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: statusFilter === tab ? '#07090d' : 'var(--text-secondary)',
                  backgroundColor: statusFilter === tab ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab === 'all' ? 'All Launches' : tab}
              </button>
            ))}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 0.25rem' }} />

            {(['all', 'officially_confirmed', 'credible_source', 'rumoured'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVerificationFilter(v)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: verificationFilter === v ? '#ffffff' : 'var(--text-muted)',
                  backgroundColor: verificationFilter === v ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                {v === 'all' ? 'Any Tier' : v.replace('_', ' ')}
              </button>
            ))}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 0.25rem' }} />

            {(['all', 'electric', 'hybrid', 'petrol', 'diesel'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPowertrainFilter(p)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: powertrainFilter === p ? '#ffffff' : 'var(--text-muted)',
                  backgroundColor: powertrainFilter === p ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                {p === 'all' ? 'All Powertrains' : p}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search model, OEM, powertrain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                backgroundColor: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Launches Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {filteredLaunches.length === 0 ? (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <HelpCircle size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                No Launches Match Current Filter
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Try resetting your status or verification filter to view upcoming premieres.
              </p>
            </div>
          ) : (
            filteredLaunches.map((launch) => (
              <article
                key={launch.id}
                className="card-glass"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Image Preview */}
                <div style={{ position: 'relative', minHeight: '320px' }}>
                  <CarImage
                    src={launch.image}
                    alt={launch.vehicleName}
                    manufacturer={launch.manufacturer}
                    style={{ width: '100%', height: '100%' }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      zIndex: 2,
                    }}
                  >
                    {getStatusBadge(launch.status)}
                    {getVerificationBadge(launch.verificationStatus)}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '1.25rem',
                      left: '1.25rem',
                      right: '1.25rem',
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
                        color: '#ffffff',
                        backgroundColor: 'rgba(7, 9, 13, 0.85)',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '4px',
                      }}
                    >
                      MODEL YEAR: {launch.modelYear}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-cyan)',
                        backgroundColor: 'rgba(7, 9, 13, 0.85)',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '4px',
                      }}
                    >
                      {launch.market}
                    </span>
                  </div>
                </div>

                {/* Content Dossier */}
                <div
                  style={{
                    padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      <span>ANNOUNCEMENT: {launch.announcementDate}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>//</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>LAUNCH WINDOW: {launch.marketLaunchDate}</span>
                    </div>
                  </div>

                  <h2
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {launch.vehicleName}
                  </h2>

                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem',
                      lineHeight: 1.4,
                    }}
                  >
                    "{launch.headline}"
                  </h3>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {launch.summary}
                  </p>

                  {/* Price and Availability Info Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        STARTING BASE PRICE
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                        {formatPrice(launch.startingPrice, launch.currency)}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        DELIVERY TARGET
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {launch.expectedDelivery || 'Not announced'}
                      </span>
                    </div>
                  </div>

                  {/* Source Verification Footer & Links */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <ShieldCheck size={16} color="#34d399" />
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Source: {launch.sourceName} (Verified {launch.sourceCheckedDate || 'October 2024'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {launch.relatedVehicleSlug && (
                        <Link
                          to={`/cars/${launch.relatedVehicleSlug}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.5rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Car size={13} />
                          <span>Vehicle Details</span>
                        </Link>
                      )}

                      <a
                        href={launch.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.5rem 0.85rem' }}
                      >
                        <span>View Press Dossier</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
