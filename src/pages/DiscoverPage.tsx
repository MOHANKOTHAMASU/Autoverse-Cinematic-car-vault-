import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleSpecModal } from '../components/VehicleSpecModal';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialManufacturer = searchParams.get('manufacturer') || 'all';
  const initialBody = searchParams.get('body') || 'all';
  const initialPowertrain = searchParams.get('powertrain') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedManufacturer, setSelectedManufacturer] = useState(initialManufacturer);
  const [selectedBodyType, setSelectedBodyType] = useState(initialBody);
  const [selectedPowertrain, setSelectedPowertrain] = useState(initialPowertrain);
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'accel' | 'power' | 'range' | 'priceAsc' | 'priceDesc' | 'launchDate'>('accel');

  // Pagination state - updated for Top 50 collection
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal & Save states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [savedVehicleIds, setSavedVehicleIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state when URL params change externally
  useEffect(() => {
    const m = searchParams.get('manufacturer');
    if (m && m !== selectedManufacturer) {
      setSelectedManufacturer(m);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const manufacturerOptions = [
    { id: 'all', label: 'All Marques' },
    { id: 'tata', label: 'Tata Motors' },
    { id: 'mahindra', label: 'Mahindra' },
    { id: 'maruti-suzuki', label: 'Maruti Suzuki' },
    { id: 'hyundai', label: 'Hyundai' },
    { id: 'kia', label: 'Kia' },
    { id: 'toyota', label: 'Toyota' },
    { id: 'honda', label: 'Honda' },
    { id: 'mg', label: 'MG' },
    { id: 'byd', label: 'BYD' },
    { id: 'tesla', label: 'Tesla' },
    { id: 'porsche', label: 'Porsche' },
    { id: 'bmw', label: 'BMW' },
    { id: 'mercedes-benz', label: 'Mercedes-Benz' },
    { id: 'audi', label: 'Audi' },
    { id: 'land-rover', label: 'Land Rover' },
  ];

  const bodyTypeOptions: { id: string; label: string }[] = [
    { id: 'all', label: 'All Body Styles' },
    { id: 'suv', label: 'SUV & Compact SUV' },
    { id: 'sedan', label: 'Sedan' },
    { id: 'coupe', label: 'Coupe & Coupé SUV' },
    { id: 'hatchback', label: 'Hatchback & Crossover' },
    { id: 'estate', label: 'MPV & Estate' },
    { id: 'sports_car', label: 'Sports Car' },
  ];

  const powertrainOptions: { id: string; label: string }[] = [
    { id: 'all', label: 'All Powertrains' },
    { id: 'electric', label: 'All-Electric (BEV)' },
    { id: 'hybrid', label: 'Strong Hybrid (HEV)' },
    { id: 'plug-in hybrid', label: 'Plug-in Hybrid (PHEV)' },
    { id: 'petrol', label: 'Turbo / Naturally Aspirated Petrol' },
    { id: 'diesel', label: 'Common-Rail Turbo Diesel' },
  ];

  const marketOptions = [
    { id: 'all', label: 'All Markets' },
    { id: 'india', label: 'Indian Market Focus' },
    { id: 'global', label: 'Global / US / European Spec' },
  ];

  const yearOptions = [
    { id: 'all', label: 'All Model Years' },
    { id: '2024', label: '2024 Production' },
    { id: '2025', label: '2025 Production & Concepts' },
  ];

  const priceOptions = [
    { id: 'all', label: 'All Price Tiers' },
    { id: 'under-25k', label: 'Under $25,000 USD' },
    { id: '25k-50k', label: '$25,000 – $50,000 USD' },
    { id: '50k-100k', label: '$50,000 – $100,000 USD' },
    { id: 'above-100k', label: '$100,000+ USD Luxury & Supercars' },
  ];

  // Multi-facet filtering logic
  const filteredVehicles = useMemo(() => {
    return VEHICLES.filter((v) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesBrand = v.brand.toLowerCase().includes(query);
        const matchesModel = v.model.toLowerCase().includes(query);
        const matchesVariant = v.variant.toLowerCase().includes(query);
        const matchesPowertrain = v.powertrain.toLowerCase().includes(query);
        const matchesBody = v.bodyType.toLowerCase().includes(query);
        const matchesEngine = (v.specs?.engineType || '').toLowerCase().includes(query);
        if (!matchesBrand && !matchesModel && !matchesVariant && !matchesPowertrain && !matchesBody && !matchesEngine) {
          return false;
        }
      }

      // 2. Manufacturer
      if (selectedManufacturer !== 'all') {
        const brandSlug = v.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (v.manufacturerId !== selectedManufacturer && brandSlug !== selectedManufacturer) {
          return false;
        }
      }

      // 3. Body Style
      if (selectedBodyType !== 'all') {
        if (v.bodyType !== selectedBodyType) return false;
      }

      // 4. Powertrain
      if (selectedPowertrain !== 'all') {
        if (v.powertrain !== selectedPowertrain) return false;
      }

      // 5. Model Year
      if (selectedYear !== 'all') {
        if (String(v.modelYear || v.year) !== selectedYear) return false;
      }

      // 5. Market Region
      if (selectedMarket !== 'all') {
        const isIndia = (v.market || '').toLowerCase().includes('india');
        if (selectedMarket === 'india' && !isIndia) return false;
        if (selectedMarket === 'global' && isIndia && !(v.market || '').toLowerCase().includes('global')) return false;
      }

      // 6. Price Range
      if (selectedPriceRange !== 'all') {
        const price = v.price || v.priceStartingUsd || 0;
        if (selectedPriceRange === 'under-25k' && price >= 25000) return false;
        if (selectedPriceRange === '25k-50k' && (price < 25000 || price > 50000)) return false;
        if (selectedPriceRange === '50k-100k' && (price < 50000 || price > 100000)) return false;
        if (selectedPriceRange === 'above-100k' && price < 100000) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting logic handles missing fields safely
      if (sortBy === 'nameAsc') {
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      }
      if (sortBy === 'nameDesc') {
        return `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`);
      }
      if (sortBy === 'accel') {
        const aVal = a.accelerationSeconds || a.specs?.acceleration0to60 || 99;
        const bVal = b.accelerationSeconds || b.specs?.acceleration0to60 || 99;
        return aVal - bVal; // lowest seconds first
      }
      if (sortBy === 'power') {
        const aVal = a.horsepower || a.specs?.horsepower || 0;
        const bVal = b.horsepower || b.specs?.horsepower || 0;
        return bVal - aVal;
      }
      if (sortBy === 'range') {
        const aVal = a.electricRangeMiles || a.specs?.electricRangeMiles || 0;
        const bVal = b.electricRangeMiles || b.specs?.electricRangeMiles || 0;
        return bVal - aVal;
      }
      if (sortBy === 'priceAsc') {
        const aVal = a.price || a.priceStartingUsd || 0;
        const bVal = b.price || b.priceStartingUsd || 0;
        return aVal - bVal;
      }
      if (sortBy === 'priceDesc') {
        const aVal = a.price || a.priceStartingUsd || 0;
        const bVal = b.price || b.priceStartingUsd || 0;
        return bVal - aVal;
      }
      if (sortBy === 'launchDate') {
        return (b.modelYear || 2024) - (a.modelYear || 2024);
      }
      return 0;
    });
  }, [
    searchTerm,
    selectedManufacturer,
    selectedBodyType,
    selectedPowertrain,
    selectedMarket,
    selectedYear,
    selectedPriceRange,
    sortBy,
  ]);

  // Pagination calculation
  const totalItems = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + pageSize);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedManufacturer('all');
    setSelectedBodyType('all');
    setSelectedPowertrain('all');
    setSelectedMarket('all');
    setSelectedYear('all');
    setSelectedPriceRange('all');
    setSortBy('accel');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleToggleSave = (vehicle: Vehicle) => {
    setSavedVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicle.id)) {
        next.delete(vehicle.id);
        showToast(`Removed ${vehicle.model} from Garage`);
      } else {
        next.add(vehicle.id);
        showToast(`Saved ${vehicle.model} to Garage`);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Determine active filter badges
  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (searchTerm) {
    activeFilters.push({ label: `Search: "${searchTerm}"`, onRemove: () => setSearchTerm('') });
  }
  if (selectedManufacturer !== 'all') {
    activeFilters.push({
      label: `Marque: ${selectedManufacturer.toUpperCase()}`,
      onRemove: () => {
        setSelectedManufacturer('all');
        const p = new URLSearchParams(searchParams);
        p.delete('manufacturer');
        setSearchParams(p);
      },
    });
  }
  if (selectedBodyType !== 'all') {
    activeFilters.push({
      label: `Body: ${selectedBodyType.toUpperCase()}`,
      onRemove: () => setSelectedBodyType('all'),
    });
  }
  if (selectedPowertrain !== 'all') {
    activeFilters.push({
      label: `Powertrain: ${selectedPowertrain.toUpperCase()}`,
      onRemove: () => setSelectedPowertrain('all'),
    });
  }
  if (selectedYear !== 'all') {
    activeFilters.push({ label: `Year: ${selectedYear}`, onRemove: () => setSelectedYear('all') });
  }
  if (selectedPriceRange !== 'all') {
    activeFilters.push({
      label: `Tier: ${priceOptions.find((p) => p.id === selectedPriceRange)?.label || selectedPriceRange}`,
      onRemove: () => setSelectedPriceRange('all'),
    });
  }

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
        {/* Page Heading & Editorial Introduction */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge badge-cyan">
              <Sparkles size={12} /> COMPLETE FLEET REGISTRY
            </span>
            <span className="badge badge-verified">
              VERIFIED HOMOLOGATED TELEMETRY
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
            Discover Your Next Machine
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.15rem',
              maxWidth: '780px',
              lineHeight: 1.65,
            }}
          >
            Explore the frontier of high-performance automotive engineering. Filter by
            manufacturer, body topology, propulsion architecture, and certified acceleration
            records verified to official manufacturer datasheets.
          </p>
        </div>

        {/* Stage 9 Smart Car Finder Banner */}
        <div
          className="card-glass"
          style={{
            padding: '1.25rem 1.75rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                Unsure which vehicle fits your lifestyle and budget?
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Try our guided Smart Car Finder wizard with transparent multi-factor preference matching.
              </span>
            </div>
          </div>
          <Link
            to="/car-finder"
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            Launch Car Finder
            <Sparkles size={14} />
          </Link>
        </div>

        {/* Comprehensive Filter Control Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Top Search Bar & Sort Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.75rem 1.15rem',
                flex: 1,
                minWidth: '280px',
              }}
            >
              <Search size={18} color="var(--accent-cyan)" />
              <input
                type="text"
                placeholder="Search by manufacturer, model, powertrain, or keyword..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                aria-label="Search vehicles"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={17} color="var(--accent-cyan)" />
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value as any)}
                style={{
                  backgroundColor: '#161c28',
                  color: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                aria-label="Sort vehicles"
              >
                <option value="accel">Sort: Quickest 0–60 MPH</option>
                <option value="power">Sort: Highest Horsepower</option>
                <option value="range">Sort: Longest Electric Range</option>
                <option value="nameAsc">Sort: Model Name (A–Z)</option>
                <option value="nameDesc">Sort: Model Name (Z–A)</option>
                <option value="priceAsc">Sort: Price (Low to High)</option>
                <option value="priceDesc">Sort: Price (High to Low)</option>
                <option value="launchDate">Sort: Launch Date (Newest)</option>
              </select>
            </div>
          </div>

          {/* Multi-facet Filter Selectors Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {/* Manufacturer Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Marque
              </label>
              <select
                value={selectedManufacturer}
                onChange={(e) => handleFilterChange(setSelectedManufacturer, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {manufacturerOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Style Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Body Style
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => handleFilterChange(setSelectedBodyType, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {bodyTypeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Powertrain Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Powertrain
              </label>
              <select
                value={selectedPowertrain}
                onChange={(e) => handleFilterChange(setSelectedPowertrain, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {powertrainOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Year Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Model Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleFilterChange(setSelectedYear, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Tier Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Price Tier (USD)
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => handleFilterChange(setSelectedPriceRange, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {priceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Region Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                Market Region
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => handleFilterChange(setSelectedMarket, e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121722',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '0.6rem 0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {marketOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          {activeFilters.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginRight: '0.25rem',
                }}
              >
                ACTIVE FILTERS:
              </span>

              {activeFilters.map((f, idx) => (
                <button
                  key={idx}
                  onClick={f.onRemove}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                  title="Click to remove filter"
                >
                  <span>{f.label}</span>
                  <X size={12} />
                </button>
              ))}

              <button
                onClick={clearAllFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Counter Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            SHOWING <strong style={{ color: '#ffffff' }}>{filteredVehicles.length}</strong> OF{' '}
            <strong style={{ color: 'var(--accent-cyan)' }}>{VEHICLES.length}</strong> MACHINES
            {filteredVehicles.length > 0 && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                (Page {safeCurrentPage} of {totalPages})
              </span>
            )}
          </div>

          <Link
            to="/manufacturers"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Explore by Manufacturer House →</span>
          </Link>
        </div>

        {/* Vehicles Grid / Empty State */}
        {paginatedVehicles.length > 0 ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '2rem',
                marginBottom: '3.5rem',
              }}
            >
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onOpenSpecs={(v) => setSelectedVehicle(v)}
                  onToggleSave={handleToggleSave}
                  isSaved={savedVehicleIds.has(vehicle.id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  marginBottom: '3rem',
                }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.55rem 1rem',
                    opacity: safeCurrentPage === 1 ? 0.4 : 1,
                    cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      backgroundColor:
                        safeCurrentPage === pageNum ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
                      color: safeCurrentPage === pageNum ? '#07090d' : '#ffffff',
                      border:
                        safeCurrentPage === pageNum
                          ? '1px solid var(--accent-cyan)'
                          : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.55rem 1rem',
                    opacity: safeCurrentPage === totalPages ? 0.4 : 1,
                    cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: '5rem 2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '3rem',
            }}
          >
            <Filter size={44} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
              No Vehicles Match Your Current Filters
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 2rem' }}>
              We could not find any machines matching your selected combination of marque,
              body topology, and price tier. Reset your filters to explore our full inventory.
            </p>
            <button onClick={clearAllFilters} className="btn btn-primary">
              <RotateCcw size={16} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Specification Modal */}
      <VehicleSpecModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onAddToGarage={handleToggleSave}
        isSaved={selectedVehicle ? savedVehicleIds.has(selectedVehicle.id) : false}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1100,
            backgroundColor: 'rgba(12, 16, 23, 0.95)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '6px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#ffffff',
            fontSize: '0.88rem',
            boxShadow: '0 10px 30px rgba(0, 240, 255, 0.25)',
          }}
        >
          <Check size={16} color="var(--accent-cyan)" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
