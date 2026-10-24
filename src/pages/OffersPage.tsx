// AutoVerse Stage 22: Dealer Offers & Verified Specials Hub
// Responsive automotive marketplace for manufacturer discounts, dealer specials, exchange bonuses, and promotional APR.

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Tag,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  ChevronRight,
  Calculator,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { getActiveOffers, EVENT_OFFERS_UPDATED } from '../utils/financeStore';
import type { VehicleOffer, OfferCategory, VehicleConditionScope } from '../types/offers';
import { INITIAL_DEALERSHIPS } from '../data/dealers';
import { VEHICLES } from '../data/vehicles';

const CATEGORIES: { id: OfferCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Specials', icon: '✨' },
  { id: 'promotional_financing', label: 'Low APR Finance', icon: '📉' },
  { id: 'exchange_bonus', label: 'Exchange Bonuses', icon: '🔄' },
  { id: 'accessory_package', label: 'Accessory Packs', icon: '🎁' },
  { id: 'manufacturer_discount', label: 'OEM Discounts', icon: '🏷️' },
  { id: 'dealer_discount', label: 'Dealer Specials', icon: '🏢' },
  { id: 'loyalty_benefit', label: 'Loyalty Rewards', icon: '👑' },
  { id: 'corporate_discount', label: 'Corporate Schemes', icon: '💼' },
];

export const OffersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameter bindings
  const searchQ = searchParams.get('q') || '';
  const categoryQ = (searchParams.get('category') as OfferCategory | 'all') || 'all';
  const vehicleQ = searchParams.get('vehicle') || 'all';
  const dealerQ = searchParams.get('dealer') || 'all';
  const regionQ = searchParams.get('region') || 'all';
  const conditionQ = (searchParams.get('condition') as VehicleConditionScope | 'all') || 'all';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const sortBy = (searchParams.get('sort') as 'benefit_desc' | 'benefit_asc' | 'expiring_soon' | 'newest') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener for multi-tab updates
  useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener(EVENT_OFFERS_UPDATED, handleUpdate);
    return () => window.removeEventListener(EVENT_OFFERS_UPDATED, handleUpdate);
  }, []);

  // Fetch filtered offers from store
  const { offers, total, totalPages } = useMemo(() => {
    return getActiveOffers({
      search: searchQ,
      category: categoryQ,
      vehicleId: vehicleQ !== 'all' ? vehicleQ : undefined,
      dealerId: dealerQ !== 'all' ? dealerQ : undefined,
      region: regionQ !== 'all' ? regionQ : undefined,
      vehicleCondition: conditionQ !== 'all' ? conditionQ : undefined,
      verificationStatus: verifiedOnly ? 'verified' : 'all',
      sortBy,
      page,
      limit: 9,
    });
  }, [searchQ, categoryQ, vehicleQ, dealerQ, regionQ, conditionQ, verifiedOnly, sortBy, page, dataVersion]);

  // Helper to update search params
  const updateQuery = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setFilterModalOpen(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQ) count++;
    if (categoryQ !== 'all') count++;
    if (vehicleQ !== 'all') count++;
    if (dealerQ !== 'all') count++;
    if (regionQ !== 'all') count++;
    if (conditionQ !== 'all') count++;
    if (verifiedOnly) count++;
    return count;
  }, [searchQ, categoryQ, vehicleQ, dealerQ, regionQ, conditionQ, verifiedOnly]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: '5rem',
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          position: 'relative',
          padding: '6rem 1.5rem 3.5rem',
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(37,99,235,0.18), transparent 70%), #05070a',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.28)',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#60a5fa',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Tag size={14} />
            <span>Official Automotive Incentive Desk</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 1rem',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dealer Offers & Smart Specials
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            Compare verified manufacturer discounts, dealership exchange bonuses, loyalty programs, and subsidized promotional APR rates directly linked to our dealer network.
          </p>

          {/* Search Bar & Filter Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              maxWidth: '780px',
              margin: '0 auto',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'relative',
                flex: '1 1 300px',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                id="offer-search-input"
                type="text"
                placeholder="Search by vehicle, model, dealer, or city..."
                value={searchQ}
                onChange={(e) => updateQuery('q', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 2.85rem',
                  backgroundColor: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQ && (
                <button
                  type="button"
                  onClick={() => updateQuery('q', null)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              id="open-filters-modal-btn"
              type="button"
              onClick={() => setFilterModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.4rem',
                backgroundColor: activeFilterCount > 0 ? '#1d4ed8' : 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Filter size={17} />
              <span>All Filters</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1d4ed8',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            <Link
              to="/financing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.4rem',
                backgroundColor: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px',
                color: '#34d399',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Calculator size={17} />
              <span>EMI Calculator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Quick Category Chips */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '1.75rem',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = categoryQ === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateQuery('category', cat.id === 'all' ? null : cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#2563eb' : 'rgba(30,41,59,0.5)',
                  border: `1px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Bar & Sort Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
              Showing {total} {total === 1 ? 'verified offer' : 'verified offers'}
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Reset filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ArrowUpDown size={15} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateQuery('sort', e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                padding: '0.45rem 0.8rem',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Recently Sourced</option>
              <option value="benefit_desc">Highest Benefit Amount</option>
              <option value="benefit_asc">Lowest Benefit Amount</option>
              <option value="expiring_soon">Expiring Soonest</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {offers.length === 0 ? (
          <div
            style={{
              padding: '5rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(15,23,42,0.4)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              No Active Offers Matching Your Criteria
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              We do not fabricate dealer discounts or artificial promotional rates. Only genuine, verified dealer-authorized bulletins are displayed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear All Filters
              </button>
              <Link
                to="/dealers"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(30,41,59,0.7)',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                Browse Dealerships
              </Link>
            </div>
          </div>
        ) : (
          /* Offers Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '3.5rem',
            }}
          >
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateQuery('page', String(p))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: isCurrent ? '#2563eb' : 'rgba(30,41,59,0.6)',
                    border: `1px solid ${isCurrent ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Comprehensive Filter Modal */}
      {filterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={20} style={{ color: '#60a5fa' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Filter Verified Offers</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Vehicle Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Specific Vehicle Model
                </label>
                <select
                  value={vehicleQ}
                  onChange={(e) => updateQuery('vehicle', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="all">All Vehicles</option>
                  {VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.modelYear || v.year} {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dealership Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Dealership Provider
                </label>
                <select
                  value={dealerQ}
                  onChange={(e) => updateQuery('dealer', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="all">All Participating Dealerships</option>
                  {INITIAL_DEALERSHIPS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.address.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Geographic Region
                </label>
                <select
                  value={regionQ}
                  onChange={(e) => updateQuery('region', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="all">All Regions & Nationwide</option>
                  <option value="Maharashtra">Maharashtra / Mumbai</option>
                  <option value="Karnataka">Karnataka / Bengaluru</option>
                  <option value="Telangana">Telangana / Hyderabad</option>
                  <option value="Germany">Germany / European Union</option>
                  <option value="California">California, United States</option>
                </select>
              </div>

              {/* Vehicle Condition */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Vehicle Status Scope
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { id: 'all', label: 'All Inventory' },
                    { id: 'new_car', label: 'Brand New Vehicles' },
                    { id: 'used_car', label: 'Pre-Owned Inventory' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateQuery('condition', c.id)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.5rem',
                        borderRadius: '8px',
                        backgroundColor: conditionQ === c.id ? '#2563eb' : 'rgba(30,41,59,0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Only Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1rem',
                  backgroundColor: 'rgba(30,41,59,0.4)',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    Verified Dealer Bulletins Only
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Exclude self-reported or unconfirmed schemes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => updateQuery('verified', e.target.checked ? 'true' : null)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94a3b8',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                style={{
                  flex: 2,
                  padding: '0.8rem',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Show Results ({total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// CHILD COMPONENT: Premium Vehicle Offer Card
// -------------------------------------------------------------

interface OfferCardProps {
  offer: VehicleOffer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const isVerified = offer.verificationStatus === 'verified';
  const isPromoApr = offer.category === 'promotional_financing';

  // Calculate days left
  const daysLeft = useMemo(() => {
    const today = new Date();
    const expiry = new Date(offer.validUntil);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [offer.validUntil]);

  return (
    <div
      style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      className="offer-card"
    >
      {/* Card Header & Media */}
      <div style={{ position: 'relative', height: '190px', backgroundColor: '#020617' }}>
        <img
          src={offer.vehicleImage || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'}
          alt={offer.vehicleTitle}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,15,29,0.95) 0%, rgba(10,15,29,0.2) 60%, transparent 100%)',
          }}
        />

        {/* Category & Verified Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              backgroundColor: isPromoApr ? 'rgba(59,130,246,0.9)' : 'rgba(15,23,42,0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {offer.category.replace('_', ' ')}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: isVerified ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
            }}
          >
            {isVerified ? <ShieldCheck size={13} /> : <Clock size={13} />}
            <span>{isVerified ? 'Verified' : 'Pending'}</span>
          </span>
        </div>

        {/* Highlight Benefit Callout */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '1rem',
            right: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {offer.benefitFormatted}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            margin: '0 0 0.4rem',
            color: '#f8fafc',
            lineHeight: 1.4,
          }}
        >
          {offer.title}
        </h4>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.82rem',
            color: '#94a3b8',
            marginBottom: '0.75rem',
          }}
        >
          <Building2 size={14} style={{ color: '#60a5fa' }} />
          <span>{offer.dealerName}</span>
          <span>•</span>
          <span>{offer.dealerCity}</span>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            margin: '0 0 1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {offer.tagline || offer.description}
        </p>

        {/* Offer Validity & Region Meta */}
        <div
          style={{
            padding: '0.65rem 0.75rem',
            backgroundColor: 'rgba(15,23,42,0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
            <Calendar size={13} />
            <span>Valid till {offer.validUntil}</span>
          </div>

          {daysLeft > 0 && daysLeft <= 15 ? (
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{daysLeft} days left</span>
          ) : (
            <span style={{ color: '#64748b' }}>{offer.isNationwide ? 'Nationwide' : offer.region.split('/')[0]}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link
            to={`/offers/${offer.slug}`}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.7rem 0.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <span>Offer Details</span>
            <ChevronRight size={15} />
          </Link>

          <Link
            to={`/financing/${offer.vehicleId}`}
            title="Calculate Loan & EMI for this vehicle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.7rem 0.85rem',
              backgroundColor: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#34d399',
              borderRadius: '9px',
              textDecoration: 'none',
            }}
          >
            <Calculator size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
