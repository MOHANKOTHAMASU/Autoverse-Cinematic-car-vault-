// AutoVerse Stage 22: User Saved Financing Scenarios Dashboard
// User-isolated repository of custom loan calculations, comparison workbench, and direct scenario reloading.

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  Calculator,
  Trash2,
  Plus,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import {
  getUserSavedScenarios,
  deleteUserFinanceScenario,
  EVENT_SCENARIOS_UPDATED,
} from '../utils/financeStore';
import type { SavedFinanceScenario } from '../types/offers';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/tcoCalculator';

export const MyFinancingPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [scenarios, setScenarios] = useState<SavedFinanceScenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener
  useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener(EVENT_SCENARIOS_UPDATED, handleUpdate);
    return () => window.removeEventListener(EVENT_SCENARIOS_UPDATED, handleUpdate);
  }, []);

  // Fetch scenarios strictly for this authenticated user
  useEffect(() => {
    if (currentUser?.id) {
      const userScenarios = getUserSavedScenarios(currentUser.id);
      setScenarios(userScenarios);
    } else {
      setScenarios([]);
    }
  }, [currentUser, dataVersion]);

  const handleDelete = (id: string, name: string) => {
    if (!currentUser) return;
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteUserFinanceScenario(id, currentUser.id);
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can select a maximum of 4 scenarios to compare.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedScenarios = useMemo(() => {
    return scenarios.filter((s) => selectedIds.includes(s.id));
  }, [scenarios, selectedIds]);

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: '75vh',
          backgroundColor: '#05070a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(37,99,235,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            marginBottom: '1.25rem',
          }}
        >
          <Landmark size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Authentication Required
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0 0 2rem', lineHeight: 1.6 }}>
          Please sign in to view and manage your private vehicle financing estimates and saved scenario comparisons.
        </p>
        <Link
          to="/login"
          style={{
            padding: '0.8rem 1.8rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign In to AutoVerse
        </Link>
      </div>
    );
  }

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
      {/* Top Header */}
      <div
        style={{
          padding: '4rem 1.5rem 2.5rem',
          background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(37,99,235,0.12), transparent 70%), #05070a',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.25)',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <ShieldCheck size={13} />
              <span>Private User Vault</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              My Saved Financing Scenarios
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
              Logged in as <strong style={{ color: '#f8fafc' }}>{currentUser.email}</strong> • {scenarios.length} saved calculation estimates
            </p>
          </div>

          <Link
            to="/financing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
            }}
          >
            <Plus size={16} />
            <span>New Financing Estimate</span>
          </Link>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {scenarios.length === 0 ? (
          <div
            style={{
              padding: '5rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(15,23,42,0.4)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '20px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59,130,246,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                margin: '0 auto 1.25rem',
              }}
            >
              <Calculator size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              No Saved Scenarios Yet
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Use our smart reducing-balance EMI calculator to estimate loan terms, zero-interest structures, and upfront costs, then save them here for comparison.
            </p>
            <Link
              to="/financing"
              style={{
                padding: '0.8rem 1.6rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              Launch EMI Calculator
            </Link>
          </div>
        ) : (
          <div>
            {/* Scenarios Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem',
              }}
            >
              {scenarios.map((scen) => {
                const isSelected = selectedIds.includes(scen.id);
                return (
                  <div
                    key={scen.id}
                    style={{
                      backgroundColor: '#0a0f1d',
                      border: `1px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>
                          {scen.vehicleTitle}
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0', color: '#ffffff' }}>
                          {scen.name}
                        </h4>
                      </div>

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(scen.id)}
                        title="Select to compare"
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Key Stats Bar */}
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(15,23,42,0.6)',
                        borderRadius: '12px',
                        marginBottom: '1.25rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monthly Repayment</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                          {formatCurrency(scen.result.monthlyEmi, scen.inputs.currency)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tenure / Rate</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                          {scen.inputs.loanTenureMonths}m @ {scen.inputs.annualInterestRate}%
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Financed Principal</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' }}>
                          {formatCurrency(scen.result.loanPrincipal, scen.inputs.currency)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Interest</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b' }}>
                          {formatCurrency(scen.result.totalInterest, scen.inputs.currency)}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} />
                      <span>Saved on {new Date(scen.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                      <Link
                        to={`/financing/${scen.vehicleId || ''}`}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.65rem',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <Calculator size={14} />
                        <span>Open in Calculator</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(scen.id, scen.name)}
                        style={{
                          padding: '0.65rem 0.8rem',
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          border: 'none',
                          color: '#ef4444',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                        title="Delete Scenario"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side-by-Side Comparison of Selected Scenarios */}
            {selectedScenarios.length > 1 && (
              <div
                style={{
                  backgroundColor: '#0a0f1d',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                    Comparing {selectedScenarios.length} Selected Scenarios
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Deselect All
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                        <th style={{ padding: '0.85rem' }}>Metric</th>
                        {selectedScenarios.map((s) => (
                          <th key={s.id} style={{ padding: '0.85rem', color: '#60a5fa' }}>{s.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Vehicle Price</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem', fontWeight: 600 }}>
                            {formatCurrency(s.inputs.vehiclePrice, s.inputs.currency)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Down Payment</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem' }}>
                            {formatCurrency(s.result.downPayment, s.inputs.currency)} ({s.inputs.downPaymentPercent}%)
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Loan Principal</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem' }}>
                            {formatCurrency(s.result.loanPrincipal, s.inputs.currency)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Annual Interest Rate</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem', color: s.inputs.annualInterestRate === 0 ? '#10b981' : '#f8fafc', fontWeight: 600 }}>
                            {s.inputs.annualInterestRate}%
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Tenure Term</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem' }}>
                            {s.inputs.loanTenureMonths} months ({(s.inputs.loanTenureMonths / 12).toFixed(1)} yrs)
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', backgroundColor: 'rgba(37,99,235,0.06)' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>Monthly EMI</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                            {formatCurrency(s.result.monthlyEmi, s.inputs.currency)}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', color: '#94a3b8' }}>Total Interest Paid</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                            {formatCurrency(s.result.totalInterest, s.inputs.currency)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#f8fafc' }}>Total Outlay</td>
                        {selectedScenarios.map((s) => (
                          <td key={s.id} style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#ffffff' }}>
                            {formatCurrency(s.result.totalFinancingOutlay, s.inputs.currency)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
