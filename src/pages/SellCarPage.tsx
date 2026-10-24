// AutoVerse Stage 21: Sell Your Car Multi-Step Wizard
// 4-step wizard for listing pre-owned vehicles with catalog auto-fill, condition transparency, and photo uploads.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VEHICLES } from '../data/vehicles';
import { createListing, formatMarketplacePrice } from '../utils/marketplaceStore';
import type {
  CreateListingPayload,
  VehicleCondition,
  ServiceHistoryType,
  MarketplaceCurrency,
} from '../types/marketplace';

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
];

export const SellCarPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCatalogSlug, setSelectedCatalogSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateListingPayload>({
    make: '',
    model: '',
    variant: '',
    year: 2022,
    askingPrice: 2500000,
    currency: 'INR',
    mileageKm: 25000,
    fuelType: 'petrol',
    transmission: 'automatic',
    bodyType: 'sedan',
    color: 'Obsidian Black',
    previousOwners: 1,
    locationCity: 'Mumbai',
    locationState: 'Maharashtra',
    locationCountry: 'India',
    registrationRegionMasked: 'MH-02-****',
    images: [SAMPLE_PHOTO_PRESETS[0]],
    overallCondition: 'excellent',
    declaredDefects: 'No known mechanical or cosmetic defects.',
    serviceHistory: 'full_oem',
    serviceHistoryNotes: 'Regularly serviced at authorized OEM service centre.',
    description: 'Carefully maintained vehicle in pristine mechanical condition. Clean interior, garage kept, and ready for immediate handover.',
    features: ['Panoramic Sunroof', 'Leather Upholstery', 'Cruise Control', 'Touchscreen Infotainment'],
    reasonForSelling: 'Upgrading to an EV.',
  });

  const [featureInput, setFeatureInput] = useState('');

  // Handle Catalog Pre-fill
  const handleCatalogSelect = (slug: string) => {
    setSelectedCatalogSlug(slug);
    if (!slug) return;
    const vehicle = VEHICLES.find((v) => v.slug === slug || v.id === slug);
    if (vehicle) {
      setFormData((prev) => ({
        ...prev,
        vehicleSlug: vehicle.slug,
        make: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant || 'Standard',
        year: vehicle.modelYear || 2023,
        bodyType: vehicle.bodyType as any,
        fuelType: vehicle.powertrain === 'electric' ? 'electric' : 'petrol',
        images: vehicle.imageGallery && vehicle.imageGallery.length > 0 ? vehicle.imageGallery : prev.images,
      }));
    }
  };

  // Photo Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMsg('Only JPEG, PNG, or WebP images are allowed.');
        return;
      }
      // Validate size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds maximum 5MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, event.target!.result as string].slice(0, 10),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const addPresetPhoto = (url: string) => {
    if (formData.images.includes(url)) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url].slice(0, 10),
    }));
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (formData.features.includes(featureInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput('');
  };

  const removeFeature = (feat: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feat),
    }));
  };

  // Validation before proceeding
  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.make || !formData.model) {
        setErrorMsg('Please specify both make and model.');
        return;
      }
      if (!formData.askingPrice || formData.askingPrice <= 0) {
        setErrorMsg('Please enter a valid asking price greater than 0.');
        return;
      }
      if (formData.mileageKm === undefined || formData.mileageKm < 0) {
        setErrorMsg('Please enter a valid odometer mileage.');
        return;
      }
      if (!formData.locationCity) {
        setErrorMsg('Please enter your city/location.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.description || formData.description.length < 20) {
        setErrorMsg('Description must be at least 20 characters long.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (formData.images.length === 0) {
        setErrorMsg('Please add at least one photo of your vehicle.');
        return;
      }
      setStep(4);
    }
  };

  // Submission to store
  const handleSubmitListing = () => {
    if (!currentUser) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = createListing(formData, currentUser, {
      autoApproveIfAdmin: currentUser.role === 'admin',
    });

    setIsSubmitting(false);
    if (result.success && result.listing) {
      setCreatedSlug(result.listing.slug);
      setStep(5);
    } else {
      setErrorMsg(result.error || 'Failed to submit vehicle listing.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '120px', color: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
          <Car size={54} color="var(--accent-cyan)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
            Sign In to Sell Your Vehicle
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            To protect marketplace buyers and keep listings verified, you must have an active AutoVerse driver or dealer account to publish vehicles.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to="/login?redirect=/sell-car"
              style={{
                padding: '0.8rem 1.8rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In to Continue
            </Link>
            <Link
              to="/register?redirect=/sell-car"
              style={{
                padding: '0.8rem 1.8rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#ffffff' }}>
      {/* Top Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(12, 16, 23, 0.8)', padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} />
            <span>AutoVerse Marketplace Studio</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.03em', margin: 0 }}>
            List Your Vehicle For Sale
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.5rem' }}>
            Reach thousands of serious automotive enthusiasts, collectors, and verified buyers worldwide.
          </p>

          {/* Stepper Progress Bar */}
          {step <= 4 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                marginTop: '2rem',
              }}
            >
              {[
                { num: 1, label: 'Vehicle Specs' },
                { num: 2, label: 'Condition & History' },
                { num: 3, label: 'Photographs' },
                { num: 4, label: 'Review & Publish' },
              ].map((s) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: step === s.num ? 'var(--accent-cyan)' : step > s.num ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                      color: step === s.num ? '#07090d' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                    }}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: step === s.num ? 700 : 500,
                      color: step === s.num ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="container" style={{ maxWidth: '840px', margin: '2.5rem auto 5rem', padding: '0 1rem' }}>
        {errorMsg && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: VEHICLE SPECIFICATIONS */}
        {step === 1 && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--border-medium)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              Step 1: Vehicle Specifications
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Select an existing AutoVerse catalog model to automatically pre-populate technical data, or enter details manually.
            </p>

            {/* Catalog Vehicle Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Auto-fill from AutoVerse Official Catalog (Optional)
              </label>
              <select
                value={selectedCatalogSlug}
                onChange={(e) => handleCatalogSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="">-- Manual Vehicle Entry --</option>
                {VEHICLES.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.brand} {v.model} ({v.variant})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Make / Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Porsche, Tesla, BMW, Tata"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taycan, Model S, Thar Roxx"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Trim / Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turbo S, Plaid, AX7L"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Model Year *
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Asking Price *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as MarketplaceCurrency })}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: Number(e.target.value) })}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Odometer Mileage (km) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.mileageKm}
                  onChange={(e) => setFormData({ ...formData, mileageKm: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Fuel / Powertrain *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                >
                  <option value="electric">Electric (EV)</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="plug_in_hybrid">Plug-in Hybrid (PHEV)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Transmission *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="dual_clutch">Dual Clutch (DCT / PDK)</option>
                  <option value="single_speed">Single-Speed (EV Direct Drive)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Body Style *
                </label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="estate">Estate / Wagon</option>
                  <option value="truck">Truck</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Location City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Bangalore, Hyderabad"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Masked Registration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-02-**** or KA-01-****"
                  value={formData.registrationRegionMasked || ''}
                  onChange={(e) => setFormData({ ...formData, registrationRegionMasked: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '0.8rem 1.8rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Continue to Condition & History</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONDITION & DESCRIPTION */}
        {step === 2 && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--border-medium)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              Step 2: Condition & Service History
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Declare the true mechanical & cosmetic condition. Honest disclosures build buyer trust and speed up sales.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Overall Condition Rating *
                </label>
                <select
                  value={formData.overallCondition}
                  onChange={(e) => setFormData({ ...formData, overallCondition: e.target.value as VehicleCondition })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                >
                  <option value="excellent">Excellent (Near Showroom, No Repaints)</option>
                  <option value="very_good">Very Good (Minor Stone Chips / Age-Appropriate)</option>
                  <option value="good">Good (Normal Wear, Fully Operational)</option>
                  <option value="fair">Fair (Known Cosmetic or Mechanical Service Needed)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Service Record Status *
                </label>
                <select
                  value={formData.serviceHistory}
                  onChange={(e) => setFormData({ ...formData, serviceHistory: e.target.value as ServiceHistoryType })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                >
                  <option value="full_oem">Full Authorized OEM Service History</option>
                  <option value="partial_oem">Partial OEM Service History</option>
                  <option value="independent_records">Independent Workshop Invoices Available</option>
                  <option value="none">No Detailed Service Records</option>
                </select>
              </div>
            </div>

            {/* Declared Defects */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Known Cosmetic or Mechanical Flaws *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Declare any minor scratch, curb rash, windshield chip, or past insurance claim..."
                value={formData.declaredDefects}
                onChange={(e) => setFormData({ ...formData, declaredDefects: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Full Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Detailed Seller Description * (Min 20 characters)
              </label>
              <textarea
                rows={5}
                required
                placeholder="Highlight your car's ownership history, garaging conditions, optional equipment, driving feel, and reason for selling..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Features Tags */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Notable Features & Packages
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Ventilated Seats, Adaptive Cruise, Ceramic Brakes"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  style={{
                    padding: '0.65rem 1.2rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-medium)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {formData.features.map((feat) => (
                  <span
                    key={feat}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feat)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '0.8rem 1.8rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Continue to Photographs</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTOGRAPHS */}
        {step === 3 && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--border-medium)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              Step 3: Vehicle Photographs
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Upload exterior 3/4 angles, interior cockpit, wheels, and odometer view. (Max 10 photos, up to 5MB each).
            </p>

            {/* Dropzone Container */}
            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                marginBottom: '1.5rem',
              }}
            >
              <Upload size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                Drag & drop vehicle photos or click to browse
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Supports JPEG, PNG, WebP format
              </div>
              <label
                style={{
                  display: 'inline-block',
                  padding: '0.65rem 1.4rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Choose Photos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Quick Preset Photos (Testing helper) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Or select high-resolution demo photography presets:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPresetPhoto(p)}
                    style={{
                      width: '60px',
                      height: '42px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-medium)',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img src={p} alt="Preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Current Photos Gallery Grid */}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Attached Photos ({formData.images.length} / 10)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    height: '100px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: idx === 0 ? '2px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                  }}
                >
                  <img src={img} alt="Vehicle view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: 'var(--accent-cyan)',
                        color: '#07090d',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Cover Photo
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '0.8rem 1.8rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Continue to Final Review</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & PUBLISH */}
        {step === 4 && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid var(--border-medium)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              Step 4: Review Listing Dossier
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Please review all entered details. Submissions undergo platform moderation before public activation.
            </p>

            {/* Preview Card */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img
                  src={formData.images[0]}
                  alt="Vehicle Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
                      {formData.year} {formData.make} {formData.model}
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {formData.variant}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      color: '#ffffff',
                    }}
                  >
                    {formatMarketplacePrice(formData.askingPrice, formData.currency)}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1.25rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div><strong>Odometer:</strong> {formData.mileageKm.toLocaleString()} km</div>
                  <div><strong>Fuel:</strong> {formData.fuelType}</div>
                  <div><strong>Transmission:</strong> {formData.transmission}</div>
                  <div><strong>Location:</strong> {formData.locationCity}</div>
                  <div><strong>Condition:</strong> {formData.overallCondition}</div>
                  <div><strong>Service:</strong> {formData.serviceHistory}</div>
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffffff' }}>Description:</strong> {formData.description}
                </div>
              </div>
            </div>

            {/* Moderation Policy Notice */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginBottom: '1.75rem',
              }}
            >
              🛡️ <strong>AutoVerse Marketplace Moderation Policy:</strong> To prevent fraud, all listings are reviewed by our moderation desk. Listings created by platform administrators publish immediately; member listings are verified within 2 to 4 business hours.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitListing}
                disabled={isSubmitting}
                style={{
                  padding: '0.85rem 2.2rem',
                  backgroundColor: 'var(--accent-cyan)',
                  color: '#07090d',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{isSubmitting ? 'Publishing Listing...' : 'Confirm & Publish Listing'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION SUCCESS */}
        {step === 5 && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '3rem 2rem',
              border: '1px solid var(--border-medium)',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', color: '#ffffff' }}>
              Listing Created Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Your vehicle listing for the <strong>{formData.year} {formData.make} {formData.model}</strong> has been logged.
              {currentUser?.role === 'admin'
                ? ' As an administrator, your listing is live immediately.'
                : ' It is currently queued for review at our moderation desk.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {createdSlug && (
                <Link
                  to={`/used-cars/${createdSlug}`}
                  style={{
                    padding: '0.75rem 1.6rem',
                    backgroundColor: 'var(--accent-cyan)',
                    color: '#07090d',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  View Public Listing
                </Link>
              )}
              <Link
                to="/my-listings"
                style={{
                  padding: '0.75rem 1.6rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-medium)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Seller Dashboard
              </Link>
              <Link
                to="/used-cars"
                style={{
                  padding: '0.75rem 1.6rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
