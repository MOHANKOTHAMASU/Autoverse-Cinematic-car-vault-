import React from 'react';
import type { AmortizationScheduleEntry, CurrencyCode } from '../../types/calculator';
import { formatCurrency } from '../../utils/tcoCalculator';
import { X, ShieldAlert } from 'lucide-react';

interface AmortizationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: AmortizationScheduleEntry[];
  currency: CurrencyCode;
  vehicleName: string;
  principalFinanced: number;
  monthlyEmi: number;
  totalInterest: number;
}

export const AmortizationScheduleModal: React.FC<AmortizationScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  currency,
  vehicleName,
  principalFinanced,
  monthlyEmi,
  totalInterest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0b0f17',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Loan Amortization Schedule
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              {vehicleName} • Financed: {formatCurrency(principalFinanced, currency)} • EMI:{' '}
              {formatCurrency(monthlyEmi, currency)}/mo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Summary Pill Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(6, 182, 212, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
              Tenure
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
              {schedule.length} Months
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
              Principal
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              {formatCurrency(principalFinanced, currency)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
              Total Interest
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
              {formatCurrency(totalInterest, currency)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
              Total Outlay
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
              {formatCurrency(principalFinanced + totalInterest, currency)}
            </div>
          </div>
        </div>

        {/* Schedule Table Container */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.8rem',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '8px 10px' }}>Month</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Payment (EMI)</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Principal</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Interest</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((entry) => (
                <tr
                  key={entry.installmentNumber}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    backgroundColor:
                      entry.installmentNumber % 12 === 0
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'transparent',
                  }}
                >
                  <td style={{ padding: '8px 10px', color: '#e2e8f0', fontWeight: 500 }}>
                    #{entry.installmentNumber}{' '}
                    {entry.installmentNumber % 12 === 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          marginLeft: '4px',
                        }}
                      >
                        Yr {entry.installmentNumber / 12}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: '#f8fafc',
                    }}
                  >
                    {formatCurrency(entry.paymentAmount, currency)}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {formatCurrency(entry.principalPortion, currency)}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: '#f59e0b',
                    }}
                  >
                    {formatCurrency(entry.interestPortion, currency)}
                  </td>
                  <td
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      color: entry.remainingBalance <= 0 ? '#10b981' : '#94a3b8',
                      fontWeight: entry.remainingBalance <= 0 ? 700 : 400,
                    }}
                  >
                    {formatCurrency(entry.remainingBalance, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldAlert size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Bank Disclaimer: Monthly EMI and interest figures are computational projections calculated
            using the standard reducing balance formula. Actual bank sanction terms, processing charges,
            credit rating adjustments, and floating rate revisions may vary.
          </p>
        </div>
      </div>
    </div>
  );
};
