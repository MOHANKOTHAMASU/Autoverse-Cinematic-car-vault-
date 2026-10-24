import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { VEHICLES } from '../data/vehicles';
import {
  saveOwnerReview,
  getReviewById,
  submitOwnershipVerification,
} from '../utils/communityStore';
import type {
  OwnerReview,
  OwnershipDuration,
  DrivingCondition,
  CategoryRatings,
  DocumentType,
} from '../types/community';
import { StarRatingInput } from '../components/community/StarRatingInput';
import { useAuth } from '../context/AuthContext';

export const WriteReviewPage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  // Find vehicle
  const [selectedSlug, setSelectedSlug] = useState<string>(vehicleSlug || 'porsche-taycan-turbo-s');
  const vehicle = VEHICLES.find((v) => v.slug === selectedSlug || v.id === selectedSlug) || VEHICLES[0];

  // Form Fields
  const [variant, setVariant] = useState(vehicle.variant || '');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({
    comfort: 5,
    performance: 5,
    reliability: 5,
    practicality: 5,
    technology: 5,
    valueForMoney: 5,
  });
  const [includeCategoryRatings, setIncludeCategoryRatings] = useState(true);
  const [ownershipDuration, setOwnershipDuration] = useState<OwnershipDuration>('6_to_12_months');
  const [drivingConditions, setDrivingConditions] = useState<DrivingCondition>('mixed_daily');
  const [mileage, setMileage] = useState('');
  const [title, setTitle] = useState('');
  const [writtenExperience, setWrittenExperience] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [proInput, setProInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');

  // Running Cost Observations
  const [fuelEconomy, setFuelEconomy] = useState('');
  const [annualMaintenance, setAnnualMaintenance] = useState('');
  const [insuranceCost, setInsuranceCost] = useState('');
  const [repairsNotes, setRepairsNotes] = useState('');

  // Ownership Verification Submission
  const [requestVerification, setRequestVerification] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('registration_certificate');
  const [vinNumber, setVinNumber] = useState('');

  // Submission State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing review if in edit mode
  useEffect(() => {
    if (editId) {
      const existing = getReviewById(editId);
      if (existing) {
        setSelectedSlug(existing.vehicleSlug);
        setVariant(existing.vehicleVariant);
        setOverallRating(existing.overallRating);
        if (existing.categoryRatings) {
          setCategoryRatings(existing.categoryRatings);
          setIncludeCategoryRatings(true);
        }
        setOwnershipDuration(existing.ownershipDuration);
        setDrivingConditions(existing.drivingConditions);
        setMileage(existing.approximateMileage || '');
        setTitle(existing.title);
        setWrittenExperience(existing.writtenExperience);
        setPros(existing.pros || []);
        setCons(existing.cons || []);
        if (existing.ownershipCostObservations) {
          setFuelEconomy(existing.ownershipCostObservations.fuelEconomyObserved || '');
          setAnnualMaintenance(existing.ownershipCostObservations.annualMaintenanceCost || '');
          setInsuranceCost(existing.ownershipCostObservations.insuranceExperience || '');
          setRepairsNotes(existing.ownershipCostObservations.unexpectedRepairs || '');
        }
      }
    }
  }, [editId]);

  // Update vehicle variant default if vehicle changes
  useEffect(() => {
    if (vehicle && !editId) {
      setVariant(vehicle.variant || '');
    }
  }, [selectedSlug, vehicle, editId]);

  const handleAddPro = () => {
    if (proInput.trim() && !pros.includes(proInput.trim())) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim() && !cons.includes(conInput.trim())) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated || !currentUser) {
      setErrorMessage('Please sign in or create an AutoVerse driver profile to submit a review.');
      return;
    }

    if (overallRating < 1 || overallRating > 5) {
      setErrorMessage('Please select an overall rating between 1 and 5 stars.');
      return;
    }

    if (title.trim().length < 5) {
      setErrorMessage('Review headline must be at least 5 characters.');
      return;
    }

    if (writtenExperience.trim().length < 50) {
      setErrorMessage('Written experience must be at least 50 characters to provide helpful context.');
      return;
    }

    setIsSubmitting(true);

    const reviewData: Partial<OwnerReview> = {
      id: editId || undefined,
      vehicleSlug: selectedSlug,
      vehicleVariant: variant.trim() || vehicle.variant,
      overallRating,
      categoryRatings: includeCategoryRatings ? categoryRatings : undefined,
      ownershipDuration,
      drivingConditions,
      approximateMileage: mileage.trim() || undefined,
      title: title.trim(),
      writtenExperience: writtenExperience.trim(),
      pros,
      cons,
      ownershipCostObservations: {
        fuelEconomyObserved: fuelEconomy.trim() || undefined,
        annualMaintenanceCost: annualMaintenance.trim() || undefined,
        insuranceExperience: insuranceCost.trim() || undefined,
        unexpectedRepairs: repairsNotes.trim() || undefined,
      },
    };

    const res = saveOwnerReview(reviewData, currentUser);
    setIsSubmitting(false);

    if (res.success && res.review) {
      // If user requested verification with valid VIN, submit request
      if (requestVerification && vinNumber.trim().length >= 11) {
        submitOwnershipVerification(
          {
            vehicleSlug: selectedSlug,
            documentType: docType,
            vinNumber: vinNumber.trim(),
          },
          currentUser
        );
      }

      navigate(`/community/reviews/${res.review.id}`);
    } else {
      setErrorMessage(res.error || 'Failed to submit review.');
    }
  };

  // Guest Fallback
  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{ paddingTop: 'calc(var(--header-height) + 4rem)', minHeight: '80vh', textAlign: 'center', color: '#ffffff' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem', backgroundColor: 'rgba(10, 14, 22, 0.95)', border: '1px solid var(--border-medium)', borderRadius: '16px' }}>
          <ShieldCheck size={40} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Driver Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            To preserve community credibility and prevent automated spam, only authenticated AutoVerse members can submit vehicle owner reviews.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
          className="hover-cyan"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Master Card Form */}
        <div
          className="card-glass"
          style={{
            borderRadius: '16px',
            padding: '2.5rem',
            backgroundColor: 'rgba(10, 14, 22, 0.95)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AUTHENTIC DRIVER FEEDBACK
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0.35rem 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>
              {editId ? 'Edit Your Owner Review' : 'Submit an Owner Review'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Share your genuine daily driving experience to guide prospective buyers and automotive peers.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.75rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. VEHICLE SELECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Select Vehicle *
                </label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  disabled={Boolean(editId)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    backgroundColor: 'rgba(7, 9, 13, 0.8)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  {VEHICLES.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.brand} {v.model} ({v.modelYear || v.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Exact Variant / Trim Package
                </label>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. Turbo S, AWD Long Range, Fearless Plus AT..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    backgroundColor: 'rgba(7, 9, 13, 0.8)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 2. OVERALL RATING */}
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <StarRatingInput
                value={overallRating}
                onChange={setOverallRating}
                label="Overall Vehicle Rating"
                required
                size={28}
              />
            </div>

            {/* 3. DETAILED CATEGORY RATINGS (OPTIONAL) */}
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Detailed Category Ratings (Optional)
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Rate specific aspects of ownership or leave as default.
                  </span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={includeCategoryRatings}
                    onChange={(e) => setIncludeCategoryRatings(e.target.checked)}
                  />
                  <span>Include Detailed Scores</span>
                </label>
              </div>

              {includeCategoryRatings && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <StarRatingInput
                    value={categoryRatings.comfort || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, comfort: v })}
                    label="Comfort & Ergonomics"
                    size={20}
                  />
                  <StarRatingInput
                    value={categoryRatings.performance || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, performance: v })}
                    label="Performance & Dynamics"
                    size={20}
                  />
                  <StarRatingInput
                    value={categoryRatings.reliability || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, reliability: v })}
                    label="Mechanical Reliability"
                    size={20}
                  />
                  <StarRatingInput
                    value={categoryRatings.practicality || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, practicality: v })}
                    label="Daily Practicality"
                    size={20}
                  />
                  <StarRatingInput
                    value={categoryRatings.technology || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, technology: v })}
                    label="Tech & Infotainment"
                    size={20}
                  />
                  <StarRatingInput
                    value={categoryRatings.valueForMoney || 5}
                    onChange={(v) => setCategoryRatings({ ...categoryRatings, valueForMoney: v })}
                    label="Value for Money"
                    size={20}
                  />
                </div>
              )}
            </div>

            {/* 4. OWNERSHIP DURATION, DRIVING PROFILE & MILEAGE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Ownership Duration *
                </label>
                <select
                  value={ownershipDuration}
                  onChange={(e) => setOwnershipDuration(e.target.value as OwnershipDuration)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="less_than_6_months">Less than 6 Months</option>
                  <option value="6_to_12_months">6 to 12 Months</option>
                  <option value="1_to_2_years">1 to 2 Years</option>
                  <option value="2_to_5_years">2 to 5 Years</option>
                  <option value="5_plus_years">5+ Years</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Primary Driving Profile *
                </label>
                <select
                  value={drivingConditions}
                  onChange={(e) => setDrivingConditions(e.target.value as DrivingCondition)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="mixed_daily">Mixed Daily Use</option>
                  <option value="city_commuter">Urban City Commuting</option>
                  <option value="highway_cruiser">Long-Distance Highway</option>
                  <option value="spirited_track">Track Days & Spirited Backroads</option>
                  <option value="rural_offroad">Rural & Off-Road Terrain</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Approximate Mileage Logged
                </label>
                <input
                  type="text"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 14,500 miles / 22,000 km"
                  style={{ width: '100%', padding: '0.7rem 0.9rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* 5. REVIEW TITLE & WRITTEN EXPERIENCE */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Review Headline * (5–150 characters)
                </label>
                <span style={{ fontSize: '0.75rem', color: title.length > 150 ? '#ef4444' : 'var(--text-muted)' }}>
                  {title.length} / 150
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterclass in electric handling with zero thermal fatigue..."
                required
                maxLength={150}
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Detailed Ownership Experience * (min 50 characters)
                </label>
                <span style={{ fontSize: '0.75rem', color: writtenExperience.length < 50 ? '#f59e0b' : 'var(--text-muted)' }}>
                  {writtenExperience.length} / 3000 chars {writtenExperience.length < 50 && `(${50 - writtenExperience.length} more needed)`}
                </span>
              </div>
              <textarea
                value={writtenExperience}
                onChange={(e) => setWrittenExperience(e.target.value)}
                placeholder="Describe your ownership narrative: real-world driving impressions, highway composure, infotainment quirks, charging speed, build quality, and whether you'd purchase it again..."
                rows={6}
                required
                maxLength={3000}
                style={{ width: '100%', padding: '0.85rem 1rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: '#ffffff', fontSize: '0.92rem', outline: 'none', lineHeight: 1.6 }}
              />
            </div>

            {/* 6. PROS & CONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Pros */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', display: 'block', marginBottom: '0.4rem' }}>
                  Pros / Standout Strengths
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <input
                    type="text"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                    placeholder="e.g. Sub-2.5s launch control..."
                    style={{ flex: 1, padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {pros.map((p, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.76rem',
                        padding: '0.2rem 0.6rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#10b981',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {p}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setPros(pros.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '0.4rem' }}>
                  Cons / Observed Drawbacks
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <input
                    type="text"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                    placeholder="e.g. Rear visibility..."
                    style={{ flex: 1, padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {cons.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.76rem',
                        padding: '0.2rem 0.6rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#f59e0b',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {c}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCons(cons.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. RUNNING COST OBSERVATIONS (OPTIONAL) */}
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0, 240, 255, 0.02)', border: '1px dashed rgba(0, 240, 255, 0.25)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', margin: '0 0 0.35rem 0' }}>
                Real-World Ownership Costs (Optional)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Help prospective owners understand the actual financial footprint of this model.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Observed Fuel / Energy Economy
                  </label>
                  <input
                    type="text"
                    value={fuelEconomy}
                    onChange={(e) => setFuelEconomy(e.target.value)}
                    placeholder="e.g. 3.2 mi/kWh or 14.2 km/l"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Annual Maintenance Spend
                  </label>
                  <input
                    type="text"
                    value={annualMaintenance}
                    onChange={(e) => setAnnualMaintenance(e.target.value)}
                    placeholder="e.g. $350 or ₹12,000/year"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Insurance Experience
                  </label>
                  <input
                    type="text"
                    value={insuranceCost}
                    onChange={(e) => setInsuranceCost(e.target.value)}
                    placeholder="e.g. $1,800/yr comprehensive"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Unexpected Repairs / Warranty Notes
                  </label>
                  <input
                    type="text"
                    value={repairsNotes}
                    onChange={(e) => setRepairsNotes(e.target.value)}
                    placeholder="e.g. Minor sensor recall resolved..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 8. OWNERSHIP VERIFICATION REQUEST (OPTIONAL) */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Request Verified Owner Badge
                  </h3>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={requestVerification}
                    onChange={(e) => setRequestVerification(e.target.checked)}
                  />
                  <span>Apply for Verified Badge</span>
                </label>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                To earn the green <strong>Verified Owner</strong> badge, provide your vehicle identification sequence. Our Concierge team audits this privately. Your personal VIN is strictly masked and never made public.
              </p>

              {requestVerification && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                      Verification Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="registration_certificate">State Registration Certificate (RC)</option>
                      <option value="purchase_invoice">Official Dealership Purchase Invoice</option>
                      <option value="insurance_policy">Active Vehicle Insurance Endorsement</option>
                      <option value="title_deed">Vehicle Title Deed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                      Vehicle Identification Number (VIN / Chassis)
                    </label>
                    <input
                      type="text"
                      value={vinNumber}
                      onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                      placeholder="17-character VIN (Masked for privacy)"
                      maxLength={17}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(7, 9, 13, 0.8)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font-mono)' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                      Stored in secure concierge vault; publicly displayed as: {vinNumber ? `${vinNumber.slice(0, 6)}*****${vinNumber.slice(-4)}` : 'XXXXXX*****XXXX'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 9. SUBMIT BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Publishing...' : editId ? 'Save Changes' : 'Publish Owner Review'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
