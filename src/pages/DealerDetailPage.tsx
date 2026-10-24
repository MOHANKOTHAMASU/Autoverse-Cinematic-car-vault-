// AutoVerse Stage 20: Dealer Profile & Inventory Showcase
// Detailed view of verified dealership operations, confirmed opening hours, service offerings,
// supported manufacturers, physical location, and test-drive reservations.

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Star,
  Clock,
  Car,
  Wrench,
  Zap,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { getDealerBySlug } from '../utils/dealerStore';
import { VEHICLES } from '../data/vehicles';
import type { DealershipService } from '../types/dealer';

export const DealerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const dealer = useMemo(() => {
    if (!slug) return undefined;
    return getDealerBySlug(slug);
  }, [slug]);

  // Inventory vehicles associated with this dealership
  const inventoryVehicles = useMemo(() => {
    if (!dealer) return [];
    return VEHICLES.filter((v) => {
      // Direct inventory match or authorized brand match
      return (
        dealer.inventoryVehicleIds.includes(v.slug) ||
        dealer.inventoryVehicleIds.includes(v.id) ||
        dealer.supportedBrands.some((b) => b.toLowerCase() === v.brand.toLowerCase())
      );
    });
  }, [dealer]);

  if (!dealer) {
    return (
      <div
        style={{
          paddingTop: 'calc(var(--header-height) + 4rem)',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '600px' }}>
          <Building2 size={54} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Dealership Record Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The dealership slug "{slug}" does not match any verified AutoVerse dealership record.
          </p>
          <Link to="/dealers" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Dealer Directory
          </Link>
        </div>
      </div>
    );
  }

  const serviceLabels: Record<DealershipService, { label: string; desc: string; icon: any }> = {
    new_cars: {
      label: 'New Vehicle Sales',
      desc: 'Factory-order allocation, configuration delivery, and bespoke commission consultation.',
      icon: Car,
    },
    pre_owned: {
      label: 'Certified Pre-Owned',
      desc: '111-point multi-system inspection with factory warranty extension and telemetry provenance.',
      icon: ShieldCheck,
    },
    service_center: {
      label: 'Authorized Service Center',
      desc: 'Factory-trained master technicians, OEM replacement components, and chassis alignment.',
      icon: Wrench,
    },
    test_drives: {
      label: 'Instrumented Test Drives',
      desc: 'Verified demonstration drives on designated high-speed, mixed-gradient driving routes.',
      icon: Clock,
    },
    ev_charging: {
      label: 'Ultra-Fast DC Charging',
      desc: 'Dedicated on-site 350kW CCS2 / NACS high-voltage fast charging pedestals.',
      icon: Zap,
    },
    bespoke_studio: {
      label: 'Bespoke Atelier / Studio',
      desc: 'Physical leather samples, paint-to-sample swatches, and custom trim design suites.',
      icon: Sparkles,
    },
  };

  const daysOfWeek: Array<{ key: keyof typeof dealer.openingHours; label: string }> = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/dealers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to Dealership Directory
          </Link>
        </div>

        {/* Hero Banner Header */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75)',
          }}
        >
          {/* Banner Media */}
          <div style={{ height: '320px', position: 'relative' }}>
            <img
              src={dealer.bannerImage}
              alt={dealer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(7, 9, 13, 0.98) 0%, rgba(7, 9, 13, 0.6) 50%, rgba(7, 9, 13, 0.3) 100%)',
              }}
            />
          </div>

          {/* Overlay Info */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                {dealer.verified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.9)',
                      color: '#ffffff',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                    }}
                  >
                    <ShieldCheck size={14} /> VERIFIED OEM PARTNER
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Star size={13} fill="#f59e0b" /> {dealer.rating.toFixed(2)} ({dealer.reviewCount} Reviews)
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                }}
              >
                {dealer.name}
              </h1>

              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.5rem',
                }}
              >
                {dealer.legalEntityName}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
                {dealer.tagline}
              </p>
            </div>

            {/* Direct CTA */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to={`/test-drive?dealer=${dealer.slug}`}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
              >
                <Clock size={16} /> Book Test Drive
              </Link>

              <a
                href={dealer.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.85rem 1.25rem', fontSize: '0.95rem' }}
              >
                <MapPin size={16} /> Open Directions
              </a>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Details & Hours vs Inventory */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Left Column: Location, Contact & Opening Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Showroom Details Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Building2 size={18} color="var(--accent-cyan)" /> Showroom & Facility Details
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {dealer.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                {/* Physical Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Verified Location
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                      {dealer.address.street}, {dealer.address.city}, {dealer.address.state} {dealer.address.postalCode}, {dealer.address.country}
                    </span>
                    <a
                      href={dealer.address.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        color: 'var(--accent-cyan)',
                        marginTop: '0.25rem',
                      }}
                    >
                      View on Google Maps <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Direct Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Telephone
                    </span>
                    <a href={`tel:${dealer.phone}`} style={{ fontSize: '0.9rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {dealer.phone}
                    </a>
                  </div>
                </div>

                {/* Direct Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Showroom Concierge Email
                    </span>
                    <a href={`mailto:${dealer.email}`} style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                      {dealer.email}
                    </a>
                  </div>
                </div>

                {/* Official Website */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ExternalLink size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Official Web Portal
                    </span>
                    <a
                      href={dealer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}
                    >
                      {dealer.websiteUrl}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmed Opening Hours */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Clock size={18} color="var(--accent-cyan)" /> Confirmed Business Hours
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {daysOfWeek.map((day) => {
                  const hours = dealer.openingHours[day.key];
                  const isClosed = hours.toLowerCase().includes('closed');
                  return (
                    <div
                      key={day.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{day.label}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: isClosed ? '#ef4444' : '#ffffff',
                          fontWeight: 600,
                        }}
                      >
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Supported Services & Test Drive Slots Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Services Offered */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Wrench size={18} color="var(--accent-cyan)" /> Authorized Services
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dealer.services.map((srv) => {
                  const srvData = serviceLabels[srv];
                  const IconComp = srvData?.icon || CheckCircle2;
                  return (
                    <div
                      key={srv}
                      style={{
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'flex-start',
                        padding: '0.85rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                          {srvData?.label || srv}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                          {srvData?.desc || 'Official manufacturer service available at this location.'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test-Drive Scheduling Capacity Card */}
            <div
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-cyan">
                  <Clock size={12} /> TEST-DRIVE CAPACITY
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ACTIVE RESERVATION DISPATCH
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Online Test-Drive Availability
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                This showroom accepts instant automated test-drive bookings up to{' '}
                <strong style={{ color: 'var(--accent-cyan)' }}>{dealer.slotConfig.daysInAdvance} days</strong> in
                advance across {dealer.slotConfig.slotTimes.length} daily departure windows.
              </p>

              {/* Slots Preview */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {dealer.slotConfig.slotTimes.map((slot) => (
                  <span
                    key={slot}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      backgroundColor: 'rgba(7, 9, 13, 0.8)',
                      border: '1px solid var(--border-medium)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {slot}
                  </span>
                ))}
              </div>

              <Link
                to={`/test-drive?dealer=${dealer.slug}`}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              >
                <Calendar size={16} /> Schedule a Test Drive Now
              </Link>
            </div>
          </div>
        </div>

        {/* Section: Available Fleet & Inventory for Test Drive */}
        <div style={{ marginTop: '2rem' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-cyan">
                  <Car size={12} /> SHOWROOM FLEET
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {inventoryVehicles.length} MODELS ELIGIBLE
                </span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
                Eligible Fleet & Test-Drive Models
              </h2>
            </div>

            <Link
              to={`/dealers/${dealer.slug}/vehicles`}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem' }}
            >
              View Complete Inventory <ChevronRight size={14} />
            </Link>
          </div>

          {inventoryVehicles.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {inventoryVehicles.slice(0, 6).map((vehicle) => (
                <div
                  key={vehicle.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img
                      src={vehicle.thumbnail || vehicle.heroImage || vehicle.imageGallery[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        backgroundColor: 'rgba(7, 9, 13, 0.85)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-cyan)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {vehicle.powertrain}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {vehicle.brand.toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {vehicle.variant}
                    </div>

                    {/* Quick Specs */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        marginBottom: '1.25rem',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          OUTPUT
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                          {vehicle.horsepower} HP
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          0-60 MPH
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {vehicle.accelerationSeconds}s
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          TOP SPEED
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                          {vehicle.topSpeedMph} MPH
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/vehicles/${vehicle.slug}`}
                        className="btn btn-outline"
                        style={{ flex: 1, fontSize: '0.78rem', padding: '0.55rem', justifyContent: 'center' }}
                      >
                        Specs
                      </Link>

                      <Link
                        to={`/test-drive?dealer=${dealer.slug}&vehicle=${vehicle.slug}`}
                        className="btn btn-primary"
                        style={{ flex: 1.5, fontSize: '0.78rem', padding: '0.55rem', justifyContent: 'center' }}
                      >
                        <Clock size={13} /> Request Drive
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                Demonstration vehicle inventory for this dealer is currently in transit. Please contact the showroom directly for upcoming allocations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
