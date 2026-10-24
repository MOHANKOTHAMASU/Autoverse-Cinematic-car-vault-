// AutoVerse Stage 20: Verified Dealership Discovery & Showroom Search
// Enables users to discover authorized global dealerships, filter by marque and services,
// and initiate direct test-drive reservations.

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Car,
  Zap,
  Wrench,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { getAllDealers, filterDealers } from '../utils/dealerStore';
import type { Dealership, DealershipService } from '../types/dealer';

export const DealerDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialBrand = searchParams.get('brand') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialService = (searchParams.get('service') as DealershipService) || ('all' as any);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedService, setSelectedService] = useState<DealershipService | 'all'>(initialService);

  const [dealers, setDealers] = useState<Dealership[]>(() => getAllDealers());

  useEffect(() => {
    const handleUpdate = () => {
      setDealers(getAllDealers());
    };
    window.addEventListener('autoverse_dealers_updated', handleUpdate);
    return () => window.removeEventListener('autoverse_dealers_updated', handleUpdate);
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (selectedCity !== 'all') params.set('city', selectedCity);
    if (selectedService !== 'all') params.set('service', selectedService);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedBrand, selectedCity, selectedService, setSearchParams]);

  // Unique lists for dropdowns
  const allBrands = useMemo(() => {
    const set = new Set<string>();
    dealers.forEach((d) => d.supportedBrands.forEach((b) => set.add(b)));
    return Array.from(set).sort();
  }, [dealers]);

  const allCities = useMemo(() => {
    const set = new Set<string>();
    dealers.forEach((d) => set.add(d.address.city));
    return Array.from(set).sort();
  }, [dealers]);

  // Filtered dealers
  const filteredDealers = useMemo(() => {
    return filterDealers({
      searchQuery,
      brand: selectedBrand,
      city: selectedCity,
      service: selectedService === 'all' ? undefined : selectedService,
      activeOnly: true,
    });
  }, [dealers, searchQuery, selectedBrand, selectedCity, selectedService]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('all');
    setSelectedCity('all');
    setSelectedService('all');
  };

  const serviceLabels: Record<DealershipService, { label: string; icon: any }> = {
    new_cars: { label: 'New Vehicles', icon: Car },
    pre_owned: { label: 'Certified Pre-Owned', icon: ShieldCheck },
    service_center: { label: 'Factory Service', icon: Wrench },
    test_drives: { label: 'Test Drives', icon: Clock },
    ev_charging: { label: 'EV Fast Charging', icon: Zap },
    bespoke_studio: { label: 'Bespoke Studio', icon: Sparkles },
  };

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
        {/* Hero Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan">
              <Building2 size={12} /> STAGE 20 DEALER NETWORK
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              VERIFIED OEM SHOWROOMS & TEST HUBS
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            Authorized Dealerships & Test-Drive Centers
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '750px', lineHeight: 1.6 }}>
            Locate factory-authorized automotive showrooms, certified high-voltage service facilities,
            and schedule instrumented manufacturer test drives across our verified partner network.
          </p>
        </div>

        {/* Search & Filter Control Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Top Row: Search Input */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div
              style={{
                flex: '1 1 320px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
              }}
            >
              <Search size={18} color="var(--accent-cyan)" />
              <input
                type="text"
                placeholder="Search by dealership name, city, state, or marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Brand Dropdown */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all" style={{ background: '#0a0d14' }}>
                  All Marques ({allBrands.length})
                </option>
                {allBrands.map((brand) => (
                  <option key={brand} value={brand} style={{ background: '#0a0d14' }}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div style={{ minWidth: '180px' }}>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all" style={{ background: '#0a0d14' }}>
                  All Cities ({allCities.length})
                </option>
                {allCities.map((city) => (
                  <option key={city} value={city} style={{ background: '#0a0d14' }}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Action */}
            {(searchQuery || selectedBrand !== 'all' || selectedCity !== 'all' || selectedService !== 'all') && (
              <button
                onClick={handleResetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            )}
          </div>

          {/* Service Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginRight: '0.5rem',
              }}
            >
              Services:
            </span>

            <button
              onClick={() => setSelectedService('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedService === 'all' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                backgroundColor: selectedService === 'all' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                color: selectedService === 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Services
            </button>

            {(Object.keys(serviceLabels) as DealershipService[]).map((srvKey) => {
              const info = serviceLabels[srvKey];
              const IconComp = info.icon;
              const isSelected = selectedService === srvKey;
              return (
                <button
                  key={srvKey}
                  onClick={() => setSelectedService(srvKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <IconComp size={13} /> {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
            SHOWING <strong style={{ color: '#ffffff' }}>{filteredDealers.length}</strong> VERIFIED DEALERSHIPS
          </div>

          <Link
            to="/test-drive"
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <Clock size={14} /> My Test Drives & Bookings
          </Link>
        </div>

        {/* Dealer Cards Grid */}
        {filteredDealers.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {filteredDealers.map((dealer) => (
              <div
                key={dealer.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
                className="dealer-card-hover"
              >
                {/* Banner Image */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={dealer.bannerImage}
                    alt={dealer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(7, 9, 13, 0.95) 0%, rgba(7, 9, 13, 0.2) 60%)',
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                  >
                    {dealer.verified && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.9)',
                          color: '#ffffff',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <ShieldCheck size={12} /> VERIFIED OEM
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#f59e0b',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Star size={12} fill="#f59e0b" /> {dealer.rating.toFixed(1)} ({dealer.reviewCount})
                  </div>

                  {/* Brand Badges on Banner Bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '1rem',
                      display: 'flex',
                      gap: '0.4rem',
                    }}
                  >
                    {dealer.supportedBrands.map((b) => (
                      <span
                        key={b}
                        style={{
                          backgroundColor: 'rgba(0, 240, 255, 0.15)',
                          border: '1px solid rgba(0, 240, 255, 0.4)',
                          color: 'var(--accent-cyan)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      marginBottom: '0.4rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {dealer.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {dealer.tagline}
                  </p>

                  {/* Address Snippet */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.82rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <MapPin size={15} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      {dealer.address.street}, {dealer.address.city}, {dealer.address.state}, {dealer.address.country}
                    </span>
                  </div>

                  {/* Phone */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.82rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Phone size={14} color="var(--accent-cyan)" />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{dealer.phone}</span>
                  </div>

                  {/* Services Badges */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {dealer.services.map((srv) => (
                      <span
                        key={srv}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {serviceLabels[srv]?.label || srv}
                      </span>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      gap: '0.75rem',
                    }}
                  >
                    <Link
                      to={`/dealers/${dealer.slug}`}
                      className="btn btn-outline"
                      style={{
                        flex: 1,
                        fontSize: '0.82rem',
                        padding: '0.65rem 0.75rem',
                        justifyContent: 'center',
                      }}
                    >
                      View Showroom
                    </Link>

                    <Link
                      to={`/test-drive?dealer=${dealer.slug}`}
                      className="btn btn-primary"
                      style={{
                        flex: 1.2,
                        fontSize: '0.82rem',
                        padding: '0.65rem 0.75rem',
                        justifyContent: 'center',
                      }}
                    >
                      <Clock size={14} /> Request Drive
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-medium)',
              borderRadius: '16px',
            }}
          >
            <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
              No Dealerships Match Your Filter Criteria
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              We could not find any authorized dealerships matching your active marque, city, or service filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary">
              <RotateCcw size={15} /> Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
