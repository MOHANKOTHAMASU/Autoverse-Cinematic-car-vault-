import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAdminVehicles } from '../utils/adminStore';
import type { Vehicle } from '../types';
import {
  type FinderFilters,
  type WizardAnswers,
  DEFAULT_FINDER_FILTERS,
  DEFAULT_WIZARD_ANSWERS,
  filterAndScoreVehicles,
  parseUrlToFinderFilters,
  filtersToSearchParams,
} from '../utils/carFinder';
import { CarFinderWizard } from '../components/CarFinderWizard';
import { CarFinderCard } from '../components/CarFinderCard';
import { isCarInGarage, toggleCarInGarage } from '../utils/garage';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Info,
  Car,
  Bot,
} from 'lucide-react';

export const CarFinderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active view tab: 'wizard' (guided) vs 'console' (direct filter grid)
  const [activeTab, setActiveTab] = useState<'wizard' | 'console'>('wizard');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FinderFilters>(() => parseUrlToFinderFilters(searchParams));
  const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers>(DEFAULT_WIZARD_ANSWERS);

  // Search input local state for debouncing
  const [searchInput, setSearchInput] = useState<string>(filters.searchQuery);

  // Sorting
  const [sortBy, setSortBy] = useState<'match' | 'priceAsc' | 'priceDesc' | 'power' | 'accel' | 'range'>(
    (searchParams.get('sort') as any) || 'match'
  );

  // Garage and Comparison feedback
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load all published vehicles from admin store repository
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const list = getAdminVehicles();
    setAllVehicles(list);
  }, []);

  // Listen to garage updates
  useEffect(() => {
    const checkGarage = () => {
      if (allVehicles.length > 0) {
        const saved = allVehicles
          .map((v) => v.slug || v.id)
          .filter((slug) => isCarInGarage(slug));
        setSavedSlugs(saved);
      }
    };
    checkGarage();

    const handleUpdate = () => checkGarage();
    window.addEventListener('autoverse_garage_updated', handleUpdate);
    return () => window.removeEventListener('autoverse_garage_updated', handleUpdate);
  }, [allVehicles]);

  // Debounced search input sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchQuery) {
        setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput, filters.searchQuery]);

  // Sync state to URL search parameters
  useEffect(() => {
    const newParams = filtersToSearchParams(filters, sortBy);
    setSearchParams(newParams, { replace: true });
  }, [filters, sortBy, setSearchParams]);

  // Execute scoring and filtering
  const { exactMatches, relaxedMatches, isRelaxedFallback } = useMemo(() => {
    return filterAndScoreVehicles(allVehicles, filters, wizardAnswers, sortBy);
  }, [allVehicles, filters, wizardAnswers, sortBy]);

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // Garage Action
  const handleToggleSave = (slug: string) => {
    const isNowSaved = toggleCarInGarage(slug);
    const vehicle = allVehicles.find((v) => v.slug === slug || v.id === slug);
    const name = vehicle ? `${vehicle.brand} ${vehicle.model}` : slug;
    showToast(isNowSaved ? `Added ${name} to My Garage` : `Removed ${name} from My Garage`);
  };

  // Compare Action
  const handleAddToCompare = (slug: string) => {
    // Check current comparison param from garage/url or storage
    const existingRaw = localStorage.getItem('autoverse_compare_selection') || '[]';
    let existing: string[] = [];
    try {
      existing = JSON.parse(existingRaw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    if (existing.includes(slug)) {
      showToast(`${slug} is already in comparison table.`);
      navigate(`/compare?cars=${existing.join(',')}`);
      return;
    }

    if (existing.length >= 4) {
      showToast('Comparison limit reached (4 of 4 slots). Open Compare page to swap vehicles.');
      return;
    }

    const updated = [...existing, slug];
    localStorage.setItem('autoverse_compare_selection', JSON.stringify(updated));
    showToast(`Added to Comparison (${updated.length} of 4 vehicles selected)`);
    navigate(`/compare?cars=${updated.join(',')}`);
  };

  // View Similar Vehicles
  const handleViewSimilar = (brand: string, bodyType: string) => {
    setFilters((prev) => ({
      ...prev,
      manufacturer: brand.toLowerCase(),
      bodyType: bodyType.toLowerCase(),
      searchQuery: '',
    }));
    setSearchInput('');
    setActiveTab('console');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Clear All Filters
  const handleResetFilters = () => {
    setFilters(DEFAULT_FINDER_FILTERS);
    setSearchInput('');
    setWizardAnswers(DEFAULT_WIZARD_ANSWERS);
    setSortBy('match');
  };

  // Wizard Apply Handler: Syncs wizard answers into corresponding filters and displays results
  const handleApplyWizard = () => {
    const updatedFilters = { ...filters };

    // Sync budget preset
    if (wizardAnswers.budgetRange === 'under_25k') {
      updatedFilters.minPrice = null;
      updatedFilters.maxPrice = 25000;
    } else if (wizardAnswers.budgetRange === '25k_50k') {
      updatedFilters.minPrice = 25000;
      updatedFilters.maxPrice = 50000;
    } else if (wizardAnswers.budgetRange === '50k_90k') {
      updatedFilters.minPrice = 50000;
      updatedFilters.maxPrice = 90000;
    } else if (wizardAnswers.budgetRange === '90k_150k') {
      updatedFilters.minPrice = 90000;
      updatedFilters.maxPrice = 150000;
    } else if (wizardAnswers.budgetRange === 'above_150k') {
      updatedFilters.minPrice = 150000;
      updatedFilters.maxPrice = null;
    }

    // Sync body style
    if (wizardAnswers.preferredBody !== 'any') {
      updatedFilters.bodyType = wizardAnswers.preferredBody;
    }

    // Sync powertrain
    if (wizardAnswers.preferredPowertrain !== 'any') {
      updatedFilters.powertrain = wizardAnswers.preferredPowertrain;
    }

    // Sync min seats
    if (wizardAnswers.minSeats > 0) {
      updatedFilters.minSeats = wizardAnswers.minSeats;
    }

    // Sync must-haves
    const mustHaves = wizardAnswers.mustHaveFeatures || [];
    updatedFilters.mustHaveAdas = mustHaves.includes('adas');
    updatedFilters.mustHaveFastCharging = mustHaves.includes('fast_charging');
    updatedFilters.requireFiveStarSafety = mustHaves.includes('5star_safety');

    setFilters(updatedFilters);
    showToast('Applied lifestyle answers to recommendation engine.');

    // Smooth scroll down to results section
    const resultsEl = document.getElementById('finder-results-section');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  };

  const resultsList = isRelaxedFallback ? relaxedMatches : exactMatches;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#07090d',
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '5rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Toast Notification Notification Pill */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 999,
              backgroundColor: 'rgba(7, 9, 13, 0.95)',
              border: '1px solid var(--accent-cyan)',
              color: '#ffffff',
              padding: '0.85rem 1.4rem',
              borderRadius: '8px',
              boxShadow: '0 12px 35px rgba(0, 240, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <Check size={16} color="var(--accent-cyan)" />
            {toastMessage}
          </div>
        )}

        {/* Header Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '820px', margin: '0 auto 2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={13} />
            STAGE 9 INTELLIGENT MATCHING
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            Find the Car That Fits Your Life
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 auto',
            }}
          >
            Discover vehicles that match your budget, driving needs, preferred features, and lifestyle.
            Transparent scoring across verified technical specifications, independent crash safety tests, and efficiency ratings.
          </p>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/assistant?q=Find the best car for my budget and daily commuting needs.')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                borderColor: 'rgba(0, 240, 255, 0.4)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                color: 'var(--accent-cyan)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '999px',
                padding: '0.5rem 1.15rem',
              }}
            >
              <Bot size={15} />
              <span>Or describe your vehicle needs naturally with AutoVerse AI</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'inline-flex',
              marginTop: '1.75rem',
              padding: '0.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              gap: '0.35rem',
            }}
          >
            <button
              onClick={() => setActiveTab('wizard')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'wizard' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'wizard' ? '#07090d' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={15} />
              Guided Lifestyle Wizard
            </button>

            <button
              onClick={() => setActiveTab('console')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'console' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'console' ? '#07090d' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <SlidersHorizontal size={15} />
              Advanced Filter Console
            </button>
          </div>
        </div>

        {/* Top Search Input Bar (Universal across both modes) */}
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto 2.5rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1.25rem',
                color: 'var(--accent-cyan)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by marque, model, category, powertrain, or features (e.g. Porsche Taycan, EV SUV, AWD)..."
              style={{
                width: '100%',
                padding: '1rem 3.5rem 1rem 3.2rem',
                backgroundColor: 'rgba(12, 16, 25, 0.85)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.98rem',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                outline: 'none',
              }}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters((prev) => ({ ...prev, searchQuery: '' }));
                }}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                title="Clear search text"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Guided Wizard Section (Shown when activeTab === 'wizard') */}
        {activeTab === 'wizard' && (
          <div style={{ maxWidth: '980px', margin: '0 auto 3rem' }}>
            <CarFinderWizard
              answers={wizardAnswers}
              onChangeAnswers={setWizardAnswers}
              onApply={handleApplyWizard}
              onReset={() => setWizardAnswers(DEFAULT_WIZARD_ANSWERS)}
            />
          </div>
        )}

        {/* Filter Console (Shown when activeTab === 'console') */}
        {activeTab === 'console' && (
          <div
            className="card-glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(10, 14, 22, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '3rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <SlidersHorizontal size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  Multi-Dimensional Filter Console
                </h3>
              </div>
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RotateCcw size={13} />
                Clear All Filters
              </button>
            </div>

            {/* Core Row: Body Style, Powertrain, Budget Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Marque Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Manufacturer
                </label>
                <select
                  value={filters.manufacturer}
                  onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Global Marques (15+)</option>
                  <option value="porsche">Porsche</option>
                  <option value="tesla">Tesla</option>
                  <option value="audi">Audi</option>
                  <option value="mercedes-benz">Mercedes-Benz</option>
                  <option value="bmw">BMW</option>
                  <option value="tata">Tata Motors</option>
                  <option value="mahindra">Mahindra</option>
                  <option value="maruti">Maruti Suzuki</option>
                  <option value="hyundai">Hyundai</option>
                  <option value="kia">Kia</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="mg">MG</option>
                  <option value="byd">BYD</option>
                  <option value="land-rover">Land Rover</option>
                </select>
              </div>

              {/* Body Style */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Body Style
                </label>
                <select
                  value={filters.bodyType}
                  onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Body Styles</option>
                  <option value="suv">SUV & Compact SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="coupe">Coupe & Coupé SUV</option>
                  <option value="hatchback">Hatchback & Crossover</option>
                  <option value="sports_car">Sports Car</option>
                  <option value="estate">MPV & Estate</option>
                </select>
              </div>

              {/* Powertrain */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Powertrain Architecture
                </label>
                <select
                  value={filters.powertrain}
                  onChange={(e) => setFilters({ ...filters, powertrain: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">All Powertrains</option>
                  <option value="electric">100% Electric (BEV)</option>
                  <option value="hybrid">Strong Hybrid (HEV / PHEV)</option>
                  <option value="petrol">Turbo Petrol</option>
                  <option value="diesel">Common-Rail Turbo Diesel</option>
                </select>
              </div>

              {/* Budget Preset Bracket */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Budget Bracket (USD / INR)
                </label>
                <select
                  value={filters.pricePreset}
                  onChange={(e) => {
                    const preset = e.target.value;
                    let minP: number | null = null;
                    let maxP: number | null = null;
                    if (preset === 'under_30k') maxP = 30000;
                    else if (preset === '30k_60k') { minP = 30000; maxP = 60000; }
                    else if (preset === '60k_100k') { minP = 60000; maxP = 100000; }
                    else if (preset === 'above_100k') { minP = 100000; maxP = null; }

                    setFilters({
                      ...filters,
                      pricePreset: preset,
                      minPrice: minP,
                      maxPrice: maxP,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="all">Any Price / Open Budget</option>
                  <option value="under_30k">Under $30,000 / ₹25 Lakh</option>
                  <option value="30k_60k">$30,000 – $60,000 / ₹25–50 Lakh</option>
                  <option value="60k_100k">$60,000 – $100,000 / ₹50–85 Lakh</option>
                  <option value="above_100k">Above $100,000 / ₹85 Lakh+</option>
                </select>
              </div>
            </div>

            {/* Toggle Advanced Mechanical & Practical Sliders */}
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: 0,
                }}
              >
                {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showAdvancedFilters ? 'Hide Fine-Grained Technical Filters' : 'Show Technical Specs (Horsepower, 0–60, Seats, NCAP Safety)'}
              </button>
            </div>

            {showAdvancedFilters && (
              <div
                style={{
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginTop: '0.85rem',
                }}
              >
                {/* Min Horsepower */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Min Peak Power: {filters.minHorsepower ? `${filters.minHorsepower} HP` : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="900"
                    step="50"
                    value={filters.minHorsepower || 100}
                    onChange={(e) => setFilters({ ...filters, minHorsepower: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                </div>

                {/* Min Seating */}
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Minimum Seats
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[null, 2, 4, 5, 7].map((s) => (
                      <button
                        key={s === null ? 'any' : s}
                        onClick={() => setFilters({ ...filters, minSeats: s })}
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          fontSize: '0.78rem',
                          borderRadius: '4px',
                          border: `1px solid ${filters.minSeats === s ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.12)'}`,
                          backgroundColor: filters.minSeats === s ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        {s === null ? 'Any' : `${s}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Star NCAP Safety Check */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'center' }}>
                  <input
                    type="checkbox"
                    id="safeCheck"
                    checked={filters.requireFiveStarSafety}
                    onChange={(e) => setFilters({ ...filters, requireFiveStarSafety: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="safeCheck" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer' }}>
                    Require 5-Star NCAP Safety
                  </label>
                </div>

                {/* Level 2 ADAS Check */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'center' }}>
                  <input
                    type="checkbox"
                    id="adasCheck"
                    checked={filters.mustHaveAdas}
                    onChange={(e) => setFilters({ ...filters, mustHaveAdas: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="adasCheck" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer' }}>
                    Require Level 2 ADAS
                  </label>
                </div>

                {/* Fast DC Charging Check */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', alignSelf: 'center' }}>
                  <input
                    type="checkbox"
                    id="chargeCheck"
                    checked={filters.mustHaveFastCharging}
                    onChange={(e) => setFilters({ ...filters, mustHaveFastCharging: e.target.checked })}
                    style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chargeCheck" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer' }}>
                    Ultra-Fast DC Charging
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Toolbar: Count, Sorting, Active Filter Chips */}
        <div
          id="finder-results-section"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {isRelaxedFallback ? 'Close Recommendation Alternatives' : 'Recommended Vehicles'}
              </h2>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                {resultsList.length} Vehicles Found
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Ranked dynamically by weighted preference compatibility (budget, use case, powertrain & safety).
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <option value="match">Best Preference Match</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="power">Highest Power (HP)</option>
              <option value="accel">Fastest 0–60 MPH</option>
              <option value="range">Longest EV Range</option>
            </select>
          </div>
        </div>

        {/* Fallback Banner when strict criteria yielded 0 matches */}
        {isRelaxedFallback && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <AlertCircle size={22} color="#f59e0b" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', display: 'block' }}>
                  No exact matches met all strict constraints.
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Showing top alternative candidates with broadened budget and powertrain parameters.
                </span>
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset to All 50 Vehicles
            </button>
          </div>
        )}

        {/* Vehicle Cards Grid */}
        {resultsList.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {resultsList.map((scored) => {
              const slug = scored.vehicle.slug || scored.vehicle.id;
              const isSaved = savedSlugs.includes(slug);
              return (
                <CarFinderCard
                  key={slug}
                  scored={scored}
                  onToggleSave={handleToggleSave}
                  isSaved={isSaved}
                  onAddToCompare={handleAddToCompare}
                  onViewSimilar={handleViewSimilar}
                />
              );
            })}
          </div>
        ) : (
          /* Empty No-Match State */
          <div
            className="card-glass"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(10, 14, 22, 0.65)',
            }}
          >
            <Car size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No vehicles matched your search criteria
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Try loosening your search keywords, broadening your price limits, or clearing specific feature constraints.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
            >
              <RotateCcw size={15} />
              Reset All Filters
            </button>
          </div>
        )}

        {/* Algorithm Transparency & Trust Footer Note */}
        <div
          style={{
            marginTop: '4rem',
            padding: '1.5rem 1.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <Info size={18} color="var(--accent-cyan)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
              How AutoVerse Calculates Your Match Score
            </span>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The match percentage represents compatibility with your selected preferences across budget (30%), body silhouette & powertrain (20%), intended driving usage (15%), electric range / efficiency (15%), seating practicality (10%), and verified safety / ADAS technologies (10%).
              This is a personalized mathematical preference fit, not an independent certification of vehicle reliability or build quality. Unverified or missing specifications are explicitly flagged and never artificially inflate recommendation scores.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
