// AutoVerse Stage 21: Used-Car Marketplace Hub
// Premium verified pre-owned vehicle exploration, multi-criteria filtering, and live search.

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  PlusCircle,
  Bookmark,
  Car,
  Fuel,
  Gauge,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowUpDown,
  Building2,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  filterListings,
  isListingSaved,
  toggleSaveListing,
  formatMarketplacePrice,
} from '../utils/marketplaceStore';
import { useAuth } from '../context/AuthContext';
import type { MarketplaceListing, MarketplaceFilterParams } from '../types/marketplace';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest_user';

  // Read URL search params
  const initialSearch = searchParams.get('q') || '';
  const initialMake = searchParams.get('make') || 'all';
  const initialBody = searchParams.get('body') || 'all';
  const initialFuel = searchParams.get('fuel') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialSort = (searchParams.get('sort') as MarketplaceFilterParams['sortBy']) || 'newest';
  const initialMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const initialMaxMileage = searchParams.get('maxMileage') ? Number(searchParams.get('maxMileage')) : undefined;

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedBody, setSelectedBody] = useState(initialBody);
  const [selectedFuel, setSelectedFuel] = useState(initialFuel);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [sortBy, setSortBy] = useState<MarketplaceFilterParams['sortBy']>(initialSort);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [maxMileage, setMaxMileage] = useState<number | undefined>(initialMaxMileage);
  const [page, setPage] = useState(1);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state into URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedMake !== 'all') params.make = selectedMake;
    if (selectedBody !== 'all') params.body = selectedBody;
    if (selectedFuel !== 'all') params.fuel = selectedFuel;
    if (selectedCity !== 'all') params.city = selectedCity;
    if (sortBy && sortBy !== 'newest') params.sort = sortBy;
    if (minPrice) params.minPrice = String(minPrice);
    if (maxPrice) params.maxPrice = String(maxPrice);
    if (maxMileage) params.maxMileage = String(maxMileage);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedMake, selectedBody, selectedFuel, selectedCity, sortBy, minPrice, maxPrice, maxMileage, setSearchParams]);

  // Execute query filtering
  const queryResult = useMemo(() => {
    return filterListings({
      search: searchTerm,
      make: selectedMake,
      bodyType: selectedBody,
      fuelType: selectedFuel,
      city: selectedCity,
      minPrice,
      maxPrice,
      maxMileage,
      sortBy,
      page,
      pageSize: 12,
    });
  }, [searchTerm, selectedMake, selectedBody, selectedFuel, selectedCity, minPrice, maxPrice, maxMileage, sortBy, page]);

  // Load saved listings state
  useEffect(() => {
    const ids = new Set<string>();
    queryResult.listings.forEach((l) => {
      if (isListingSaved(userId, l.id)) ids.add(l.id);
    });
    setSavedListingIds(ids);
  }, [queryResult.listings, userId]);

  const handleToggleSave = (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = toggleSaveListing(userId, listingId);
    setSavedListingIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(listingId);
      else next.delete(listingId);
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMake('all');
    setSelectedBody('all');
    setSelectedFuel('all');
    setSelectedCity('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMaxMileage(undefined);
    setSortBy('newest');
    setPage(1);
  };

  const activeFiltersCount = [
    selectedMake !== 'all',
    selectedBody !== 'all',
    selectedFuel !== 'all',
    selectedCity !== 'all',
    Boolean(minPrice),
    Boolean(maxPrice),
    Boolean(maxMileage),
    Boolean(searchTerm),
  ].filter(Boolean).length;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#ffffff' }}>
      {/* 1. HERO BANNER */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 1rem 3.5rem',
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0, 240, 255, 0.15) 0%, rgba(7, 9, 13, 0) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Pre-Owned Marketplace</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '0.04em',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            BUY & SELL <span className="gradient-text">PRE-OWNED PERFORMANCE</span>
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            Curated pre-owned luxury, sports, and electric vehicles. Transparent seller condition disclosures,
            declared imperfections, full OEM service records, and direct buyer communication.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/sell-car"
              className="btn-glow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                padding: '0.75rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
              }}
            >
              <PlusCircle size={18} />
              <span>Sell Your Car</span>
            </Link>

            <Link
              to="/saved-listings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              <Bookmark size={16} color="var(--accent-cyan)" />
              <span>Saved Listings</span>
            </Link>

            <Link
              to="/my-listings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              <Car size={16} color="#10b981" />
              <span>Seller Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CONTROLS STRIP */}
      <section style={{ padding: '2rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(12, 16, 23, 0.6)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search by make, model, variant, or city (e.g. Taycan, Mumbai, M3)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as MarketplaceFilterParams['sortBy']);
                  setPage(1);
                }}
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="newest">Recently Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage_asc">Lowest Mileage</option>
                <option value="year_desc">Newest Model Year</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.2rem',
                backgroundColor: activeFiltersCount > 0 ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-secondary)',
                border: activeFiltersCount > 0 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                color: activeFiltersCount > 0 ? 'var(--accent-cyan)' : '#ffffff',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              <Filter size={16} />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1.25rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {['all', 'Porsche', 'Tesla', 'BMW', 'Mahindra', 'Tata', 'Audi'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  setSelectedMake(brand);
                  setPage(1);
                }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  backgroundColor: selectedMake === brand ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedMake === brand ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                  color: selectedMake === brand ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {brand === 'all' ? 'All Makes' : brand}
              </button>
            ))}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 0.25rem' }} />

            {['all', 'sedan', 'suv', 'coupe'].map((body) => (
              <button
                key={body}
                type="button"
                onClick={() => {
                  setSelectedBody(body);
                  setPage(1);
                }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  backgroundColor: selectedBody === body ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedBody === body ? '1px solid #10b981' : '1px solid var(--border-medium)',
                  color: selectedBody === body ? '#10b981' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {body === 'all' ? 'All Bodies' : body}
              </button>
            ))}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 0.25rem' }} />

            {['all', 'electric', 'petrol', 'diesel'].map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => {
                  setSelectedFuel(fuel);
                  setPage(1);
                }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  backgroundColor: selectedFuel === fuel ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedFuel === fuel ? '1px solid #38bdf8' : '1px solid var(--border-medium)',
                  color: selectedFuel === fuel ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {fuel === 'all' ? 'All Powertrains' : fuel}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EXPANDABLE FILTER MODAL / DRAWER (Desktop & Mobile) */}
      {showMobileFilters && (
        <div
          style={{
            backgroundColor: 'rgba(9, 13, 20, 0.98)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.5rem 1rem',
          }}
        >
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Detailed Search Filters</div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {/* City */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  City / Region
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Cities</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="san francisco">San Francisco</option>
                  <option value="munich">Munich</option>
                  <option value="stuttgart">Stuttgart</option>
                </select>
              </div>

              {/* Max Mileage */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Max Mileage (km)
                </label>
                <select
                  value={maxMileage || ''}
                  onChange={(e) => {
                    setMaxMileage(e.target.value ? Number(e.target.value) : undefined);
                    setPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="">Any Mileage</option>
                  <option value="10000">Under 10,000 km</option>
                  <option value="25000">Under 25,000 km</option>
                  <option value="50000">Under 50,000 km</option>
                  <option value="100000">Under 100,000 km</option>
                </select>
              </div>

              {/* Max Asking Price */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Budget Ceiling
                </label>
                <select
                  value={maxPrice || ''}
                  onChange={(e) => {
                    setMaxPrice(e.target.value ? Number(e.target.value) : undefined);
                    setPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="">Any Budget</option>
                  <option value="2500000">Under ₹25 Lakh</option>
                  <option value="5000000">Under ₹50 Lakh</option>
                  <option value="10000000">Under ₹1 Crore</option>
                  <option value="20000000">Under ₹2 Crore</option>
                  <option value="100000">Under $100,000 USD</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '0.6rem 1.2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-muted)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                style={{
                  padding: '0.6rem 1.4rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Apply ({queryResult.total} Results)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. LISTINGS GRID */}
      <section style={{ padding: '2.5rem 1rem 5rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header count bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Available Verified Listings
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing {queryResult.listings.length} of {queryResult.total} active vehicles
              </div>
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {queryResult.listings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4.5rem 1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <Car size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                No vehicles matched your filter criteria
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                Try adjusting your budget, removing specific make restrictions, or resetting all filters to view our full pre-owned inventory.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '0.7rem 1.4rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {queryResult.listings.map((listing: MarketplaceListing) => {
                const isSaved = savedListingIds.has(listing.id);
                return (
                  <Link
                    key={listing.id}
                    to={`/used-cars/${listing.slug}`}
                    style={{
                      textDecoration: 'none',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Image Container with Badges */}
                    <div style={{ position: 'relative', height: '210px', backgroundColor: '#05070a', overflow: 'hidden' }}>
                      <img
                        src={listing.featuredImage || listing.images[0]}
                        alt={`${listing.year} ${listing.make} ${listing.model}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />

                      {/* Bookmark Save Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, listing.id)}
                        aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(9, 13, 20, 0.75)',
                          backdropFilter: 'blur(8px)',
                          border: isSaved ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          zIndex: 2,
                        }}
                      >
                        <Bookmark
                          size={16}
                          color={isSaved ? 'var(--accent-cyan)' : '#ffffff'}
                          fill={isSaved ? 'var(--accent-cyan)' : 'none'}
                        />
                      </button>

                      {/* Verified & Seller Badges */}
                      <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                        {listing.sellerType === 'dealer' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(16, 185, 129, 0.85)',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            <Building2 size={12} />
                            Verified Dealer
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.85)',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            <User size={12} />
                            Individual Owner
                          </span>
                        )}

                        {listing.serviceHistory === 'full_oem' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(0, 240, 255, 0.85)',
                              color: '#07090d',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                            }}
                          >
                            <CheckCircle2 size={12} />
                            OEM History
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Title & Variant */}
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                          {listing.year} {listing.make} {listing.model}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {listing.variant}
                        </div>
                      </div>

                      {/* Price */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.45rem',
                            fontWeight: 900,
                            color: '#ffffff',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {formatMarketplacePrice(listing.askingPrice, listing.currency)}
                        </div>
                      </div>

                      {/* Key Specs Pills Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Gauge size={14} color="var(--accent-cyan)" />
                          <span>{listing.mileageKm.toLocaleString()} km</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Fuel size={14} color="#10b981" />
                          <span style={{ textTransform: 'capitalize' }}>{listing.fuelType}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={14} color="#f59e0b" />
                          <span>{listing.locationCity}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} color="#38bdf8" />
                          <span>{listing.previousOwners} Owner{listing.previousOwners > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Condition snippet */}
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          marginTop: 'auto',
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '0.65rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <strong style={{ color: '#ffffff' }}>Condition:</strong> {listing.declaredDefects}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 5. PAGINATION */}
          {queryResult.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '3rem',
              }}
            >
              {Array.from({ length: queryResult.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: page === p ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                    color: page === p ? '#07090d' : '#ffffff',
                    border: page === p ? 'none' : '1px solid var(--border-medium)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
