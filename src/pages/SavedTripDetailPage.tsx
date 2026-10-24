// AutoVerse Stage 16: Saved Trip Detail View (/trip-planner/plan/:id)
// Displays full itinerary, interactive map, charging stops, and supports recalculation, duplication, and deletion.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Navigation,
  Zap,
  RotateCcw,
  Trash2,
  Copy,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getSavedTripById,
  deleteSavedTrip,
  duplicateSavedTrip,
  renameSavedTrip,
} from '../utils/tripPlannerStore';
import { InteractiveRouteMap } from '../components/trip/InteractiveRouteMap';
import type { SavedTrip } from '../types/tripPlanner';

export const SavedTripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const found = getSavedTripById(id);
      if (found) {
        setTrip(found);
        setEditedTitle(found.title);
      } else {
        setErrorMessage('Saved trip not found in the AutoVerse registry.');
      }
    }
  }, [id]);

  const handleDelete = () => {
    if (!trip) return;
    if (window.confirm('Are you sure you want to delete this saved route?')) {
      try {
        deleteSavedTrip(trip.id, currentUser?.id);
        navigate('/trip-planner');
      } catch (err: any) {
        alert(err.message || 'Failed to delete trip.');
      }
    }
  };

  const handleDuplicate = () => {
    if (!trip) return;
    const duplicated = duplicateSavedTrip(trip.id);
    if (duplicated) {
      navigate(`/trip-planner/plan/${duplicated.id}`);
    }
  };

  const handleSaveTitle = () => {
    if (!trip || !editedTitle.trim()) return;
    const updated = renameSavedTrip(trip.id, editedTitle.trim());
    if (updated) {
      setTrip(updated);
      setIsEditingTitle(false);
    }
  };

  if (errorMessage || !trip) {
    return (
      <div
        style={{
          minHeight: '70vh',
          backgroundColor: '#030508',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          padding: '2rem',
        }}
      >
        <Navigation size={48} color="var(--accent-cyan)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Trip Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{errorMessage || 'This trip does not exist.'}</p>
        <Link to="/trip-planner" className="btn btn-primary">
          Return to EV Trip Planner
        </Link>
      </div>
    );
  }

  const { planResult } = trip;

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
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Link
            to="/trip-planner"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={16} /> Back to Planner
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {trip.title}
          </span>
        </div>

        {/* Top Header Card */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#070a0f',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {isEditingTitle ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--accent-cyan)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                    }}
                  />
                  <button onClick={handleSaveTitle} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                    Save
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    cursor: 'pointer',
                  }}
                  title="Click to rename"
                >
                  {trip.title} ✏️
                </h1>
              )}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {trip.originName} ➔ {trip.destinationName} • Vehicle: <strong style={{ color: 'var(--accent-cyan)' }}>{trip.vehicleName}</strong>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/trip-planner?from=${encodeURIComponent(planResult.origin.name)}&to=${encodeURIComponent(planResult.destination.name)}&car=${planResult.vehicle.slug}`}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={14} /> Recalculate
            </Link>

            <button
              onClick={handleDuplicate}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Copy size={14} /> Duplicate
            </button>

            <button
              onClick={handleDelete}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Map & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <InteractiveRouteMap plan={planResult} />

          {/* Charging Stops */}
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#070a0f',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--accent-cyan)" />
              Itinerary & Charging Stops ({planResult.chargingStops.length})
            </h3>

            {planResult.chargingStops.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Direct journey reachable without intermediate charging stops.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {planResult.chargingStops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                        {idx + 1}. {stop.station.name} ({stop.station.operator})
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {stop.station.address} • Power: {stop.effectiveChargingPowerKw} kW DC
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981' }}>
                        {stop.arrivalSoC}% ➔ {stop.departureSoC}% SoC ({stop.chargingDurationMinutes}m)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {stop.currency} {stop.estimatedCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
