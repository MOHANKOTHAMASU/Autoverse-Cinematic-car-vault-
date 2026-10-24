// AutoVerse Stage 20: Test-Drive Reservation Engine & User Dashboard
// Multi-step verified test-drive booking workflow and driver booking dashboard.

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VEHICLES } from '../data/vehicles';
import {
  getAllDealers,
  getDealerBySlug,
  getDealerById,
  checkSlotAvailability,
  createTestDriveBooking,
  getUserBookings,
  cancelBooking,
  requestReschedule,
} from '../utils/dealerStore';
import type { Dealership, TestDriveBooking, TestDriveStatus } from '../types/dealer';

export const TestDriveBookingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Active top-level tab: 'book' or 'my_bookings'
  const initialTab = searchParams.get('tab') === 'my_bookings' ? 'my_bookings' : 'book';
  const [activeTab, setActiveTab] = useState<'book' | 'my_bookings'>(initialTab);

  // Pre-selected query parameters
  const preSelectedDealerSlug = searchParams.get('dealer');
  const preSelectedVehicleSlug = searchParams.get('vehicle');

  // Dealerships list
  const [dealers, setDealers] = useState<Dealership[]>(() => getAllDealers());

  // -----------------------------------------------------------------
  // WIZARD STATE (Step 1: Vehicle -> Step 2: Dealer -> Step 3: Slot -> Step 4: Driver -> Step 5: Confirmed)
  // -----------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Vehicle & Variant selection
  const [selectedVehicleSlug, setSelectedVehicleSlug] = useState<string>(preSelectedVehicleSlug || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [vehicleFilterMarque, setVehicleFilterMarque] = useState<string>('all');
  const [vehicleSearchText, setVehicleSearchText] = useState<string>('');

  // Step 2: Dealer selection
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');

  // Step 3: Date & Slot
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('');
  const [slotCheckResult, setSlotCheckResult] = useState<{ available: boolean; remainingCapacity: number; reason?: string } | null>(null);

  // Step 4: Contact details & Consent
  const [driverName, setDriverName] = useState(currentUser?.fullName || '');
  const [driverEmail, setDriverEmail] = useState(currentUser?.email || '');
  const [driverPhone, setDriverPhone] = useState(currentUser?.phone || '');
  const [driverNotes, setDriverNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<TestDriveBooking | null>(null);

  // My Bookings State
  const [userBookings, setUserBookings] = useState<TestDriveBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [reschedulingBooking, setReschedulingBooking] = useState<TestDriveBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Pre-fill user profile if available
  useEffect(() => {
    if (currentUser) {
      if (!driverName) setDriverName(currentUser.fullName);
      if (!driverEmail) setDriverEmail(currentUser.email);
      if (!driverPhone && currentUser.phone) setDriverPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Handle URL pre-selections
  useEffect(() => {
    if (preSelectedDealerSlug) {
      const d = getDealerBySlug(preSelectedDealerSlug);
      if (d) {
        setSelectedDealerId(d.id);
        if (selectedVehicleSlug) {
          setCurrentStep(3); // Vehicle and dealer known, jump to slot
        } else {
          setCurrentStep(1);
        }
      }
    }
  }, [preSelectedDealerSlug]);

  // Load user bookings
  const refreshUserBookings = () => {
    const userId = currentUser?.id || 'demo_user';
    const list = getUserBookings(userId);
    setUserBookings(list);
  };

  useEffect(() => {
    refreshUserBookings();
    const handleDealers = () => setDealers(getAllDealers());
    window.addEventListener('autoverse_dealers_updated', handleDealers);
    window.addEventListener('autoverse_test_drives_updated', refreshUserBookings);
    return () => {
      window.removeEventListener('autoverse_dealers_updated', handleDealers);
      window.removeEventListener('autoverse_test_drives_updated', refreshUserBookings);
    };
  }, [currentUser?.id]);

  // Active selected vehicle object
  const activeVehicle = useMemo(() => {
    if (!selectedVehicleSlug) return undefined;
    return VEHICLES.find((v) => v.slug === selectedVehicleSlug || v.id === selectedVehicleSlug);
  }, [selectedVehicleSlug]);

  // Active selected dealer object
  const activeDealer = useMemo(() => {
    if (!selectedDealerId) return undefined;
    return getDealerById(selectedDealerId);
  }, [selectedDealerId, dealers]);

  // Filtered dealerships eligible for the selected vehicle
  const eligibleDealers = useMemo(() => {
    if (!activeVehicle) return dealers.filter((d) => d.active);
    return dealers.filter((d) => {
      if (!d.active) return false;
      const brandMatch = d.supportedBrands.some(
        (b) => b.toLowerCase() === activeVehicle.brand.toLowerCase()
      );
      const inventoryMatch =
        d.inventoryVehicleIds.includes(activeVehicle.slug) ||
        d.inventoryVehicleIds.includes(activeVehicle.id);
      return brandMatch || inventoryMatch;
    });
  }, [activeVehicle, dealers]);

  // Filtered catalog vehicles for Step 1
  const catalogVehicles = useMemo(() => {
    return VEHICLES.filter((v) => {
      if (vehicleFilterMarque !== 'all' && v.brand.toLowerCase() !== vehicleFilterMarque.toLowerCase()) {
        return false;
      }
      if (vehicleSearchText.trim()) {
        const q = vehicleSearchText.toLowerCase();
        const matches =
          v.model.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [vehicleFilterMarque, vehicleSearchText]);

  // Check slot availability when date or slot changes
  useEffect(() => {
    if (activeDealer && preferredDate && preferredTimeSlot) {
      const res = checkSlotAvailability(activeDealer.id, preferredDate, preferredTimeSlot);
      setSlotCheckResult(res);
    } else {
      setSlotCheckResult(null);
    }
  }, [activeDealer, preferredDate, preferredTimeSlot]);

  // Minimum date for calendar picker: tomorrow
  const minDateString = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // Maximum date based on dealer's slotConfig
  const maxDateString = useMemo(() => {
    const days = activeDealer?.slotConfig.daysInAdvance || 21;
    const maxD = new Date();
    maxD.setDate(maxD.getDate() + days);
    return maxD.toISOString().split('T')[0];
  }, [activeDealer]);

  // -------------------------------------------------------------
  // SUBMIT TEST-DRIVE REQUEST
  // -------------------------------------------------------------
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!activeVehicle) {
      setSubmissionError('Please select a vehicle from the catalog.');
      setCurrentStep(1);
      return;
    }

    if (!activeDealer) {
      setSubmissionError('Please select an authorized dealership.');
      setCurrentStep(2);
      return;
    }

    if (!preferredDate || !preferredTimeSlot) {
      setSubmissionError('Please select a preferred test-drive date and available departure slot.');
      setCurrentStep(3);
      return;
    }

    if (!driverName.trim() || !driverEmail.trim() || !driverPhone.trim()) {
      setSubmissionError('Please provide complete driver contact details.');
      return;
    }

    if (!consentGiven) {
      setSubmissionError('You must acknowledge consent to share your details with the dealership.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = currentUser?.id || `guest_${Date.now()}`;
      const res = createTestDriveBooking({
        userId,
        userName: driverName,
        userEmail: driverEmail,
        userPhone: driverPhone,
        dealerId: activeDealer.id,
        vehicleSlug: activeVehicle.slug,
        variantName: selectedVariantId || activeVehicle.variant,
        preferredDate,
        preferredTimeSlot,
        userNotes: driverNotes,
        userConsentGiven: true,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setCurrentStep(5); // Step 5: Success view
      } else {
        setSubmissionError(res.message);
      }
    } catch {
      setSubmissionError('A communication error occurred while processing the reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // CANCEL BOOKING ACTION
  // -------------------------------------------------------------
  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return;
    const userId = currentUser?.id || 'demo_user';
    const res = cancelBooking(cancellingBookingId, userId, cancelReason);
    if (res.success) {
      setCancellingBookingId(null);
      setCancelReason('');
      refreshUserBookings();
    } else {
      alert(res.message);
    }
  };

  // -------------------------------------------------------------
  // RESCHEDULE ACTION
  // -------------------------------------------------------------
  const handleConfirmReschedule = () => {
    if (!reschedulingBooking || !rescheduleDate || !rescheduleSlot) {
      setRescheduleError('Please choose both a new date and departure slot.');
      return;
    }
    setRescheduleError(null);
    const userId = currentUser?.id || 'demo_user';
    const res = requestReschedule(
      reschedulingBooking.id,
      userId,
      rescheduleDate,
      rescheduleSlot,
      rescheduleReason
    );
    if (res.success) {
      setReschedulingBooking(null);
      setRescheduleDate('');
      setRescheduleSlot('');
      setRescheduleReason('');
      refreshUserBookings();
    } else {
      setRescheduleError(res.message);
    }
  };

  // Status badge styling helper
  const renderStatusBadge = (status: TestDriveStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case 'pending_confirmation':
      case 'requested':
        return (
          <span
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              color: '#facc15',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={12} /> Pending Dealer Confirmation
          </span>
        );
      case 'reschedule_requested':
        return (
          <span
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={12} /> Reschedule Requested
          </span>
        );
      case 'completed':
        return (
          <span
            style={{
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#cbd5e1',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Completed
          </span>
        );
      case 'cancelled':
      case 'rejected':
      case 'no_show':
        return (
          <span
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
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
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan">
              <Clock size={12} /> STAGE 20 TEST-DRIVE HUB
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              FACTORY DEMONSTRATION DISPATCH
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
            Test-Drive Experience & Reservations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '750px' }}>
            Schedule an instrumented on-road or track demonstration with authorized OEM specialists.
            Real-time exclusive slot availability and direct digital confirmation.
          </p>
        </div>

        {/* Top-Level Navigation Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          <button
            onClick={() => {
              setActiveTab('book');
              setSearchParams({}, { replace: true });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'book' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'book' ? '#07090d' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={16} /> Book a Test Drive
          </button>

          <button
            onClick={() => {
              setActiveTab('my_bookings');
              setSearchParams({ tab: 'my_bookings' }, { replace: true });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'my_bookings' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'my_bookings' ? '#07090d' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={16} /> My Reservations ({userBookings.length})
          </button>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: BOOKING WIZARD */}
        {/* ============================================================= */}
        {activeTab === 'book' && (
          <div>
            {/* Step Progress Indicator (if not on confirmed step 5) */}
            {currentStep < 5 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2.5rem',
                  gap: '0.5rem',
                }}
              >
                {[
                  { num: 1, label: '1. Select Vehicle' },
                  { num: 2, label: '2. Choose Dealer' },
                  { num: 3, label: '3. Departure Slot' },
                  { num: 4, label: '4. Driver Details' },
                ].map((s) => (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num);
                    }}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '8px',
                      backgroundColor: currentStep === s.num ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid',
                      borderColor: currentStep === s.num ? 'var(--accent-cyan)' : currentStep > s.num ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)',
                      color: currentStep === s.num ? 'var(--accent-cyan)' : currentStep > s.num ? '#34d399' : 'var(--text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: s.num < currentStep ? 'pointer' : 'default',
                    }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}

            {/* Error Banner */}
            {submissionError && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  color: '#f87171',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>{submissionError}</div>
              </div>
            )}

            {/* STEP 1: SELECT VEHICLE & VARIANT */}
            {currentStep === 1 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '2rem',
                }}
              >
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Step 1: Select a Vehicle for Demonstration
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Choose any vehicle from the AutoVerse verified catalog to check authorized dealership availability.
                </p>

                {/* Filter Row */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      flex: '1 1 260px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                    }}
                  >
                    <Search size={16} color="var(--accent-cyan)" />
                    <input
                      type="text"
                      placeholder="Search car model..."
                      value={vehicleSearchText}
                      onChange={(e) => setVehicleSearchText(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%',
                      }}
                    />
                  </div>

                  <select
                    value={vehicleFilterMarque}
                    onChange={(e) => setVehicleFilterMarque(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '0.65rem 1rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                      minWidth: '160px',
                    }}
                  >
                    <option value="all" style={{ background: '#0a0d14' }}>
                      All Marques
                    </option>
                    {Array.from(new Set(VEHICLES.map((v) => v.brand)))
                      .sort()
                      .map((b) => (
                        <option key={b} value={b} style={{ background: '#0a0d14' }}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Vehicle Selection Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem',
                    maxHeight: '450px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  {catalogVehicles.map((vehicle) => {
                    const isSelected = selectedVehicleSlug === vehicle.slug;
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => {
                          setSelectedVehicleSlug(vehicle.slug);
                          setSelectedVariantId(vehicle.variant);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 16px rgba(0, 240, 255, 0.25)' : 'none',
                        }}
                      >
                        <div style={{ height: '110px', position: 'relative' }}>
                          <img
                            src={vehicle.thumbnail || vehicle.heroImage}
                            alt={vehicle.model}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {vehicle.brand.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                            {vehicle.model}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>
                            {vehicle.variant}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    disabled={!selectedVehicleSlug}
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', opacity: selectedVehicleSlug ? 1 : 0.5 }}
                  >
                    Continue to Dealership Selection <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT DEALERSHIP */}
            {currentStep === 2 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '2rem',
                }}
              >
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Step 2: Select an Authorized Dealership
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Showing authorized centers supporting{' '}
                  <strong style={{ color: 'var(--accent-cyan)' }}>{activeVehicle?.brand} {activeVehicle?.model}</strong>.
                </p>

                {eligibleDealers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {eligibleDealers.map((dealer) => {
                      const isSelected = selectedDealerId === dealer.id;
                      return (
                        <div
                          key={dealer.id}
                          onClick={() => setSelectedDealerId(dealer.id)}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                {dealer.name}
                              </h3>
                              {dealer.verified && (
                                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                                  VERIFIED OEM
                                </span>
                              )}
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                              {dealer.address.street}, {dealer.address.city}, {dealer.address.state}, {dealer.address.country}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <span>Tel: {dealer.phone}</span>
                              <span>Hours: {dealer.openingHours.monday}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.45rem 1rem',
                                borderRadius: '6px',
                                backgroundColor: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                                color: isSelected ? '#07090d' : '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                              }}
                            >
                              {isSelected ? 'Selected' : 'Select Showroom'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No authorized dealerships currently found for {activeVehicle?.brand}. Please select a different car.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setCurrentStep(1)} className="btn btn-outline">
                    <ArrowLeft size={16} /> Back to Vehicle
                  </button>

                  <button
                    disabled={!selectedDealerId}
                    onClick={() => setCurrentStep(3)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', opacity: selectedDealerId ? 1 : 0.5 }}
                  >
                    Continue to Slot Selection <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DEPARTURE DATE & TIME SLOT */}
            {currentStep === 3 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '2rem',
                }}
              >
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Step 3: Schedule Preferred Departure Slot
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {activeDealer?.name} accepts automated test drives up to{' '}
                  <strong style={{ color: 'var(--accent-cyan)' }}>{activeDealer?.slotConfig.daysInAdvance} days</strong> in advance.
                </p>

                {/* Date Picker */}
                <div style={{ marginBottom: '1.75rem', maxWidth: '350px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Select Test-Drive Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    min={minDateString}
                    max={maxDateString}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Available Slot Pills */}
                <div style={{ marginBottom: '2rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Select Available Departure Window
                  </label>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {activeDealer?.slotConfig.slotTimes.map((slot) => {
                      const isSelected = preferredTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setPreferredTimeSlot(slot)}
                          style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                            backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? 'var(--accent-cyan)' : '#ffffff',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slot Validation Message */}
                {slotCheckResult && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      backgroundColor: slotCheckResult.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${slotCheckResult.available ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: slotCheckResult.available ? '#34d399' : '#f87171',
                      fontSize: '0.85rem',
                    }}
                  >
                    {slotCheckResult.available
                      ? `✓ Slot is available! (${slotCheckResult.remainingCapacity} vehicle spot remaining)`
                      : slotCheckResult.reason}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setCurrentStep(2)} className="btn btn-outline">
                    <ArrowLeft size={16} /> Back to Dealer
                  </button>

                  <button
                    disabled={!preferredDate || !preferredTimeSlot || Boolean(slotCheckResult && !slotCheckResult.available)}
                    onClick={() => setCurrentStep(4)}
                    className="btn btn-primary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      opacity: preferredDate && preferredTimeSlot && (!slotCheckResult || slotCheckResult.available) ? 1 : 0.5,
                    }}
                  >
                    Continue to Driver Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DRIVER DETAILS & CONSENT */}
            {currentStep === 4 && (
              <form
                onSubmit={handleBookingSubmit}
                autoComplete="off"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '2rem',
                }}
              >
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Step 4: Driver Credentials & Consent
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Confirm your contact information to submit the reservation request to {activeDealer?.name}.
                </p>

                {/* Summary Box */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    marginBottom: '1.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      SELECTED VEHICLE
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {activeVehicle?.brand} {activeVehicle?.model} ({selectedVariantId || activeVehicle?.variant})
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      SHOWROOM
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {activeDealer?.name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      DATE & TIME
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {preferredDate} • {preferredTimeSlot}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Full Driver Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Marcus Vance"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        padding: '0.7rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      placeholder="driver@domain.com"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        padding: '0.7rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '6px',
                        padding: '0.7rem 0.85rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Optional Note or Request for Showroom Specialist
                  </label>
                  <textarea
                    rows={3}
                    value={driverNotes}
                    onChange={(e) => setDriverNotes(e.target.value)}
                    placeholder="e.g. Interested in testing regenerative braking feel and track package options..."
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '0.7rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Consent Checkbox */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    style={{ marginTop: '0.2rem', accentColor: 'var(--accent-cyan)' }}
                  />
                  <label htmlFor="consent" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    I consent to share my name, telephone, and email details with {activeDealer?.name} for the explicit purpose
                    of scheduling, confirming, and executing this manufacturer test drive in accordance with AutoVerse Privacy Standards.
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-outline">
                    <ArrowLeft size={16} /> Back to Slot
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !consentGiven}
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2rem', opacity: consentGiven && !isSubmitting ? 1 : 0.6 }}
                  >
                    {isSubmitting ? 'Submitting Reservation...' : 'Confirm Test-Drive Request'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: CONFIRMATION DOSSIER */}
            {currentStep === 5 && confirmedBooking && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
                  RESERVATION CREATED
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Test Drive Request Submitted!
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
                  Your request has been officially registered with {confirmedBooking.dealerName}. An automated confirmation
                  notification has been sent to your account.
                </p>

                {/* Booking Code Card */}
                <div
                  style={{
                    maxWidth: '480px',
                    margin: '0 auto 2rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      BOOKING REFERENCE
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {confirmedBooking.bookingReference}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      <div>{renderStatusBadge(confirmedBooking.status)}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                      <strong style={{ color: '#ffffff' }}>{confirmedBooking.vehicleName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Showroom:</span>
                      <span style={{ color: '#ffffff' }}>{confirmedBooking.dealerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date & Slot:</span>
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>
                        {confirmedBooking.preferredDate} ({confirmedBooking.preferredTimeSlot})
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to={`/test-drive/${confirmedBooking.id}`}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    View Reservation Dossier <ChevronRight size={16} />
                  </Link>

                  <button
                    onClick={() => {
                      setActiveTab('my_bookings');
                      setCurrentStep(1);
                      setConfirmedBooking(null);
                      setSearchParams({ tab: 'my_bookings' });
                    }}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    View All My Reservations
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: MY TEST DRIVES */}
        {/* ============================================================= */}
        {activeTab === 'my_bookings' && (
          <div>
            {/* Status Filter Sub-Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1.75rem',
              }}
            >
              {[
                { id: 'all', label: 'All Bookings' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'pending', label: 'Pending Confirmation' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((filter) => {
                const isSelected = statusFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Bookings List */}
            {userBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {userBookings
                  .filter((b) => {
                    if (statusFilter === 'all') return true;
                    if (statusFilter === 'confirmed') return b.status === 'confirmed';
                    if (statusFilter === 'pending')
                      return b.status === 'pending_confirmation' || b.status === 'requested' || b.status === 'reschedule_requested';
                    if (statusFilter === 'completed') return b.status === 'completed';
                    if (statusFilter === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
                    return true;
                  })
                  .map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        {booking.vehicleImageUrl && (
                          <div
                            style={{
                              width: '90px',
                              height: '65px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={booking.vehicleImageUrl}
                              alt={booking.vehicleName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: 'var(--accent-cyan)',
                              }}
                            >
                              {booking.bookingReference}
                            </span>
                            {renderStatusBadge(booking.status)}
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
                            {booking.vehicleName}
                          </h3>

                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            {booking.dealerName} • {booking.confirmedDate || booking.preferredDate} (
                            {booking.confirmedTimeSlot || booking.preferredTimeSlot})
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link
                          to={`/test-drive/${booking.id}`}
                          className="btn btn-outline"
                          style={{ fontSize: '0.82rem', padding: '0.55rem 0.9rem' }}
                        >
                          View Dossier
                        </Link>

                        {/* Reschedule button if active */}
                        {['requested', 'pending_confirmation', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => {
                              setReschedulingBooking(booking);
                              setRescheduleDate(booking.preferredDate);
                            }}
                            className="btn btn-outline"
                            style={{ fontSize: '0.82rem', padding: '0.55rem 0.9rem' }}
                          >
                            Reschedule
                          </button>
                        )}

                        {/* Cancel button if active */}
                        {['requested', 'pending_confirmation', 'confirmed', 'reschedule_requested'].includes(booking.status) && (
                          <button
                            onClick={() => setCancellingBookingId(booking.id)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#f87171',
                              borderRadius: '6px',
                              padding: '0.55rem 0.9rem',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: '16px',
                }}
              >
                <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Test-Drive Reservations Found
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  You have not scheduled any manufacturer demonstration drives yet. Select an authorized showroom to get started.
                </p>
                <button onClick={() => setActiveTab('book')} className="btn btn-primary">
                  <Clock size={16} /> Book Your First Test Drive
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CANCEL MODAL */}
        {/* ------------------------------------------------------------- */}
        {cancellingBookingId && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                maxWidth: '440px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Cancel Test-Drive Booking?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Are you sure you wish to cancel this scheduled reservation? Your reserved departure slot will be released back to the dealership capacity.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Reason for Cancellation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setCancellingBookingId(null)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  style={{
                    backgroundColor: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Yes, Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RESCHEDULE MODAL */}
        {/* ------------------------------------------------------------- */}
        {reschedulingBooking && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                maxWidth: '480px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Reschedule Test Drive
                </h3>
                <button
                  onClick={() => setReschedulingBooking(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Reschedule your drive for <strong>{reschedulingBooking.vehicleName}</strong> at {reschedulingBooking.dealerName}.
              </p>

              {rescheduleError && (
                <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {rescheduleError}
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                  New Preferred Date
                </label>
                <input
                  type="date"
                  min={minDateString}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                  New Preferred Departure Slot
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM', '05:30 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRescheduleSlot(slot)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${rescheduleSlot === slot ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        backgroundColor: rescheduleSlot === slot ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: rescheduleSlot === slot ? 'var(--accent-cyan)' : '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight delay / travel adjustment"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setReschedulingBooking(null)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button onClick={handleConfirmReschedule} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Submit Reschedule Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
