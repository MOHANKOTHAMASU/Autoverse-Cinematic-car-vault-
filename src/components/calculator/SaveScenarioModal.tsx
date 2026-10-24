import React, { useState } from 'react';
import type { SavedTcoScenario, TcoParameters, TcoResult } from '../../types/calculator';
import { saveScenario, exportTcoToCsv, formatCurrency } from '../../utils/tcoCalculator';
import { useAuth } from '../../context/AuthContext';
import { X, Bookmark, Download, Check, Trash2, FileText } from 'lucide-react';

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: TcoParameters;
  results: TcoResult;
  savedScenarios: SavedTcoScenario[];
  onLoadScenario: (scenario: SavedTcoScenario) => void;
  onDeleteScenario: (id: string) => void;
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  parameters,
  results,
  savedScenarios,
  onLoadScenario,
  onDeleteScenario,
}) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<'save' | 'saved_list'>('save');
  const [scenarioName, setScenarioName] = useState(
    `${parameters.brand} ${parameters.vehicleName} ${parameters.ownershipPeriodYears}Y TCO (${parameters.region.split(' ')[0]})`
  );
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const newScenario: SavedTcoScenario = {
      id: `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser?.id || 'guest',
      scenarioName: scenarioName.trim() || 'Custom TCO Scenario',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      parameters,
      results,
    };

    saveScenario(newScenario);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      setTab('saved_list');
    }, 800);
  };

  const handleExportCsv = (scenarioToExport?: SavedTcoScenario) => {
    const sc =
      scenarioToExport ||
      ({
        id: 'export_temp',
        userId: currentUser?.id || 'guest',
        scenarioName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
        parameters,
        results,
      } as SavedTcoScenario);

    const csvContent = exportTcoToCsv(sc);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `AutoVerse_TCO_${parameters.vehicleSlug}_${parameters.ownershipPeriodYears}yr.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          maxWidth: '560px',
          maxHeight: '85vh',
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setTab('save')}
              style={{
                background: tab === 'save' ? 'var(--accent-cyan)' : 'transparent',
                color: tab === 'save' ? '#000000' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save Scenario
            </button>
            <button
              type="button"
              onClick={() => setTab('saved_list')}
              style={{
                background: tab === 'saved_list' ? 'var(--accent-cyan)' : 'transparent',
                color: tab === 'saved_list' ? '#000000' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Saved Scenarios ({savedScenarios.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 1: Save Current Scenario */}
        {tab === 'save' && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="scenario-name-input"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  marginBottom: '6px',
                }}
              >
                Scenario Name
              </label>
              <input
                id="scenario-name-input"
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Quick Summary Pill */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Vehicle:</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {parameters.brand} {parameters.vehicleName} ({parameters.variant})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Horizon & Mode:</span>
                <span style={{ color: '#e2e8f0' }}>
                  {parameters.ownershipPeriodYears} Years • {parameters.purchaseMode.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Net Projected TCO:</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {formatCurrency(results.netTco, parameters.currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: isSavedSuccess ? '#10b981' : 'var(--accent-cyan)',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {isSavedSuccess ? <Check size={16} /> : <Bookmark size={16} />}
                {isSavedSuccess ? 'Saved Successfully!' : 'Save to Profile'}
              </button>

              <button
                type="button"
                onClick={() => handleExportCsv()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Scenarios List */}
        {tab === 'saved_list' && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
            {savedScenarios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No saved scenarios yet.</p>
                <p style={{ margin: 0, fontSize: '0.75rem', marginTop: '4px' }}>
                  Save your current calculation to reopen or compare later.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {savedScenarios.map((sc) => (
                  <div
                    key={sc.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      padding: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#f8fafc',
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {sc.scenarioName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {formatCurrency(sc.results.netTco, sc.parameters.currency)} •{' '}
                        {sc.parameters.ownershipPeriodYears} Yrs •{' '}
                        {new Date(sc.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadScenario(sc);
                          onClose();
                        }}
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportCsv(sc)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                        }}
                        title="Download CSV"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteScenario(sc.id)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                        title="Delete scenario"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
