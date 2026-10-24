// AutoVerse Stage 16: Smart EV Trip Planner Experience
// Features highway corridor calculation, battery SoC simulation, verified charging stops,
// cost arithmetic with petrol ICE benchmarks, and persistent trip saving.

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Zap,
  ShieldCheck,
  Bookmark,
  Share2,
  Check,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react';
import { getAllEvProfiles, getEvProfileBySlug, getDefaultEvProfile } from '../utils/evProfile';
import { planOptimalEvTrip } from '../utils/tripCalculator';
import { saveTripPlan } from '../utils/tripPlannerStore';
import { getSavedGarageSlugs } from '../utils/garage';
import { InteractiveRouteMap } from '../components/trip/InteractiveRouteMap';
import type {
  EvVehicleProfile,
  TripPlanResult,
  PlannedChargingStop,
  DrivingPreference,
} from '../types/tripPlanner';

export const TripPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const evProfiles = getAllEvProfiles();
  const defaultVehicle = getDefaultEvProfile();

  // Form State
  const [origin, setOrigin] = useState<string>(searchParams.get('from') || 'Vijayawada');
  const [destination, setDestination] = useState<string>(searchParams.get('to') || 'Hyderabad');
  const [selectedVehicleSlug, setSelectedVehicleSlug] = useState<string>(
    searchParams.get('car') || defaultVehicle.slug
  );
  const [startingSoC, setStartingSoC] = useState<number>(90);
  const [desiredArrivalSoC, setDesiredArrivalSoC] = useState<number>(15);
  const [drivingPreference, setDrivingPreference] = useState<DrivingPreference>('fast');
  const [ambientTempC, setAmbientTempC] = useState<number>(28);
  const [maxDetourKm] = useState<number>(15);

  // Result & Calculation State
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<TripPlanResult | null>(null);
  const [selectedStop, setSelectedStop] = useState<PlannedChargingStop | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copyNotice, setCopyNotice] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'cost' | 'safety'>('timeline');

  // Garage vehicles quick check
  const garageSlugs = getSavedGarageSlugs();
  const garageEvs = evProfiles.filter((e) => garageSlugs.includes(e.slug));

  // Current active EV profile
  const activeVehicle: EvVehicleProfile =
    getEvProfileBySlug(selectedVehicleSlug) || defaultVehicle;

  // Execute initial trip calculation
  const handleCalculateTrip = async () => {
    setIsCalculating(true);
    setIsSaved(false);
    try {
      const plan = await planOptimalEvTrip({
        originQuery: origin,
        destinationQuery: destination,
        vehicle: activeVehicle,
        preferences: {
          startingSoC,
          desiredArrivalSoC,
          minStationSoC: 15,
          maxDetourKm,
          drivingPreference,
          ambientTempC,
        },
      });
      setPlanResult(plan);
      if (plan.chargingStops.length > 0) {
        setSelectedStop(plan.chargingStops[0]);
      } else {
        setSelectedStop(null);
      }
    } catch (err) {
      console.error('Failed to compute EV trip plan', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    // Initial run on mount
    handleCalculateTrip();
  }, []);

  const handleSaveTrip = () => {
    if (!planResult) return;
    saveTripPlan(planResult);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleShareTrip = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#030508',
        color: 'var(--text-primary)',
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '5rem',
      }}
    >
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <Zap size={14} />
              AutoVerse Smart Highway Engine v16
            </span>

            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              Non-linear Charging Curves • Corridor Telemetry
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '0.65rem',
            }}
          >
            EV Charging & Smart Trip Planner
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '820px',
              lineHeight: 1.55,
            }}
          >
            Plan intercity journeys with verified battery State-of-Charge (SoC) modeling, compatible high-power DC
            chargers, real-world highway efficiency adjustments, and transparent cost comparisons against petrol alternatives.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) 1fr',
            gap: '1.75rem',
            alignItems: 'start',
          }}
          className="trip-planner-grid"
        >
          {/* LEFT COLUMN: Trip Planner Form Controls */}
          <div
            style={{
              backgroundColor: '#070a0f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Navigation size={18} color="var(--accent-cyan)" />
              Route & Vehicle Parameters
            </h2>

            {/* Quick Demo Routes Pill Carousel */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Quick Highway Corridors
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  { from: 'Vijayawada', to: 'Hyderabad' },
                  { from: 'Mumbai', to: 'Pune' },
                  { from: 'Bengaluru', to: 'Chennai' },
                  { from: 'Delhi', to: 'Jaipur' },
                  { from: 'Stuttgart', to: 'Munich' },
                ].map((corridor) => (
                  <button
                    key={`${corridor.from}-${corridor.to}`}
                    type="button"
                    onClick={() => {
                      setOrigin(corridor.from);
                      setDestination(corridor.to);
                    }}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor:
                        origin === corridor.from && destination === corridor.to
                          ? 'rgba(0, 240, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.04)',
                      border:
                        origin === corridor.from && destination === corridor.to
                          ? '1px solid rgba(0, 240, 255, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      color:
                        origin === corridor.from && destination === corridor.to
                          ? 'var(--accent-cyan)'
                          : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {corridor.from} ➔ {corridor.to}
                  </button>
                ))}
              </div>
            </div>

            {/* Origin & Destination Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Origin Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="var(--accent-cyan)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Vijayawada, Benz Circle"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Destination Location
                </label>
                <div style={{ position: 'relative' }}>
                  <Navigation size={16} color="#10b981" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Hyderabad, Financial District"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Electric Vehicle Model
                </label>
                {garageEvs.length > 0 && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                    ★ {garageEvs.length} in My Garage
                  </span>
                )}
              </div>

              <select
                value={selectedVehicleSlug}
                onChange={(e) => setSelectedVehicleSlug(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: '0.45rem',
                }}
              >
                {evProfiles.map((ev) => (
                  <option key={ev.slug} value={ev.slug} style={{ backgroundColor: '#090d14', color: '#ffffff' }}>
                    {ev.brand} {ev.name} ({ev.variant}) • {ev.usableBatteryKwh} kWh (~{ev.publishedRangeKm} km)
                  </option>
                ))}
              </select>

              {/* Active Vehicle Spec Snippet */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 240, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{activeVehicle.voltageArchitecture}</span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Peak DC: {activeVehicle.chargingMaxDcKw} kW • {activeVehicle.supportedConnectors.join(', ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {activeVehicle.efficiencyKwh100km} kWh/100km
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {activeVehicle.testCycle} Cycle
                  </div>
                </div>
              </div>
            </div>

            {/* Battery SoC & Preference Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Starting Battery SoC</span>
                  <strong style={{ color: '#ffffff' }}>{startingSoC}%</strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={startingSoC}
                  onChange={(e) => setStartingSoC(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Desired Arrival Buffer</span>
                  <strong style={{ color: '#10b981' }}>{desiredArrivalSoC}%</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={desiredArrivalSoC}
                  onChange={(e) => setDesiredArrivalSoC(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ambient Temperature</span>
                  <strong style={{ color: ambientTempC < 10 ? '#38bdf8' : ambientTempC > 35 ? '#f59e0b' : '#ffffff' }}>
                    {ambientTempC}°C
                  </strong>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="45"
                  step="1"
                  value={ambientTempC}
                  onChange={(e) => setAmbientTempC(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              {/* Driving Preference Buttons */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Cruising Pace
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  {(['fast', 'balanced', 'max_range'] as DrivingPreference[]).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setDrivingPreference(pref)}
                      style={{
                        padding: '0.45rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        backgroundColor:
                          drivingPreference === pref ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border:
                          drivingPreference === pref
                            ? '1px solid rgba(0, 240, 255, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        color: drivingPreference === pref ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {pref.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="button"
              onClick={handleCalculateTrip}
              disabled={isCalculating}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#030508',
                borderRadius: '8px',
              }}
            >
              {isCalculating ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid rgba(0, 0, 0, 0.2)',
                      borderTopColor: '#000000',
                      animation: 'spin 0.75s linear infinite',
                    }}
                  />
                  <span>Simulating Route Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Calculate Smart EV Route</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: Interactive Route Canvas & Charging Timeline */}
          <div>
            {planResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 1. Interactive Route Map Visualizer */}
                <InteractiveRouteMap
                  plan={planResult}
                  selectedStopId={selectedStop?.id}
                  onSelectStop={(st) => setSelectedStop(st)}
                />

                {/* 2. Executive Journey Metrics Ribbon */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Highway Distance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      {planResult.energySummary.totalDistanceKm}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>km</span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Driving Duration</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      {Math.floor(planResult.energySummary.totalDrivingMinutes / 60)}h{' '}
                      {planResult.energySummary.totalDrivingMinutes % 60}m
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Charging Stops</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {planResult.chargingStops.length}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        ({planResult.energySummary.totalChargingMinutes}m)
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Trip Energy</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      {planResult.energySummary.totalEnergyConsumedKwh}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>kWh</span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Total Charging Cost</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                      {planResult.energySummary.currency} {planResult.energySummary.totalChargingCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 3. Tabbed Details: Charging Timeline / Financial Breakdown / Safety Notice */}
                <div
                  style={{
                    backgroundColor: '#070a0f',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingBottom: '0.85rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { id: 'timeline', label: 'Charging Timeline' },
                        { id: 'cost', label: 'Energy Cost & Petrol Comparison' },
                        { id: 'safety', label: 'Feasibility & Safety Audit' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            backgroundColor:
                              activeTab === tab.id ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            border:
                              activeTab === tab.id
                                ? '1px solid rgba(0, 240, 255, 0.3)'
                                : '1px solid transparent',
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Action Buttons: Save & Share */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleSaveTrip}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.76rem',
                          padding: '0.45rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        {isSaved ? <Check size={14} color="#10b981" /> : <Bookmark size={14} />}
                        <span>{isSaved ? 'Trip Saved!' : 'Save Trip'}</span>
                      </button>

                      <button
                        onClick={handleShareTrip}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.76rem',
                          padding: '0.45rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        {copyNotice ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                        <span>{copyNotice ? 'Link Copied!' : 'Share Route'}</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: Charging Timeline */}
                  {activeTab === 'timeline' && (
                    <div>
                      {planResult.chargingStops.length === 0 ? (
                        <div
                          style={{
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: 'rgba(16, 185, 129, 0.04)',
                            borderRadius: '10px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <ShieldCheck size={32} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                            Zero Intermediate Charging Needed
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
                            Your {planResult.vehicle.name} can complete this {planResult.energySummary.totalDistanceKm} km
                            drive directly on a single charge while preserving your desired {planResult.preferences.desiredArrivalSoC}% battery reserve!
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {planResult.chargingStops.map((stop, sIndex) => (
                            <div
                              key={stop.id}
                              style={{
                                padding: '1rem 1.25rem',
                                borderRadius: '10px',
                                backgroundColor:
                                  selectedStop?.id === stop.id
                                    ? 'rgba(245, 158, 11, 0.05)'
                                    : 'rgba(255, 255, 255, 0.02)',
                                border:
                                  selectedStop?.id === stop.id
                                    ? '1px solid rgba(245, 158, 11, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.06)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  marginBottom: '0.65rem',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f59e0b',
                                        color: '#040608',
                                        fontWeight: 900,
                                        fontSize: '0.72rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {sIndex + 1}
                                    </span>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                      {stop.station.name}
                                    </h4>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        color: '#f59e0b',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {stop.station.operator}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem', paddingLeft: '1.85rem' }}>
                                    {stop.station.address} • Detour: {stop.detourKm} km
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                                    {stop.currency} {stop.estimatedCost.toLocaleString()}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    @{stop.selectedConnector.pricePerKwh} / kWh
                                  </div>
                                </div>
                              </div>

                              {/* Station Charging Details Grid */}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                  gap: '0.65rem',
                                  paddingLeft: '1.85rem',
                                  paddingTop: '0.45rem',
                                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                }}
                              >
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Battery Hop:</span>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                                    {stop.arrivalSoC}% ➔ {stop.departureSoC}% SoC
                                  </div>
                                </div>

                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Charging Power:</span>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                    {stop.effectiveChargingPowerKw} kW DC ({stop.selectedConnector.type})
                                  </div>
                                </div>

                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Time at Charger:</span>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                                    {stop.chargingDurationMinutes} mins (~{stop.energyAddedKwh} kWh)
                                  </div>
                                </div>

                                <div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Amenities:</span>
                                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                    {stop.station.amenities.slice(0, 3).join(', ')}
                                  </div>
                                </div>
                              </div>

                              <div style={{ marginTop: '0.75rem', paddingLeft: '1.85rem', display: 'flex', gap: '0.75rem' }}>
                                <Link
                                  to={`/charging-stations/${stop.station.id}`}
                                  style={{
                                    fontSize: '0.74rem',
                                    color: 'var(--accent-cyan)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    textDecoration: 'none',
                                  }}
                                >
                                  View Station Dossier <ChevronRight size={13} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Financial Breakdown & Petrol Comparison */}
                  {activeTab === 'cost' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1rem',
                        }}
                      >
                        <div
                          style={{
                            padding: '1.25rem',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(0, 240, 255, 0.03)',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                            Electric Energy Expenditure
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0' }}>
                            {planResult.energySummary.currency}{' '}
                            {planResult.energySummary.totalChargingCost.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Cost per km: {planResult.energySummary.currency} {planResult.energySummary.costPerKm}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            Home Departure Energy: {planResult.energySummary.currency} {planResult.energySummary.homeChargingCost} + Public Fast Charging: {planResult.energySummary.currency} {planResult.energySummary.publicChargingCost}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1.25rem',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(239, 68, 68, 0.03)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
                            Equivalent Petrol ICE Cost
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0.4rem 0' }}>
                            {planResult.energySummary.currency}{' '}
                            {planResult.energySummary.petrolComparisonCost.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                            You save ~{planResult.energySummary.currency} {planResult.energySummary.estimatedSavingsVsPetrol.toLocaleString()} on this journey!
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            Based on verified ~14 km/L economy @ ₹104/L pump price benchmark.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Feasibility & Safety Audit */}
                  {activeTab === 'safety' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          backgroundColor: planResult.feasibility.isFeasible ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                          border: `1px solid ${planResult.feasibility.isFeasible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <ShieldCheck size={18} color={planResult.feasibility.isFeasible ? '#10b981' : '#f59e0b'} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                            {planResult.feasibility.isFeasible ? 'Route Fully Feasible & Validated' : 'Routing Warning / Constraint Alert'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Confidence Rating:{' '}
                          <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>
                            {planResult.feasibility.confidenceRating}
                          </strong>
                        </div>
                      </div>

                      {planResult.feasibility.safetyBuffersApplied.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                            Enforced Safety Buffers:
                          </div>
                          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {planResult.feasibility.safetyBuffersApplied.map((b, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: '0.2rem' }}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div
                        style={{
                          padding: '0.85rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Operational Advisory:</strong> Battery discharge rates vary depending on highway headwinds,
                        passenger weight, elevation grade, and air conditioning load. Always confirm live station connector
                        availability through the operator's mobile application before bypassing an intermediate charger.
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Assistance & Discovery Prompts */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(9, 13, 20, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Bot size={20} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                        Need Conversational Route Advice?
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Ask AutoVerse AI to review weather impacts or alternative charging stations along this corridor.
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/assistant?q=${encodeURIComponent(`Plan an EV trip from ${origin} to ${destination} using the ${activeVehicle.name}`)}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                  >
                    Consult AutoVerse AI ➔
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#070a0f',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                Enter origin and destination parameters to simulate route.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
