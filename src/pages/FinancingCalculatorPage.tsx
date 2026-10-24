import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  Landmark,
  Save,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Table,
  Plus,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  calculateFinanceEMI,
  saveUserFinanceScenario,
} from '../utils/financeStore';
import type {
  FinanceCalculationInputs,
  FinanceCalculationResult,
  FinanceScenario,
} from '../types/offers';
import type { CurrencyCode, PriceBasis } from '../types/calculator';
import { VEHICLES } from '../data/vehicles';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, calculateOnRoadPrice } from '../utils/tcoCalculator';

export const FinancingCalculatorPage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Find vehicle from slug if provided
  const preselectedVehicle = useMemo(() => {
    if (!vehicleSlug) return undefined;
    return VEHICLES.find((v) => v.slug === vehicleSlug || v.id === vehicleSlug);
  }, [vehicleSlug]);

  // Currency & Region
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    preselectedVehicle ? preselectedVehicle.id : 'custom'
  );
  const [vehicleTitle, setVehicleTitle] = useState<string>(
    preselectedVehicle ? `${preselectedVehicle.modelYear || preselectedVehicle.year} ${preselectedVehicle.brand} ${preselectedVehicle.model}` : 'Custom Vehicle'
  );

  // Price & Price Basis
  const [vehiclePrice, setVehiclePrice] = useState<number>(() => {
    if (preselectedVehicle) {
      return preselectedVehicle.price ? Math.round(preselectedVehicle.price * 83.5) : 3500000;
    }
    return 2500000;
  });
  const [priceBasis, setPriceBasis] = useState<PriceBasis>('ex_showroom');

  // Down payment state
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(500000);
  const [downPaymentMode, setDownPaymentMode] = useState<'percent' | 'amount'>('percent');

  // Loan parameters
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.5);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(60);
  const [processingFee, setProcessingFee] = useState<number>(5000);
  const [otherUpfrontCharges, setOtherUpfrontCharges] = useState<number>(2000);
  const [balloonPayment, setBalloonPayment] = useState<number>(0);

  // UI expanders
  const [showBalloonSettings, setShowBalloonSettings] = useState<boolean>(false);
  const [showAmortizationTable, setShowAmortizationTable] = useState<boolean>(false);
  const [showOnRoadBreakdown, setShowOnRoadBreakdown] = useState<boolean>(false);

  // Saved scenarios & multi-scenario comparison
  const [scenarios, setScenarios] = useState<FinanceScenario[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [scenarioNameInput, setScenarioNameInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Handle vehicle selection change
  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    if (id === 'custom') {
      setVehicleTitle('Custom Vehicle');
      return;
    }
    const found = VEHICLES.find((v) => v.id === id);
    if (found) {
      setVehicleTitle(`${found.modelYear || found.year} ${found.brand} ${found.model}`);
      // Approximate INR / regional conversion
      const basePrice = currency === 'INR'
        ? Math.round((found.price || 50000) * 83.5)
        : found.price || 50000;
      setVehiclePrice(basePrice);
      const dp = Math.round((basePrice * downPaymentPercent) / 100);
      setDownPaymentAmount(dp);
    }
  };

  // Sync down payment amount when vehicle price or percent changes
  useEffect(() => {
    if (downPaymentMode === 'percent') {
      const dp = Math.round((vehiclePrice * downPaymentPercent) / 100);
      setDownPaymentAmount(dp);
    }
  }, [vehiclePrice, downPaymentPercent, downPaymentMode]);

  // Sync down payment percent when amount changes directly
  const handleAmountChange = (amt: number) => {
    setDownPaymentMode('amount');
    const clamped = Math.min(vehiclePrice, Math.max(0, amt));
    setDownPaymentAmount(clamped);
    if (vehiclePrice > 0) {
      setDownPaymentPercent(parseFloat(((clamped / vehiclePrice) * 100).toFixed(1)));
    }
  };

  const handlePercentChange = (pct: number) => {
    setDownPaymentMode('percent');
    setDownPaymentPercent(pct);
    const dp = Math.round((vehiclePrice * pct) / 100);
    setDownPaymentAmount(dp);
  };

  // Live calculation inputs
  const calculationInputs: FinanceCalculationInputs = useMemo(() => {
    return {
      vehiclePrice,
      downPayment: downPaymentAmount,
      downPaymentPercent,
      annualInterestRate,
      loanTenureMonths,
      processingFee,
      otherUpfrontCharges,
      balloonPayment,
      currency,
      priceBasis,
      vehicleId: selectedVehicleId !== 'custom' ? selectedVehicleId : undefined,
      vehicleTitle,
    };
  }, [
    vehiclePrice,
    downPaymentAmount,
    downPaymentPercent,
    annualInterestRate,
    loanTenureMonths,
    processingFee,
    otherUpfrontCharges,
    balloonPayment,
    currency,
    priceBasis,
    selectedVehicleId,
    vehicleTitle,
  ]);

  // Execute precise financial calculation
  const calculationResult: FinanceCalculationResult = useMemo(() => {
    return calculateFinanceEMI(calculationInputs);
  }, [calculationInputs]);

  // Upfront on-road pricing estimate
  const onRoadBreakdown = useMemo(() => {
    return calculateOnRoadPrice(vehiclePrice, 'electric', 'maharashtra');
  }, [vehiclePrice]);

  // Comparison Management
  const addCurrentToComparison = () => {
    if (scenarios.length >= 4) {
      alert('You can compare a maximum of 4 scenarios simultaneously.');
      return;
    }
    const newScenario: FinanceScenario = {
      id: `scen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${loanTenureMonths}m @ ${annualInterestRate}% (${downPaymentPercent}% down)`,
      inputs: { ...calculationInputs },
      result: { ...calculationResult },
      isVerifiedProvider: false,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const loadScenarioIntoInputs = (s: FinanceScenario) => {
    setVehiclePrice(s.inputs.vehiclePrice);
    setDownPaymentPercent(s.inputs.downPaymentPercent);
    setDownPaymentAmount(s.inputs.downPayment);
    setAnnualInterestRate(s.inputs.annualInterestRate);
    setLoanTenureMonths(s.inputs.loanTenureMonths);
    setProcessingFee(s.inputs.processingFee);
    setOtherUpfrontCharges(s.inputs.otherUpfrontCharges);
    setBalloonPayment(s.inputs.balloonPayment || 0);
    if (s.inputs.vehicleId) {
      setSelectedVehicleId(s.inputs.vehicleId);
      setVehicleTitle(s.inputs.vehicleTitle || 'Vehicle');
    }
  };

  // Save scenario modal submit
  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const name = scenarioNameInput.trim() || `${vehicleTitle} (${loanTenureMonths}m @ ${annualInterestRate}%)`;
    saveUserFinanceScenario({
      userId: currentUser.id,
      name,
      vehicleId: selectedVehicleId !== 'custom' ? selectedVehicleId : undefined,
      vehicleTitle,
      inputs: calculationInputs,
      result: calculationResult,
    });
    setSaveSuccessMsg('Financing scenario saved to your account!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setSaveModalOpen(false);
      setScenarioNameInput('');
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070a',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: '6rem',
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          padding: '5rem 1.5rem 3rem',
          background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(16,185,129,0.15), transparent 70%), #05070a',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#34d399',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <Landmark size={14} />
            <span>Mathematical Reducing-Balance Amortization</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '0 0 1rem',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Smart Car Finance & EMI Studio
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#94a3b8',
              maxWidth: '680px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            Calculate true loan acquisition costs using reducing-balance mathematics, explore zero-interest manufacturer offers, and compare up to 4 financing scenarios side by side.
          </p>

          {/* Currency Toggle */}
          <div style={{ display: 'inline-flex', gap: '0.35rem', backgroundColor: 'rgba(30,41,59,0.6)', padding: '0.3rem', borderRadius: '10px' }}>
            {(['INR', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '7px',
                  backgroundColor: currency === c ? '#2563eb' : 'transparent',
                  border: 'none',
                  color: currency === c ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '2.5rem' }}>
          {/* Left Column: Calculator Controls */}
          <div
            style={{
              backgroundColor: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <SlidersHorizontal size={20} style={{ color: '#60a5fa' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Financing Assumptions</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnnualInterestRate(8.5);
                  setLoanTenureMonths(60);
                  setDownPaymentPercent(20);
                  setBalloonPayment(0);
                  setProcessingFee(5000);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Vehicle Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Select AutoVerse Catalog Vehicle (or Custom)
              </label>
              <select
                id="finance-vehicle-select"
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              >
                <option value="custom">Manual / Custom Vehicle Entry</option>
                {VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelYear || v.year} {v.brand} {v.model} ({v.powertrain})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Price Input */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Total Vehicle Price ({currency})
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa' }}>
                  {formatCurrency(vehiclePrice, currency)}
                </span>
              </div>
              <input
                id="finance-vehicle-price-input"
                type="number"
                min="0"
                step="50000"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Price Basis:</span>
                <select
                  value={priceBasis}
                  onChange={(e) => setPriceBasis(e.target.value as PriceBasis)}
                  style={{
                    backgroundColor: 'rgba(30,41,59,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ex_showroom">Ex-Showroom Baseline</option>
                  <option value="on_road">Estimated On-Road Total</option>
                  <option value="custom_invoice">Custom Dealership Invoice</option>
                </select>
              </div>
            </div>

            {/* Down Payment Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                  {formatCurrency(downPaymentAmount, currency)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  min="0"
                  max={vehiclePrice}
                  step="10000"
                  value={downPaymentAmount}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.8rem',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Slider for Down Payment % */}
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => handlePercentChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', marginBottom: '0.75rem', cursor: 'pointer' }}
              />

              {/* Quick % Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentChange(pct)}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: '8px',
                      backgroundColor: downPaymentPercent === pct ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.5)',
                      border: `1px solid ${downPaymentPercent === pct ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      color: downPaymentPercent === pct ? '#34d399' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Annual Interest Rate & Presets */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Annual Interest Rate (APR)
                </label>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: annualInterestRate === 0 ? '#10b981' : '#f8fafc' }}>
                  {annualInterestRate}% {annualInterestRate === 0 ? '(0% Zero-Interest)' : ''}
                </span>
              </div>

              <input
                id="finance-interest-rate-input"
                type="range"
                min="0"
                max="20"
                step="0.25"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6', marginBottom: '0.75rem', cursor: 'pointer' }}
              />

              {/* Verified Rate Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { label: '0% Special', rate: 0.0 },
                  { label: '3.99% Promo APR', rate: 3.99 },
                  { label: '7.85% Green EV', rate: 7.85 },
                  { label: '8.50% Standard', rate: 8.50 },
                  { label: '9.75% Floating', rate: 9.75 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setAnnualInterestRate(item.rate)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: annualInterestRate === item.rate ? 'rgba(59,130,246,0.2)' : 'rgba(30,41,59,0.5)',
                      border: `1px solid ${annualInterestRate === item.rate ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                      color: annualInterestRate === item.rate ? '#60a5fa' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Tenure Selection */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Loan Tenure ({loanTenureMonths} Months / {(loanTenureMonths / 12).toFixed(1)} Years)
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLoanTenureMonths(m)}
                    style={{
                      padding: '0.6rem 0.2rem',
                      borderRadius: '8px',
                      backgroundColor: loanTenureMonths === m ? '#2563eb' : 'rgba(30,41,59,0.6)',
                      border: `1px solid ${loanTenureMonths === m ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Processing Fee & Upfront Costs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Processing Fee ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={processingFee}
                  onChange={(e) => setProcessingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Documentation / Upfront
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={otherUpfrontCharges}
                  onChange={(e) => setOtherUpfrontCharges(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Optional Balloon Payment Expander */}
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: 'rgba(15,23,42,0.4)',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setShowBalloonSettings(!showBalloonSettings)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span>Optional Balloon Payment at Loan Maturity</span>
                {showBalloonSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showBalloonSettings && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                    A balloon payment is a lump sum scheduled at the end of the loan term, reducing monthly installments. Amortization present value: $PV(B) = B / (1+r)^n$.
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="25000"
                    value={balloonPayment}
                    onChange={(e) => setBalloonPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="Enter balloon amount"
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      backgroundColor: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                id="add-to-comparison-btn"
                type="button"
                onClick={addCurrentToComparison}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem',
                  backgroundColor: 'rgba(37,99,235,0.15)',
                  border: '1px solid rgba(37,99,235,0.3)',
                  borderRadius: '10px',
                  color: '#60a5fa',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                <span>Compare Scenario</span>
              </button>

              <button
                id="save-scenario-modal-btn"
                type="button"
                onClick={() => setSaveModalOpen(true)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <Save size={16} />
                <span>Save to My Account</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live EMI Results & Financial Outlay */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Primary Monthly EMI Card */}
            <div
              style={{
                borderRadius: '20px',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(16,185,129,0.2) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Monthly Repayment (EMI)
              </div>
              <div
                id="monthly-emi-display"
                style={{
                  fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  margin: '0.5rem 0',
                }}
              >
                {formatCurrency(calculationResult.monthlyEmi, currency)}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#cbd5e1' }}> / mo</span>
              </div>

              {calculationResult.isZeroInterest && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'rgba(16,185,129,0.2)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#34d399',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '9999px',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>0% Zero-Interest Loan Structure</span>
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.75rem' }}>
                Calculated on <strong style={{ color: '#ffffff' }}>{formatCurrency(calculationResult.loanPrincipal, currency)}</strong> financed principal over {loanTenureMonths} months.
              </div>
            </div>

            {/* Financial Summary Outlay Breakdown */}
            <div
              style={{
                backgroundColor: '#0a0f1d',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#ffffff' }}>
                Total Cost of Financing (No Double-Counting)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Down Payment ({downPaymentPercent}%):</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(calculationResult.downPayment, currency)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Financed Principal:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(calculationResult.loanPrincipal, currency)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Total Scheduled Loan Repayments:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(calculationResult.totalScheduledRepayments, currency)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Total Loan Interest Cost:</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                    {formatCurrency(calculationResult.totalInterest, currency)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Upfront Fees & Charges:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>
                    {formatCurrency(calculationResult.processingFee + calculationResult.otherUpfrontCharges, currency)}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '0.85rem',
                    marginTop: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>Total Acquisition Outlay:</span>
                  <span id="total-outlay-display" style={{ fontWeight: 800, color: '#38bdf8' }}>
                    {formatCurrency(calculationResult.totalFinancingOutlay, currency)}
                  </span>
                </div>
              </div>

              {/* Principal vs Interest Ratio Bar */}
              {calculationResult.loanPrincipal > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>Principal: {Math.round((calculationResult.loanPrincipal / (calculationResult.loanPrincipal + calculationResult.totalInterest)) * 100)}%</span>
                    <span>Interest: {Math.round((calculationResult.totalInterest / (calculationResult.loanPrincipal + calculationResult.totalInterest)) * 100)}%</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div
                      style={{
                        width: `${(calculationResult.loanPrincipal / (calculationResult.loanPrincipal + calculationResult.totalInterest)) * 100}%`,
                        backgroundColor: '#3b82f6',
                      }}
                    />
                    <div
                      style={{
                        width: `${(calculationResult.totalInterest / (calculationResult.loanPrincipal + calculationResult.totalInterest)) * 100}%`,
                        backgroundColor: '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links / Disclaimers */}
            <div
              style={{
                backgroundColor: 'rgba(30,41,59,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                fontSize: '0.82rem',
                color: '#94a3b8',
                lineHeight: 1.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Info size={15} />
                <span>Regulatory Disclosure</span>
              </div>
              Estimates are mathematical illustrations based on reducing-balance compounding and user-entered assumptions. Actual commercial terms, sanction letters, and applicable processing charges require official credit underwriting by an empaneled lender.
            </div>
          </div>
        </div>

        {/* Upfront & On-Road Price Breakdown Accordion */}
        <div
          style={{
            marginTop: '2.5rem',
            backgroundColor: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setShowOnRoadBreakdown(!showOnRoadBreakdown)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: '#10b981' }} />
              <span>Upfront & On-Road Price Breakdown ({priceBasis.replace('_', ' ')})</span>
            </div>
            {showOnRoadBreakdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showOnRoadBreakdown && (
            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ex-Showroom Base</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {formatCurrency(onRoadBreakdown.exShowroomPrice, currency)}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Registration & RTO Tax</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.2rem' }}>
                  {formatCurrency(onRoadBreakdown.registrationRoadTax, currency)}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Annual Comprehensive Insurance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                  {formatCurrency(onRoadBreakdown.insurance, currency)}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Estimated On-Road Price</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                  {formatCurrency(onRoadBreakdown.totalOnRoadPrice, currency)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amortization Schedule Accordion */}
        <div
          style={{
            marginTop: '2.5rem',
            backgroundColor: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setShowAmortizationTable(!showAmortizationTable)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Table size={18} style={{ color: '#60a5fa' }} />
              <span>Full Amortization Schedule ({loanTenureMonths} Installments)</span>
            </div>
            {showAmortizationTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showAmortizationTable && (
            <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Month</th>
                    <th style={{ padding: '0.75rem' }}>Payment (EMI)</th>
                    <th style={{ padding: '0.75rem' }}>Principal</th>
                    <th style={{ padding: '0.75rem' }}>Interest Portion</th>
                    <th style={{ padding: '0.75rem' }}>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calculationResult.monthlyBreakdown.map((row) => (
                    <tr
                      key={row.month}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: row.month % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.75rem', color: '#f8fafc', fontWeight: 600 }}>{row.month}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#38bdf8' }}>{formatCurrency(row.payment, currency)}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#34d399' }}>{formatCurrency(row.principal, currency)}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#f59e0b' }}>{formatCurrency(row.interest, currency)}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#cbd5e1' }}>{formatCurrency(row.remainingBalance, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Financing Scenarios Comparison Section */}
        {scenarios.length > 0 && (
          <div
            id="scenarios-comparison-section"
            style={{
              marginTop: '2.5rem',
              backgroundColor: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#ffffff' }}>
                  Financing Scenarios Comparison ({scenarios.length}/4)
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Evaluate trade-offs between lower monthly commitments vs overall interest paid over the loan lifecycle.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setScenarios([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Scenario</th>
                    <th style={{ padding: '0.75rem' }}>Down Payment</th>
                    <th style={{ padding: '0.75rem' }}>Loan Amount</th>
                    <th style={{ padding: '0.75rem' }}>Interest Rate</th>
                    <th style={{ padding: '0.75rem' }}>Tenure</th>
                    <th style={{ padding: '0.75rem' }}>Monthly EMI</th>
                    <th style={{ padding: '0.75rem' }}>Total Interest</th>
                    <th style={{ padding: '0.75rem' }}>Total Outlay</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: 'rgba(15,23,42,0.4)',
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#ffffff' }}>{s.name}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{formatCurrency(s.result.downPayment, currency)} ({s.inputs.downPaymentPercent}%)</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{formatCurrency(s.result.loanPrincipal, currency)}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: s.inputs.annualInterestRate === 0 ? '#10b981' : '#60a5fa', fontWeight: 600 }}>
                        {s.inputs.annualInterestRate}%
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>{s.inputs.loanTenureMonths} mos</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                        {formatCurrency(s.result.monthlyEmi, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#f59e0b' }}>
                        {formatCurrency(s.result.totalInterest, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#ffffff' }}>
                        {formatCurrency(s.result.totalFinancingOutlay, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => loadScenarioIntoInputs(s)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              backgroundColor: 'rgba(37,99,235,0.2)',
                              border: '1px solid rgba(37,99,235,0.4)',
                              borderRadius: '6px',
                              color: '#60a5fa',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => removeScenario(s.id)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              backgroundColor: 'rgba(239,68,68,0.1)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Save Scenario Modal */}
      {saveModalOpen && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Save Financing Estimate
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Name this scenario to revisit or compare it in your personal dashboard at <strong style={{ color: '#60a5fa' }}>/my-financing</strong>.
            </p>

            {saveSuccessMsg ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '10px',
                  color: '#34d399',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} />
                <span>{saveSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSaveScenario}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${vehicleTitle} - 5 Year Standard`}
                    value={scenarioNameInput}
                    onChange={(e) => setScenarioNameInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#94a3b8',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Scenario
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
