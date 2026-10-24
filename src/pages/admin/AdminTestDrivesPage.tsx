// AutoVerse Stage 20: Admin Test-Drive Reservation Management Console
// Authorized workflow for confirming, rescheduling, rejecting, and completing test drives with audit trails.

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Download,
  Eye,
  X,
} from 'lucide-react';
import {
  getAllBookings,
  adminUpdateBookingStatus,
  getAllDealers,
} from '../../utils/dealerStore';
import type { TestDriveBooking, TestDriveStatus } from '../../types/dealer';

export const AdminTestDrivesPage: React.FC = () => {
  const [bookings, setBookings] = useState<TestDriveBooking[]>(() => getAllBookings());
  const [dealers] = useState(() => getAllDealers());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dealerFilter, setDealerFilter] = useState<string>('all');

  // Action Modal State
  const [selectedBooking, setSelectedBooking] = useState<TestDriveBooking | null>(null);
  const [actionType, setActionType] = useState<
    'confirm' | 'reject' | 'reschedule' | 'complete' | 'no_show' | 'history'
  >('confirm');
  const [actionNotes, setActionNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const refreshBookings = () => {
    setBookings(getAllBookings());
  };

  useEffect(() => {
    window.addEventListener('autoverse_test_drives_updated', refreshBookings);
    return () => window.removeEventListener('autoverse_test_drives_updated', refreshBookings);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }
      if (dealerFilter !== 'all' && b.dealerId !== dealerFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.bookingReference.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.userEmail.toLowerCase().includes(q) ||
          b.vehicleName.toLowerCase().includes(q) ||
          b.dealerName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, dealerFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) =>
      ['requested', 'pending_confirmation', 'reschedule_requested'].includes(b.status)
    ).length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return { total, pending, confirmed, completed };
  }, [bookings]);

  // Open modal helper
  const handleOpenActionModal = (
    b: TestDriveBooking,
    type: 'confirm' | 'reject' | 'reschedule' | 'complete' | 'no_show' | 'history'
  ) => {
    setSelectedBooking(b);
    setActionType(type);
    setActionNotes('');
    setRescheduleDate(b.preferredDate);
    setRescheduleSlot(b.preferredTimeSlot);
    setActionError(null);
  };

  // Submit status update
  const handleExecuteStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setActionError(null);

    let targetStatus: TestDriveStatus = selectedBooking.status;
    if (actionType === 'confirm') targetStatus = 'confirmed';
    if (actionType === 'reject') {
      if (!actionNotes.trim()) {
        setActionError('Please provide a reason or note for rejecting this booking.');
        return;
      }
      targetStatus = 'rejected';
    }
    if (actionType === 'reschedule') {
      if (!rescheduleDate || !rescheduleSlot) {
        setActionError('Please select a proposed date and time slot.');
        return;
      }
      targetStatus = 'reschedule_requested';
    }
    if (actionType === 'complete') targetStatus = 'completed';
    if (actionType === 'no_show') targetStatus = 'no_show';

    const res = adminUpdateBookingStatus(
      selectedBooking.id,
      targetStatus,
      'AutoVerse Operations Specialist',
      actionNotes,
      rescheduleDate,
      rescheduleSlot
    );

    if (res.success) {
      setSelectedBooking(null);
      refreshBookings();
    } else {
      setActionError(res.message);
    }
  };

  // CSV Export with formula injection protection
  const handleExportCSV = () => {
    const sanitize = (val: string) => {
      let str = String(val || '');
      if (['=', '+', '-', '@', '\t', '\r'].includes(str[0])) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Reference',
      'Driver Name',
      'Email',
      'Phone',
      'Vehicle',
      'Dealer',
      'Date',
      'Time Slot',
      'Status',
      'Created At',
    ];

    const rows = filteredBookings.map((b) => [
      sanitize(b.bookingReference),
      sanitize(b.userName),
      sanitize(b.userEmail),
      sanitize(b.userPhone),
      sanitize(b.vehicleName),
      sanitize(b.dealerName),
      sanitize(b.confirmedDate || b.preferredDate),
      sanitize(b.confirmedTimeSlot || b.preferredTimeSlot),
      sanitize(b.status),
      sanitize(b.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `autoverse_test_drives_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: TestDriveStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-green">Confirmed</span>;
      case 'pending_confirmation':
      case 'requested':
        return <span className="badge badge-yellow">Pending Action</span>;
      case 'reschedule_requested':
        return <span className="badge badge-cyan">Reschedule Req</span>;
      case 'completed':
        return <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>Completed</span>;
      case 'cancelled':
        return <span className="badge badge-red">Cancelled</span>;
      case 'rejected':
        return <span className="badge badge-red">Rejected</span>;
      case 'no_show':
        return <span className="badge badge-red">No Show</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan">
              <Clock size={12} /> TEST-DRIVE DISPATCH
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Test-Drive Booking Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Review customer reservations, approve vehicle departure slots, and track demonstration histories.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}>
          <Download size={15} /> Export Clean CSV
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TOTAL RESERVATIONS</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginTop: '0.35rem' }}>{stats.total}</div>
        </div>

        <div style={{ backgroundColor: '#0c1017', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#facc15', fontFamily: 'var(--font-mono)' }}>PENDING ACTION</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#facc15', marginTop: '0.35rem' }}>{stats.pending}</div>
        </div>

        <div style={{ backgroundColor: '#0c1017', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>CONFIRMED UPCOMING</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34d399', marginTop: '0.35rem' }}>{stats.confirmed}</div>
        </div>

        <div style={{ backgroundColor: '#0c1017', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>COMPLETED DRIVES</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', marginTop: '0.35rem' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: '1 1 260px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '0.6rem 0.85rem',
          }}
        >
          <Search size={16} color="var(--accent-cyan)" />
          <input
            type="text"
            placeholder="Search reference, driver name, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#0a0d14' }}>All Statuses</option>
          <option value="pending_confirmation" style={{ background: '#0a0d14' }}>Pending Confirmation</option>
          <option value="confirmed" style={{ background: '#0a0d14' }}>Confirmed</option>
          <option value="reschedule_requested" style={{ background: '#0a0d14' }}>Reschedule Requested</option>
          <option value="completed" style={{ background: '#0a0d14' }}>Completed</option>
          <option value="cancelled" style={{ background: '#0a0d14' }}>Cancelled</option>
          <option value="rejected" style={{ background: '#0a0d14' }}>Rejected</option>
        </select>

        {/* Dealer Dropdown */}
        <select
          value={dealerFilter}
          onChange={(e) => setDealerFilter(e.target.value)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#0a0d14' }}>All Showrooms ({dealers.length})</option>
          {dealers.map((d) => (
            <option key={d.id} value={d.id} style={{ background: '#0a0d14' }}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings Table */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REFERENCE</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DRIVER</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>VEHICLE</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SHOWROOM</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SCHEDULE</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>STATUS</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s',
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {b.bookingReference}
                  </span>
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{b.userName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.userEmail}</div>
                </td>

                <td style={{ padding: '1rem', color: '#ffffff' }}>
                  <div style={{ fontWeight: 700 }}>{b.vehicleName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>{b.variantName}</div>
                </td>

                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  <div>{b.dealerName}</div>
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>{b.confirmedDate || b.preferredDate}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {b.confirmedTimeSlot || b.preferredTimeSlot}
                  </div>
                </td>

                <td style={{ padding: '1rem' }}>{renderStatusBadge(b.status)}</td>

                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleOpenActionModal(b, 'confirm')}
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#34d399',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Confirm
                      </button>
                    )}

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleOpenActionModal(b, 'complete')}
                        style={{
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Complete
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenActionModal(b, 'history')}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      title="View Details & History"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action / Detail Modal */}
      {selectedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {selectedBooking.bookingReference}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0' }}>
                  {actionType === 'history' ? 'Booking Details & Audit Log' : `Execute Action: ${actionType.toUpperCase()}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {actionError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {actionError}
              </div>
            )}

            {/* Quick Details */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Driver:</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{selectedBooking.userName} ({selectedBooking.userPhone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                <span style={{ color: '#ffffff' }}>{selectedBooking.vehicleName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Showroom:</span>
                <span style={{ color: '#ffffff' }}>{selectedBooking.dealerName}</span>
              </div>
            </div>

            {actionType !== 'history' ? (
              <form onSubmit={handleExecuteStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {actionType === 'reschedule' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                        Proposed Date
                      </label>
                      <input
                        type="date"
                        required
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
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                        Departure Slot
                      </label>
                      <input
                        type="text"
                        required
                        value={rescheduleSlot}
                        onChange={(e) => setRescheduleSlot(e.target.value)}
                        placeholder="11:30 AM"
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
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                    Action Notes / Instructions to Driver
                  </label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Departure confirmed with senior test pilot. Please arrive 10 minutes prior."
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

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setSelectedBooking(null)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    Submit Update
                  </button>
                </div>
              </form>
            ) : (
              /* History Log */
              <div>
                <h4 style={{ fontSize: '0.92rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 700 }}>
                  Audit Trail
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {selectedBooking.statusHistory.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        <span>{h.status.toUpperCase()}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {h.notes} ({h.actorName})
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActionType('reject')}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      borderRadius: '6px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setActionType('reschedule')}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    Propose Reschedule
                  </button>
                  <button
                    onClick={() => setActionType('confirm')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    Confirm Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
