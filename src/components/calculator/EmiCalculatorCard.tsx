import React, { useState } from 'react';
import type {
  LoanParameters,
  LoanCalculationResult,
  PurchaseMode,
  CurrencyCode,
} from '../../types/calculator';
import {
  formatCurrency,
  calculateLoanEmi,
  generateAmortizationSchedule,
} from '../../utils/tcoCalculator';
import { AmortizationScheduleModal } from './AmortizationScheduleModal';
import {
  CreditCard,
  Wallet,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

interface EmiCalculatorCardProps {
  vehiclePrice: number;
  vehicleName: string;
  currency: CurrencyCode;
  purchaseMode: PurchaseMode;
  onChangePurchaseMode: (mode: PurchaseMode) => void;
  loanParams: LoanParameters;
  onChangeLoanParams: (params: LoanParameters) => void;
}

export const EmiCalculatorCard: React.FC<EmiCalculatorCardProps> = ({
  vehiclePrice,
  vehicleName,
  currency,
  purchaseMode,
  onChangePurchaseMode,
  loanParams,
  onChangeLoanParams,
}) => {
  const [showAmortModal, setShowAmortModal] = useState(false);

  const isFinanced = purchaseMode === 'financed';

  // Ensure loan vehiclePrice tracks on-road price
  const activeParams: LoanParameters = {
    ...loanParams,
    vehiclePrice,
    downPayment: Math.min(vehiclePrice, Math.max(0, loanParams.downPayment)),
    principalFinanced: Math.max(
      0,
      vehiclePrice - Math.min(vehiclePrice, Math.max(0, loanParams.downPayment))
    ),
  };

  const loanResult: LoanCalculationResult = calculateLoanEmi(activeParams);

  const downPaymentPercent =
    vehiclePrice > 0 ? Math.round((activeParams.downPayment / vehiclePrice) * 100) : 20;

  const handleDownPaymentChange = (val: number) => {
    const clamped = Math.max(0, Math.min(vehiclePrice, val));
    onChangeLoanParams({
      ...activeParams,
      downPayment: clamped,
      principalFinanced: Math.max(0, vehiclePrice - clamped),
    });
  };

  const handleDownPaymentSlider = (percent: number) => {
    const val = Math.round((vehiclePrice * percent) / 100);
    handleDownPaymentChange(val);
  };

  const handleInterestRateChange = (rate: number) => {
    const validRate = Math.max(0, Math.min(30, rate));
    onChangeLoanParams({
      ...activeParams,
      annualInterestRate: validRate,
    });
  };

  const handleTenureChange = (months: number) => {
    onChangeLoanParams({
      ...activeParams,
      loanTenureMonths: months,
    });
  };

  const tenureOptions = [
    { label: '1 Yr', months: 12 },
    { label: '2 Yrs', months: 24 },
    { label: '3 Yrs', months: 36 },
    { label: '4 Yrs', months: 48 },
    { label: '5 Yrs', months: 60 },
    { label: '6 Yrs', months: 72 },
    { label: '7 Yrs', months: 84 },
  ];

  return (
    <div
      style={{
        backgroundColor: 'rgba(12, 16, 24, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <CreditCard size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              3. Purchase Mode & Loan EMI Calculator
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
              Choose full upfront cash payment or model fixed-rate monthly bank financing.
            </p>
          </div>
        </div>

        {/* Cash vs Loan Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => onChangePurchaseMode('cash')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: !isFinanced ? '#10b981' : 'transparent',
              color: !isFinanced ? '#000000' : '#cbd5e1',
              fontWeight: !isFinanced ? 700 : 500,
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Wallet size={14} /> Cash Purchase
          </button>
          <button
            type="button"
            onClick={() => onChangePurchaseMode('financed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isFinanced ? 'var(--accent-cyan)' : 'transparent',
              color: isFinanced ? '#000000' : '#cbd5e1',
              fontWeight: isFinanced ? 700 : 500,
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <CreditCard size={14} /> Financed Loan (EMI)
          </button>
        </div>
      </div>

      {!isFinanced ? (
        /* Cash Purchase Summary State */
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              <CheckCircle size={16} /> 100% Cash Purchase Selected
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Zero debt service, zero lender interest, and zero loan processing charges.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Total Immediate Outlay
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
              {formatCurrency(vehiclePrice, currency)}
            </div>
          </div>
        </div>
      ) : (
        /* Financed Mode Active */
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Input Controls Left */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Down Payment */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#cbd5e1',
                    }}
                  >
                    Down Payment ({downPaymentPercent}%)
                  </label>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--accent-cyan)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {formatCurrency(activeParams.downPayment, currency)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => handleDownPaymentSlider(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max={vehiclePrice}
                    step="5000"
                    value={activeParams.downPayment}
                    onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '110px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#64748b',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Financed Principal (P):</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                    {formatCurrency(activeParams.principalFinanced, currency)}
                  </span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#cbd5e1',
                    }}
                  >
                    Annual Interest Rate (% p.a.)
                  </label>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#f59e0b',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {activeParams.annualInterestRate.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="0.25"
                    value={activeParams.annualInterestRate}
                    onChange={(e) => handleInterestRateChange(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#f59e0b' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={activeParams.annualInterestRate}
                    onChange={(e) => handleInterestRateChange(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '70px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                </div>
                {activeParams.annualInterestRate === 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                    0% Promotional Interest modeled (Principal / Months)
                  </span>
                )}
              </div>

              {/* Loan Tenure Pills */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#cbd5e1',
                    marginBottom: '0.4rem',
                  }}
                >
                  Loan Tenure
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tenureOptions.map((opt) => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => handleTenureChange(opt.months)}
                      style={{
                        flex: '1 0 45px',
                        background:
                          activeParams.loanTenureMonths === opt.months
                            ? 'rgba(6, 182, 212, 0.2)'
                            : 'rgba(255, 255, 255, 0.04)',
                        color:
                          activeParams.loanTenureMonths === opt.months
                            ? 'var(--accent-cyan)'
                            : '#94a3b8',
                        border:
                          activeParams.loanTenureMonths === opt.months
                            ? '1px solid var(--accent-cyan)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Panel Right */}
            <div
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.03)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Estimated Monthly Installment
                </span>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    letterSpacing: '-0.02em',
                    marginTop: '2px',
                    marginBottom: '1rem',
                  }}
                >
                  {formatCurrency(loanResult.monthlyEmi, currency)}
                  <span
                    style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginLeft: '6px' }}
                  >
                    / month
                  </span>
                </div>

                {/* Metric Summary Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Principal Financed:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {formatCurrency(loanResult.principalFinanced, currency)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Total Interest Payable:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                      {formatCurrency(loanResult.totalInterest, currency)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Total Scheduled Loan Payments:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {formatCurrency(loanResult.totalScheduledPayments, currency)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      padding: '4px 0',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Total Cash Outlay (Down + Loan):</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>
                      {formatCurrency(
                        loanResult.downPayment + loanResult.totalScheduledPayments,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Amortization Schedule Button */}
              <button
                type="button"
                onClick={() => setShowAmortModal(true)}
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FileSpreadsheet size={15} color="var(--accent-cyan)" />
                View Month-by-Month Amortization Schedule
              </button>
            </div>
          </div>

          <AmortizationScheduleModal
            isOpen={showAmortModal}
            onClose={() => setShowAmortModal(false)}
            schedule={generateAmortizationSchedule(
              loanResult.principalFinanced,
              loanResult.effectiveAnnualRate,
              loanResult.tenureMonths
            )}
            currency={currency}
            vehicleName={vehicleName}
            principalFinanced={loanResult.principalFinanced}
            monthlyEmi={loanResult.monthlyEmi}
            totalInterest={loanResult.totalInterest}
          />
        </div>
      )}
    </div>
  );
};
