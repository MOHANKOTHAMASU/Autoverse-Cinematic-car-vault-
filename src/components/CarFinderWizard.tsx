import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { WizardAnswers } from '../utils/carFinder';

interface CarFinderWizardProps {
  answers: WizardAnswers;
  onChangeAnswers: (updated: WizardAnswers) => void;
  onApply: () => void;
  onReset: () => void;
}

export const CarFinderWizard: React.FC<CarFinderWizardProps> = ({
  answers,
  onChangeAnswers,
  onApply,
  onReset,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;

  const handleSelectOption = (field: keyof WizardAnswers, value: any) => {
    onChangeAnswers({
      ...answers,
      [field]: value,
    });
  };

  const handleToggleMustHave = (featureKey: string) => {
    const existing = answers.mustHaveFeatures || [];
    const updated = existing.includes(featureKey)
      ? existing.filter((f) => f !== featureKey)
      : [...existing, featureKey];
    handleSelectOption('mustHaveFeatures', updated);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else onApply();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div
      className="card-glass"
      style={{
        padding: '1.75rem 2rem',
        borderRadius: '12px',
        backgroundColor: 'rgba(10, 14, 22, 0.85)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Ambient Glow Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
        }}
      />

      {/* Header and Step Indicator */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Guided Lifestyle Matching Wizard
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Question {currentStep} of {totalSteps} • Personalized Recommendation Engine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              transition: 'color 0.2s ease',
            }}
            title="Reset wizard answers to default"
          >
            <RotateCcw size={12} />
            Reset Answers
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '3px',
          marginBottom: '2rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(currentStep / totalSteps) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent-cyan), #3b82f6)',
            transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: '3px',
          }}
        />
      </div>

      {/* Step Content */}
      <div style={{ minHeight: '260px' }}>
        {/* Step 1: Budget */}
        {currentStep === 1 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              1. What is your approximate target budget?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Select your expected purchase bracket. We respect budget ceilings with strict price boundary enforcement.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'flexible', label: 'Open / Flexible Budget', sub: 'Explore all price spectrums' },
                { id: 'under_25k', label: 'Under $25,000 / ₹20 Lakh', sub: 'Value-oriented daily commuters' },
                { id: '25k_50k', label: '$25,000 – $50,000 / ₹20–40 Lakh', sub: 'Premium compact & mid-size' },
                { id: '50k_90k', label: '$50,000 – $90,000 / ₹40–75 Lakh', sub: 'Executive luxury & long-range EVs' },
                { id: '90k_150k', label: '$90,000 – $150,000 / ₹75L–1.3Cr', sub: 'Flagship sports sedans & prestige SUVs' },
                { id: 'above_150k', label: 'Above $150,000 / ₹1.3 Crore+', sub: 'High-performance supercars & hyper-GTs' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('budgetRange', opt.id)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.budgetRange === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.budgetRange === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.budgetRange === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Country / Market */}
        {currentStep === 2 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              2. Which regional market or country are you shopping in?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Ensures recommendations only include vehicles sold, delivered, or officially announced in your region.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'any', label: 'All Global Markets', sub: 'Browse international models & Indian market vehicles' },
                { id: 'india', label: 'India Market Spec', sub: 'Tata, Mahindra, Maruti, Hyundai India, Toyota Bharat' },
                { id: 'global', label: 'International / Global Spec', sub: 'North America, Europe, and Global homologations' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('market', opt.id)}
                  style={{
                    padding: '1.1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.market === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.market === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.market === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Vehicle Body Type */}
        {currentStep === 3 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              3. What vehicle silhouette and body style do you prefer?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              From commanding SUVs with rough-road capability to aerodynamic sedans and agile city hatchbacks.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'any', label: 'Open to Any Body Style', sub: 'Consider all suitable vehicle classes' },
                { id: 'suv', label: 'SUV & Compact SUV', sub: 'High seating, ground clearance, versatility' },
                { id: 'sedan', label: 'Executive Sedan', sub: 'Aerodynamic comfort, refinement & trunk storage' },
                { id: 'hatchback', label: 'Hatchback & Crossover', sub: 'Agile city footprint, easy parking & utility' },
                { id: 'sports_car', label: 'Sports Car & Coupe', sub: 'Driver-centric dynamics, styling & agility' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('preferredBody', opt.id)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.preferredBody === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.preferredBody === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.preferredBody === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Powertrain */}
        {currentStep === 4 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              4. Which powertrain technology aligns with your lifestyle?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Electric silence, hybrid efficiency, or traditional internal combustion punch.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'any', label: 'Any Powertrain', sub: 'Compare EVs, hybrids, and ICE vehicles side by side' },
                { id: 'electric', label: '100% Electric (BEV)', sub: 'Zero tailpipe emissions, home charging, instant torque' },
                { id: 'hybrid', label: 'Strong Hybrid (HEV / PHEV)', sub: 'Self-charging or plug-in, 50+ MPG fuel savings' },
                { id: 'petrol', label: 'Turbo Petrol', sub: 'High-revving mechanical soundtrack & immediate refuel' },
                { id: 'diesel', label: 'Turbo Diesel', sub: 'Massive low-end torque & 800+ km highway cruising range' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('preferredPowertrain', opt.id)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.preferredPowertrain === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.preferredPowertrain === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.preferredPowertrain === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Primary Driving Use */}
        {currentStep === 5 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              5. How will you primarily use this vehicle?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              We factor chassis tuning, suspension absorption, luggage capacity, and maneuverability into the scoring.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'family', label: 'Family & Daily Utility', sub: 'Rear legroom, child seat mounts, and grocery boot space' },
                { id: 'city', label: 'City Driving & Commutes', sub: 'Stop-and-go efficiency, light steering & compact radius' },
                { id: 'highway', label: 'Highways & Long Distance', sub: 'High-speed acoustic insulation & cruise stability' },
                { id: 'performance', label: 'Performance & Mountain Roads', sub: 'Lateral grip, sharp turn-in & sub-5s acceleration' },
                { id: 'offroad', label: 'Unpaved Trails & Bad Roads', sub: '4x4 traction, high approach angles & underbody armor' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('primaryUse', opt.id)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.primaryUse === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.primaryUse === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.primaryUse === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Minimum Seating Capacity */}
        {currentStep === 6 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              6. How many passenger seats do you strictly require?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              This is enforced as a mandatory constraint. We will not recommend 2-seat or 4-seat cars if you need 5+ seats.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
              {[
                { count: 0, label: 'Any Seating (Open)', sub: '2, 4, 5, or 7+ passenger layouts' },
                { count: 2, label: '2 Seats', sub: 'Dedicated sport cockpits (e.g. Porsche 911 GT3 RS)' },
                { count: 4, label: '4 Seats', sub: 'Executive four-passenger seating & 2+2 grand tourers' },
                { count: 5, label: '5 Seats (Standard)', sub: 'Universal family seating with 3-passenger rear bench' },
                { count: 7, label: '6 to 7+ Seats', sub: 'Three-row versatility (e.g. Innova Hycross, Safari, XUV700)' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  onClick={() => handleSelectOption('minSeats', opt.count)}
                  style={{
                    padding: '1.2rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.minSeats === opt.count ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.minSeats === opt.count ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.minSeats === opt.count && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Core Priority That Matters Most */}
        {currentStep === 7 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              7. Which dimension matters most in your purchasing decision?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              This dynamically biases our scoring weights towards your primary priority.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: 'safety', label: 'Verified Safety Information', sub: 'Euro NCAP / Bharat NCAP 5-star crash tests & active ADAS' },
                { id: 'efficiency', label: 'EV Range & Fuel Economy', sub: 'Longest miles per charge or highest MPG / km/l' },
                { id: 'performance', label: 'Performance & Rapid Acceleration', sub: 'Horsepower, high top speed & sub-4s 0-60 MPH' },
                { id: 'price', label: 'Price & Total Value', sub: 'Lowest purchase acquisition cost for verified features' },
                { id: 'comfort', label: 'Acoustic Comfort & Luxury', sub: 'Plush upholstery, multi-zone climate & soundstage' },
                { id: 'practicality', label: 'Practical Space & Boot Cargo', sub: 'Max cubic liters of cargo & versatile luggage layout' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption('primaryPriority', opt.id)}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: answers.primaryPriority === opt.id ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${answers.primaryPriority === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                    {answers.primaryPriority === opt.id && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Must-Have Features (Multi-select) */}
        {currentStep === 8 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
              8. Are there any must-have engineering or comfort features?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Select all options that you consider essential. (Optional — you may skip or select multiple).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { id: '5star_safety', label: '5-Star NCAP Safety Rating', sub: 'Tested adult occupant protection cell' },
                { id: 'adas', label: 'Level 2 ADAS Driving Guidance', sub: 'Adaptive cruise control & lane centering' },
                { id: 'awd', label: 'All-Wheel Drive (AWD / 4x4)', sub: 'Dual motors or mechanical 4WD transfer case' },
                { id: 'fast_charging', label: 'Ultra-Fast DC Fast Charging', sub: '130kW+ or 800V silicon carbide architecture' },
                { id: 'ventilated_seats', label: 'Ventilated / Cooled Seats', sub: 'Perforated leather cooling fans' },
                { id: 'large_boot', label: 'Extra Large Boot (450L+)', sub: 'Sufficient volume for 4 full-size travel bags' },
              ].map((opt) => {
                const isChecked = (answers.mustHaveFeatures || []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleToggleMustHave(opt.id)}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      borderRadius: '8px',
                      backgroundColor: isChecked ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isChecked ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{opt.label}</span>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `1px solid ${isChecked ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.3)'}`,
                          backgroundColor: isChecked ? 'var(--accent-cyan)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isChecked && <Check size={12} color="#07090d" />}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: currentStep === 1 ? 'rgba(255, 255, 255, 0.25)' : '#ffffff',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentStep < totalSteps ? (
            <>
              <button
                onClick={nextStep}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '0.6rem 0.9rem',
                }}
              >
                Skip Question
              </button>
              <button
                onClick={nextStep}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={onApply}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.75rem',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                fontWeight: 700,
              }}
            >
              <Sparkles size={16} />
              View Recommended Vehicles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
