// AutoVerse Stage 18: Admin CSV Ingestion, Validation & Audit
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Download,
  Database,
} from 'lucide-react';
import { parseAndValidatePriceCsv } from '../../utils/marketService';
import { commitImportedRecords, getMarketImportLogs, getAllPriceRecords } from '../../utils/marketStore';
import type { CsvImportPreview } from '../../types/market';

export const AdminMarketImportsPage: React.FC = () => {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('dealer_circular_oct2024.csv');
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const importLogs = getMarketImportLogs();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
        const validated = parseAndValidatePriceCsv(text, getAllPriceRecords());
        setPreview(validated);
        setImportSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    if (!csvContent.trim()) return;
    const validated = parseAndValidatePriceCsv(csvContent, getAllPriceRecords());
    setPreview(validated);
    setImportSuccess(null);
  };

  const handleCommit = () => {
    if (!preview || preview.validRows.length === 0) return;

    commitImportedRecords(
      preview.validRows,
      fileName,
      preview.duplicateCount,
      preview.invalidRows.length
    );

    setImportSuccess(`Successfully committed ${preview.validRows.length} verified price records to the live database.`);
    setPreview(null);
    setCsvContent('');
  };

  const handleDownloadSample = () => {
    const sample = [
      '# AUTOVERSE SAMPLE PRICE IMPORT TEMPLATE',
      'vehicleslug,amount,currency,pricetype,effectivedate,sourcename,sourceurl,taxbasis',
      'porsche-taycan-turbo-s,211500,USD,ex_showroom,2024-11-01,Porsche Press Room,https://newsroom.porsche.com,msrp',
      'tata-curvv-ev,2249000,INR,ex_showroom,2024-11-01,Tata Official Circular,https://ev.tatamotors.com,ex_showroom',
      'tesla-model-s-plaid,89990,USD,ex_showroom,2024-11-01,Tesla Investor Relations,https://ir.tesla.com,msrp',
    ].join('\n');

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'autoverse_price_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin/market-data"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            textDecoration: 'none',
            marginBottom: '0.5rem',
          }}
        >
          <ArrowLeft size={14} /> Back to Terminal Overview
        </Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff' }}>
          CSV Batch Price Ingestion & Validation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Upload price circulars with automated column validation, duplicate detection, and formula-injection defenses.
        </p>
      </div>

      {importSuccess && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{importSuccess}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            Upload CSV File or Paste Raw Content
          </h3>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <Download size={14} />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* File Input */}
        <div
          style={{
            border: '2px dashed var(--border-medium)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.2)',
            marginBottom: '1.25rem',
          }}
        >
          <Upload size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem' }} />
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            Choose a price circular CSV to ingest
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            File will be strictly parsed and validated in browser sandbox before database commit.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
          />
        </div>

        {/* Or Paste Raw Text */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Or Paste CSV Rows
          </label>
          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="vehicleslug,amount,currency,pricetype,effectivedate,sourcename,sourceurl,taxbasis&#10;porsche-taycan-turbo-s,211500,USD,ex_showroom,2024-11-01,Porsche Official,https://porsche.com,msrp"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0c1017',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          />

          <button
            type="button"
            onClick={handleParseText}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <span>Parse & Validate Input</span>
          </button>
        </div>
      </div>

      {/* Validation Preview Zone */}
      {preview && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Batch Ingestion Preview & Validation Report
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Total rows parsed: {preview.totalRows} • Duplicate rows skipped: {preview.duplicateCount}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCommit}
              disabled={preview.validRows.length === 0}
              className="btn btn-primary"
              style={{
                opacity: preview.validRows.length === 0 ? 0.5 : 1,
                cursor: preview.validRows.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Database size={15} />
              <span>Commit {preview.validRows.length} Valid Records to Database</span>
            </button>
          </div>

          {/* Validation Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Valid Records
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
                {preview.validRows.length}
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Duplicate Observations
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
                {preview.duplicateCount}
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#f87171', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Rejected / Malformed Rows
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>
                {preview.invalidRows.length}
              </div>
            </div>
          </div>

          {/* Valid Rows Preview Table */}
          {preview.validRows.length > 0 && (
            <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Validated Rows Ready for Insertion:
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Vehicle Slug</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Currency</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Effective Date</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.validRows.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{r.vehicleSlug}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#ffffff' }}>{r.currency}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#ffffff', fontWeight: 700 }}>{r.amount}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{r.priceType}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{r.effectiveDate}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>{r.sourceName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Invalid Rows Report */}
          {preview.invalidRows.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
                Rejected Rows & Errors:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {preview.invalidRows.map((inv) => (
                  <div
                    key={inv.rowNumber}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#f87171', marginRight: '0.5rem' }}>
                      Row #{inv.rowNumber}:
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{inv.errors.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Audit Logs */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Import Ingestion Audit Logs
        </h3>

        {importLogs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No batch imports logged yet. Upload a CSV to initialize audit telemetry.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {importLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{log.fileName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.notes}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: log.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: log.status === 'success' ? '#34d399' : '#fbbf24',
                    }}
                  >
                    {log.status.toUpperCase()}
                  </span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                    {log.timestamp.slice(0, 16).replace('T', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
