// AutoVerse Stage 18: Current Vehicle Price Explorer
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Download,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { getAllPriceRecords } from '../utils/marketStore';
import { generatePriceExplorerCsv } from '../utils/marketService';
import { formatCurrency } from '../utils/tcoCalculator';
import type { CurrencyCode } from '../types/calculator';
import { VEHICLES } from '../data/vehicles';

export const PriceExplorerPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPowertrain, setSelectedPowertrain] = useState<string>('all');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | 'all'>('all');
  const [selectedPriceType, setSelectedPriceType] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const allRecords = getAllPriceRecords();

  // Extract unique brands for filter
  const brands = useMemo(() => {
    return Array.from(new Set(allRecords.map((r) => r.brand))).sort();
  }, [allRecords]);

  // Filter pipeline
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      // Status active or launch
      if (r.status === 'withdrawn') return false;

      // Query
      if (query.trim()) {
        const q = query.toLowerCase();
        const match =
          r.vehicleName.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.variant.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Brand
      if (selectedBrand !== 'all' && r.brand !== selectedBrand) return false;

      // Powertrain
      if (selectedPowertrain !== 'all' && r.powertrain !== selectedPowertrain) return false;

      // Body Type
      if (selectedBodyType !== 'all' && r.bodyType !== selectedBodyType) return false;

      // Market
      if (selectedMarket !== 'all' && r.market !== selectedMarket) return false;

      // Currency
      if (selectedCurrency !== 'all' && r.currency !== selectedCurrency) return false;

      // Price Type
      if (selectedPriceType !== 'all' && r.priceType !== selectedPriceType) return false;

      // Max Price
      if (maxPriceFilter > 0 && r.amount > maxPriceFilter) return false;

      return true;
    });
  }, [
    allRecords,
    query,
    selectedBrand,
    selectedPowertrain,
    selectedBodyType,
    selectedMarket,
    selectedCurrency,
    selectedPriceType,
    maxPriceFilter,
  ]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedBrand('all');
    setSelectedPowertrain('all');
    setSelectedBodyType('all');
    setSelectedMarket('all');
    setSelectedCurrency('all');
    setSelectedPriceType('all');
    setMaxPriceFilter(0);
  };

  // CSV Export with Formula Injection Protection
  const handleExportCsv = () => {
    const summary = `Brand=${selectedBrand}, Powertrain=${selectedPowertrain}, Currency=${selectedCurrency}`;
    const csvData = generatePriceExplorerCsv(filteredRecords, summary);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autoverse_prices_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to retrieve vehicle image from catalog
  const getVehicleThumbnail = (slug: string) => {
    const v = VEHICLES.find((car) => car.id === slug || car.slug === slug);
    return v?.thumbnail || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
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
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <Link to="/market-intelligence" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Market Intelligence
          </Link>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Price Explorer</span>
        </div>

        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              <TrendingUp size={14} />
              <span>Verified Automotive Price Observations</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#ffffff', fontWeight: 900 }}>
              Current Vehicle Price Explorer
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Filter ex-showroom, dealer listed, and launch observations across verified AutoVerse models.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '0.2rem',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                style={{
                  padding: '0.4rem 0.6rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'grid' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Tabular Data View"
                style={{
                  padding: '0.4rem 0.6rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'table' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <TableIcon size={16} />
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
              title="Export filtered price records to secure CSV"
            >
              <Download size={15} />
              <span>Export CSV ({filteredRecords.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search
              size={18}
              color="var(--accent-cyan)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by vehicle name, manufacturer, model, or variant..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.85rem',
                backgroundColor: '#0c1017',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Select Filter Dropdowns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            {/* Manufacturer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Manufacturer
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="all">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b} value={b} style={{ backgroundColor: '#0c1017' }}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Powertrain */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Powertrain
              </label>
              <select
                value={selectedPowertrain}
                onChange={(e) => setSelectedPowertrain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="all">All Powertrains</option>
                <option value="electric" style={{ backgroundColor: '#0c1017' }}>Pure Electric (BEV)</option>
                <option value="hybrid" style={{ backgroundColor: '#0c1017' }}>Hybrid</option>
                <option value="plug-in hybrid" style={{ backgroundColor: '#0c1017' }}>Plug-in Hybrid (PHEV)</option>
                <option value="petrol" style={{ backgroundColor: '#0c1017' }}>Petrol</option>
                <option value="diesel" style={{ backgroundColor: '#0c1017' }}>Diesel</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Body Style
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="all">All Body Styles</option>
                <option value="suv" style={{ backgroundColor: '#0c1017' }}>SUV / Crossover</option>
                <option value="sedan" style={{ backgroundColor: '#0c1017' }}>Sedan</option>
                <option value="coupe" style={{ backgroundColor: '#0c1017' }}>Coupe / Sports</option>
                <option value="estate" style={{ backgroundColor: '#0c1017' }}>Estate / MPV</option>
                <option value="hatchback" style={{ backgroundColor: '#0c1017' }}>Hatchback</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="all">All Currencies</option>
                <option value="USD" style={{ backgroundColor: '#0c1017' }}>USD ($)</option>
                <option value="INR" style={{ backgroundColor: '#0c1017' }}>INR (₹)</option>
                <option value="EUR" style={{ backgroundColor: '#0c1017' }}>EUR (€)</option>
                <option value="GBP" style={{ backgroundColor: '#0c1017' }}>GBP (£)</option>
              </select>
            </div>

            {/* Price Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Price Type
              </label>
              <select
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0c1017',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="all">All Types</option>
                <option value="ex_showroom" style={{ backgroundColor: '#0c1017' }}>Ex-Showroom / Listed</option>
                <option value="launch_price" style={{ backgroundColor: '#0c1017' }}>Verified Launch Price</option>
                <option value="dealer_listed" style={{ backgroundColor: '#0c1017' }}>Dealer Listed</option>
                <option value="estimated_on_road" style={{ backgroundColor: '#0c1017' }}>Estimated On-Road</option>
              </select>
            </div>
          </div>

          {/* Reset Filters & Result Count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--accent-cyan)' }}>{filteredRecords.length}</strong> verified price observation{filteredRecords.length === 1 ? '' : 's'}
            </span>

            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* Results Presentation */}
        {filteredRecords.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-medium)',
            }}
          >
            <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
              No Price Observations Match Your Criteria
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Try loosening your filters or resetting your search to explore the full verified AutoVerse catalog.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Card Grid View */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredRecords.map((r) => {
              const thumbnail = getVehicleThumbnail(r.vehicleSlug);

              return (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {/* Image header */}
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={thumbnail}
                      alt={r.vehicleName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        display: 'flex',
                        gap: '0.4rem',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.bodyType}
                      </span>

                      {r.powertrain === 'electric' && (
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0, 240, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--accent-cyan)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          BEV
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor:
                            r.priceType === 'launch_price'
                              ? 'rgba(245, 158, 11, 0.85)'
                              : 'rgba(16, 185, 129, 0.85)',
                          color: '#07090d',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.priceType === 'launch_price' ? 'Launch Price' : 'Active Listed'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {r.brand} • {r.market}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800, margin: '0.25rem 0 0.25rem' }}>
                        {r.vehicleName}
                      </h3>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Trim: {r.variant}
                      </p>

                      {/* Price Section */}
                      <div
                        style={{
                          padding: '0.85rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                          {r.taxBasis.replace('_', ' ').toUpperCase()} BASIS
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                          {formatCurrency(r.amount, r.currency)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Effective: {r.effectiveDate} • Verified: {r.verificationDate}
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/market-intelligence/vehicles/${r.vehicleSlug}`}
                          className="btn btn-primary"
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                        >
                          <span>Price History</span>
                          <ArrowRight size={13} />
                        </Link>

                        <Link
                          to={`/cars/${r.vehicleSlug}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                          title="View Full Vehicle Details"
                        >
                          Specs
                        </Link>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.72rem' }}>
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>Source: {r.sourceName.slice(0, 24)}...</span>
                          <ExternalLink size={11} />
                        </a>

                        <Link
                          to={`/ownership-calculator`}
                          style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          TCO Math
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tabular Data View */
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Vehicle</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Variant</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Market</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Powertrain</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Price Type</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Effective</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#ffffff' }}>
                      <Link to={`/market-intelligence/vehicles/${r.vehicleSlug}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                        {r.vehicleName}
                      </Link>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {r.variant}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {r.market}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: r.powertrain === 'electric' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: r.powertrain === 'electric' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {r.powertrain}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {r.priceType.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {r.effectiveDate}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/market-intelligence/vehicles/${r.vehicleSlug}`}
                        style={{
                          color: 'var(--accent-cyan)',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <span>Dossier</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
