// AutoVerse Stage 20: Test-Drive Booking Detail Dossier & Audit History
// Full status timeline, showroom coordinates, vehicle snapshot, and driver self-service actions.

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Car,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookingById, cancelBooking, requestReschedule, getDealerById } from '../utils/dealerStore';
import { VEHICLES } from '../data/vehicles';
import type { TestDriveStatus } from '../types/dealer';

export const TestDriveDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { currentUser } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);

  const booking = useMemo(() => {
    if (!bookingId) return undefined;
    return getBookingById(bookingId);
  }, [bookingId, refreshKey]);

  const dealer = useMemo(() => {
    if (!booking) return undefined;
    return getDealerById(booking.dealerId);
  }, [booking]);

  const vehicle = useMemo(() => {
    if (!booking) return undefined;
    return VEHICLES.find((v) => v.slug === booking.vehicleSlug || v.id === booking.vehicleSlug);
  }, [booking]);

  // Cancel / Reschedule modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!booking) {
    return (
      <div
        style={{
          paddingTop: 'calc(var(--header-height) + 4rem)',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '580px' }}>
          <Clock size={54} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Reservation Record Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The reservation reference "{bookingId}" does not exist in the AutoVerse registry.
          </p>
          <Link to="/test-drive" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Test-Drive Hub
          </Link>
        </div>
      </div>
    );
  }

  // Cross-user privacy isolation: Check ownership
  const isOwner = currentUser?.id === booking.userId;
  const isAdmin = currentUser?.role === 'admin';
  const isGuestBooking = booking.userId.startsWith('guest_');

  // If authenticated user is NOT the owner and NOT an admin, block view
  if (currentUser && !isOwner && !isAdmin && !isGuestBooking) {
    return (
      <div
        style={{
          paddingTop: 'calc(var(--header-height) + 4rem)',
          paddingBottom: '6rem',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '560px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Access Restricted
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            You do not have authorization to view this private test-drive reservation dossier.
            You may only view bookings associated with your verified driver credentials.
          </p>
          <Link to="/test-drive" className="btn btn-primary">
            <ArrowLeft size={16} /> View My Own Bookings
          </Link>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    setActionError(null);
    const userId = currentUser?.id || booking.userId;
    const res = cancelBooking(booking.id, userId, cancelReason);
    if (res.success) {
      setShowCancelModal(false);
      setRefreshKey((k) => k + 1);
    } else {
      setActionError(res.message);
    }
  };

  const handleReschedule = () => {
    setActionError(null);
    if (!rescheduleDate || !rescheduleSlot) {
      setActionError('Please specify both a new date and time slot.');
      return;
    }
    const userId = currentUser?.id || booking.userId;
    const res = requestReschedule(booking.id, userId, rescheduleDate, rescheduleSlot, rescheduleReason);
    if (res.success) {
      setShowRescheduleModal(false);
      setRefreshKey((k) => k + 1);
    } else {
      setActionError(res.message);
    }
  };

  const renderStatusBadge = (status: TestDriveStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-green">CONFIRMED RESERVATION</span>;
      case 'pending_confirmation':
      case 'requested':
        return <span className="badge badge-yellow">PENDING DEALERSHIP CONFIRMATION</span>;
      case 'reschedule_requested':
        return <span className="badge badge-cyan">RESCHEDULE REQUESTED</span>;
      case 'completed':
        return <span className="badge badge-cyan">COMPLETED TEST DRIVE</span>;
      case 'cancelled':
        return <span className="badge badge-red">CANCELLED</span>;
      case 'rejected':
        return <span className="badge badge-red">DECLINED BY SHOWROOM</span>;
      default:
        return <span className="badge">{status.toUpperCase()}</span>;
    }
  };

  const canModify = ['requested', 'pending_confirmation', 'confirmed', 'reschedule_requested'].includes(
    booking.status
  );

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 1.5rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/test-drive?tab=my_bookings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ArrowLeft size={14} /> Back to My Reservations
          </Link>
        </div>

        {/* Master Dossier Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75)',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: 'var(--accent-cyan)',
                  }}
                >
                  {booking.bookingReference}
                </span>
                {renderStatusBadge(booking.status)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                LOGGED ON {new Date(booking.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Actions */}
            {canModify && (
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    setRescheduleDate(booking.preferredDate);
                    setShowRescheduleModal(true);
                  }}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                >
                  Reschedule
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    borderRadius: '8px',
                    padding: '0.55rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>

          {/* Dossier Body */}
          <div style={{ padding: '2rem' }}>
            {/* Appointment Highlights Banner */}
            <div
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.04)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  SCHEDULED DATE
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {booking.confirmedDate || booking.preferredDate}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  DEPARTURE TIME
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {booking.confirmedTimeSlot || booking.preferredTimeSlot}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  SHOWROOM LOCATION
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  {booking.dealerName}
                </span>
              </div>
            </div>

            {/* Vehicle & Dealership 2-Column */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {/* Vehicle Snapshot */}
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Car size={16} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Demonstration Vehicle
                  </h3>
                </div>

                {booking.vehicleImageUrl && (
                  <div style={{ height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img
                      src={booking.vehicleImageUrl}
                      alt={booking.vehicleName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  {booking.vehicleName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                  {booking.variantName || 'Factory Demonstration Trim'}
                </div>

                {vehicle && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>POWER</div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{vehicle.horsepower} HP</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>0-60 MPH</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{vehicle.accelerationSeconds}s</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>TOP SPEED</div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{vehicle.topSpeedMph} MPH</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dealership Details */}
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Building2 size={16} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Dealership Concierge
                  </h3>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {booking.dealerName}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
                  <MapPin size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{booking.dealerAddressText}</span>
                </div>

                {dealer && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <a href={`tel:${dealer.phone}`} style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        {dealer.phone}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <a href={`mailto:${dealer.email}`} style={{ color: 'var(--accent-cyan)' }}>
                        {dealer.email}
                      </a>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={dealer.address.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                      >
                        <MapPin size={13} /> Open Directions in Maps <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Notes & Instructions */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Driver Request & Showroom Instructions
              </div>
              <p style={{ color: '#ffffff', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                {booking.userNotes || 'No specific driving requests specified.'}
              </p>
              {booking.dealerNotes && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    SHOWROOM RESPONSE / INSTRUCTIONS:
                  </span>
                  <p style={{ color: '#ffffff', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
                    {booking.dealerNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
                Lifecycle & Audit History
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {booking.statusHistory.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-cyan)',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#ffffff' }}>
                          Status: {item.status.replace('_', ' ').toUpperCase()}
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {item.notes} ({item.actorName} - {item.actor})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reschedule Modal */}
        {showRescheduleModal && (
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
                maxWidth: '460px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Reschedule Reservation
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Select a new departure date and window for {booking.vehicleName}.
              </p>

              {actionError && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {actionError}
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                  New Date
                </label>
                <input
                  type="date"
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
                  New Departure Slot
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(dealer?.slotConfig.slotTimes || ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM']).map((slot) => (
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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Reschedule Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight delay"
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

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={() => setShowRescheduleModal(false)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                  Close
                </button>
                <button onClick={handleReschedule} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
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
                Cancel Reservation?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Are you sure you want to cancel booking {booking.bookingReference}?
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Personal schedule change"
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
                <button onClick={() => setShowCancelModal(false)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                  Keep Booking
                </button>
                <button
                  onClick={handleCancel}
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
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
