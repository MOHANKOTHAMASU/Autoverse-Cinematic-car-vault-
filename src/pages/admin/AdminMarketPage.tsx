// AutoVerse Stage 18: Admin Market Data & Pricing Terminal Overview
import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  FileSpreadsheet,
  Database,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { getAllPriceRecords, getMarketSources, getMarketImportLogs } from '../../utils/marketStore';

export const AdminMarketPage: React.FC = () => {
  const records = getAllPriceRecords();
  const sources = getMarketSources();
  const logs = getMarketImportLogs();

  const activeRecords = records.filter((r) => r.status === 'active');
  const supersededRecords = records.filter((r) => r.status === 'superseded');

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <TrendingUp size={14} />
          <span>Stage 18 Administration Terminal</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff' }}>
          Market Intelligence & Price Administration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Manage automotive price observations, regulatory source adapters, CSV batch import pipelines, and audit trails.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Total Observations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '0.25rem' }}>
            {records.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {activeRecords.length} Active • {supersededRecords.length} Superseded
          </div>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Monitored Sources
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {sources.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            OEM Press Rooms & SIAM/FADA Registry
          </div>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Completed Imports
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', marginTop: '0.25rem' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Batches ingested with duplicate protection
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <Link
          to="/admin/market-data/prices"
          style={{
            padding: '1.75rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Database size={28} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Price Observations Repository
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Inspect, modify, add, or correct verified price observations. Maintain status flags and historical records.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.82rem', marginTop: '1.5rem' }}>
            <span>Manage Price Records</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/admin/market-data/imports"
          style={{
            padding: '1.75rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <FileSpreadsheet size={28} color="#34d399" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              CSV Batch Ingestion & Validation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Upload dealer circulars, validate positive prices and ISO dates, detect duplicates, and sanitize formula injection.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700, fontSize: '0.82rem', marginTop: '1.5rem' }}>
            <span>Upload & Validate CSV</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/admin/market-data/sources"
          style={{
            padding: '1.75rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Radio size={28} color="#fbbf24" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Market Data Sources
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Inspect OEM press room endpoints, regulatory registries, and update frequencies across India and global markets.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.82rem', marginTop: '1.5rem' }}>
            <span>Configure Data Feeds</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Recent Activity Ticker */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '16px', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
          Recent Batch Import Activity
        </h3>

        {logs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No administrative imports recorded in this session. Default verified catalog seeded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <strong style={{ color: '#ffffff' }}>{log.fileName}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.notes}</div>
                </div>

                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#34d399' }}>+{log.importedCount} rows</span> •{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{log.timestamp.slice(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
