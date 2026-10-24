import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowRight,
  Filter,
  Car,
  Wrench,
  Info,
  Award,
} from 'lucide-react';
import { OFFICIAL_RECALLS_DATABASE, OFFICIAL_SAFETY_SOURCES } from '../data/officialRecalls';
import { VEHICLES } from '../data/vehicles';
import type { Vehicle } from '../types';
import { matchVehicleToRecalls, getUserSafetyAlerts } from '../utils/safetyService';
import { useAuth } from '../context/AuthContext';

export const SafetyHomePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // Quick lookup state
  const [selectedVehicle, setSelectedVehicle] = useState('porsche-taycan-turbo-s');
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [activeTab, setActiveTab] = useState<'all' | 'recalls' | 'campaigns'>('all');

  const lookupResult = matchVehicleToRecalls(selectedVehicle, selectedYear);
  const userAlerts = isAuthenticated && currentUser ? getUserSafetyAlerts(currentUser.id) : [];
  const unreviewedCount = userAlerts.filter((a) => !a.isReviewed).length;

  const filteredRecalls = OFFICIAL_RECALLS_DATABASE.filter((r) => {
    if (activeTab === 'recalls') return r.category === 'recall';
    if (activeTab === 'campaigns') return r.category === 'service_campaign';
    return true;
  });

  return (
    <div
      style={{
        paddingTop: 'calc(var(--header-height) + 2rem)',
        paddingBottom: '6rem',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="container">
        {/* Header Hero */}
        <div style={{ marginBottom: '3rem', maxWidth: '860px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '999px',
              padding: '0.35rem 0.95rem',
              color: '#f87171',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              marginBottom: '1rem',
            }}
          >
            <ShieldAlert size={14} />
            <span>AUTHORITATIVE SAFETY INTELLIGENCE & RECALL REGISTRY</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Automotive Safety Intelligence & Verified Recall Alerts
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '740px',
            }}
          >
            Trace official vehicle recall notices, Bharat NCAP / Euro NCAP crash testing evaluations, and
            manufacturer technical service campaigns directly synchronized with MoRTH (India) and NHTSA (USA) datasets.
          </p>
        </div>

        {/* Personalized Garage Alerts Prompt (If authenticated and alerts exist) */}
        {isAuthenticated && userAlerts.length > 0 && (
          <div
            style={{
              marginBottom: '2.5rem',
              padding: '1.5rem 1.75rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  flexShrink: 0,
                }}
              >
                <Bell size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Personalized Safety Notices for Your Garage
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  We identified <strong>{userAlerts.length} notice(s)</strong> (including{' '}
                  <strong style={{ color: '#f59e0b' }}>{unreviewedCount} unreviewed</strong>) applicable to vehicles in your saved fleet.
                </p>
              </div>
            </div>

            <Link
              to="/safety/my-alerts"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <span>Inspect My Alerts</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Top Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          {[
            {
              label: 'Monitored Fleet Models',
              val: '50 Vehicles',
              sub: 'Top performance & EV catalog',
              icon: Car,
              color: 'var(--accent-cyan)',
            },
            {
              label: 'Official Recalls Tracked',
              val: `${OFFICIAL_RECALLS_DATABASE.filter((r) => r.category === 'recall').length} Active`,
              sub: 'MoRTH & NHTSA regulatory',
              icon: ShieldAlert,
              color: '#ef4444',
            },
            {
              label: 'Service Campaigns',
              val: `${OFFICIAL_RECALLS_DATABASE.filter((r) => r.category === 'service_campaign').length} Notices`,
              sub: 'Voluntary manufacturer updates',
              icon: Wrench,
              color: '#f59e0b',
            },
            {
              label: 'Synchronized Sources',
              val: `${OFFICIAL_SAFETY_SOURCES.length} Regulators`,
              sub: 'India, USA & Euro NCAP',
              icon: Award,
              color: '#10b981',
            },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {m.label}
                  </span>
                  <Icon size={18} color={m.color} />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                  {m.val}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {m.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2-Column Section: Quick Vehicle Checker & VIN Portal Guidance */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Quick Vehicle Matcher Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Search size={18} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
                  Instant Vehicle Recall Matcher
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Select any vehicle from our catalog to query official safety recall records.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Catalog Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                >
                  {VEHICLES.map((v: Vehicle) => (
                    <option key={v.id} value={v.id} style={{ backgroundColor: '#0c1017' }}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Model Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#0c1017',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                  }}
                >
                  {[2024, 2023, 2022, 2021, 2020].map((y) => (
                    <option key={y} value={y} style={{ backgroundColor: '#0c1017' }}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Match Result Banner */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor:
                  lookupResult.classification === 'potential_match' || lookupResult.classification === 'confirmed_match'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${
                  lookupResult.classification === 'potential_match' || lookupResult.classification === 'confirmed_match'
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(16, 185, 129, 0.35)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {lookupResult.classification === 'potential_match' || lookupResult.classification === 'confirmed_match' ? (
                  <AlertTriangle size={18} color="#f87171" />
                ) : (
                  <CheckCircle2 size={18} color="#34d399" />
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color:
                      lookupResult.classification === 'potential_match' || lookupResult.classification === 'confirmed_match'
                        ? '#f87171'
                        : '#34d399',
                  }}
                >
                  {lookupResult.classification === 'potential_match'
                    ? 'POTENTIAL RECALL MATCH DETECTED'
                    : lookupResult.classification === 'confirmed_match'
                    ? 'CONFIRMED APPLICABLE RECALL'
                    : 'NO ACTIVE RECALLS IN MONITORED DATASET'}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {lookupResult.reason}
              </p>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {lookupResult.recommendation}
              </div>

              {lookupResult.matchedRecalls.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lookupResult.matchedRecalls.map((r) => (
                    <Link
                      key={r.id}
                      to={`/safety/recalls/${r.slug}`}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      <span>
                        [{r.officialCampaignNumber}] {r.title}
                      </span>
                      <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to={`/safety/vehicle/${selectedVehicle}`}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', fontSize: '0.85rem' }}
            >
              <span>View Full Vehicle Safety Dossier</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Official VIN Verification Protocol Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Info size={18} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
                  Official 17-Digit VIN Verification
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                A Vehicle Identification Number (VIN) is a unique 17-character alphanumeric code.
                Only official government registries can definitively confirm individual chassis status.
              </p>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.4rem', fontWeight: 700 }}>
                  WHERE TO LOCATE YOUR VIN:
                </div>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                  <li>Bottom corner of the driver-side windshield.</li>
                  <li>Vehicle Registration Certificate (RC) or Title document.</li>
                  <li>Driver-side B-pillar door frame certification plate.</li>
                  <li>Insurance policy document or manufacturer companion mobile app.</li>
                </ul>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Direct Authoritative Portals:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <a
                  href="https://www.siam.in/recall-code-view.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
                >
                  <span>MoRTH / SIAM India Voluntary Recall Portal</span>
                  <ExternalLink size={14} />
                </a>

                <a
                  href="https://www.nhtsa.gov/recalls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
                >
                  <span>NHTSA.gov Recalls by VIN (USA)</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Searchable Recall Feed Header & Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-medium)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800 }}>
              Recent Authoritative Recalls & Service Bulletins
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Showing {filteredRecalls.length} verified records in the active safety dataset.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid var(--border-medium)',
              }}
            >
              {[
                { key: 'all', label: 'All Notices' },
                { key: 'recalls', label: 'Official Recalls' },
                { key: 'campaigns', label: 'Service Campaigns' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: activeTab === tab.key ? 'var(--accent-cyan)' : 'transparent',
                    color: activeTab === tab.key ? '#07090d' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to="/safety/recalls"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <Filter size={13} />
              <span>Full Database</span>
            </Link>
          </div>
        </div>

        {/* Recalls Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredRecalls.map((recall) => (
            <div
              key={recall.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <div>
                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor:
                          recall.category === 'recall' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: recall.category === 'recall' ? '#f87171' : '#f59e0b',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {recall.category === 'recall' ? 'Safety Recall' : 'Service Campaign'}
                    </span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {recall.market}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                      fontWeight: 700,
                    }}
                  >
                    {recall.officialCampaignNumber}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  {recall.title}
                </h3>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <strong>Make & Model:</strong> {recall.make} {recall.model} ({recall.modelYears.join(', ')})
                </div>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {recall.defectSummary}
                </p>
              </div>

              <div>
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  <strong style={{ color: '#10b981' }}>Remedy:</strong> {recall.remedyDescription.slice(0, 90)}...
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Published: {new Date(recall.publishedDate).toLocaleDateString()}
                  </span>

                  <Link
                    to={`/safety/recalls/${recall.slug}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                  >
                    <span>Full Notice</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
