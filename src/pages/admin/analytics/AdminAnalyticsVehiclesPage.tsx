// AutoVerse Stage 24: Vehicle & Manufacturer Analytics Dashboard
// Route: /admin/analytics/vehicles
// Catalog distribution, powertrain composition, price brackets, and spec completeness audits.

import React, { useMemo } from 'react';
import { AnalyticsNavTabs } from '../../../components/analytics/AnalyticsNavTabs';
import { AnalyticsBarChart } from '../../../components/analytics/AnalyticsBarChart';
import { AnalyticsDonutChart } from '../../../components/analytics/AnalyticsDonutChart';
import {
  getVehicleCatalogAnalytics,
  exportAnalyticsCSV,
} from '../../../utils/analyticsStore';
import { VEHICLES } from '../../../data/vehicles';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

export const AdminAnalyticsVehiclesPage: React.FC = () => {
  const catalog = useMemo(() => getVehicleCatalogAnalytics(), []);

  const handleExportCSV = () => {
    const headers = ['Vehicle ID', 'Brand / OEM', 'Model', 'Model Year', 'Powertrain', 'Body Type', 'Base Price (USD)', 'Top Speed', 'Acceleration (0-60)', 'Has Gallery'];
    const rows = VEHICLES.map((v) => [
      v.id,
      v.brand,
      v.model,
      v.modelYear || v.year,
      v.powertrain,
      v.bodyType || 'Coupe',
      v.price || 0,
      v.topSpeedMph ? `${v.topSpeedMph} mph` : 'N/A',
      v.accelerationSeconds ? `${v.accelerationSeconds}s` : 'N/A',
      v.imageGallery && v.imageGallery.length > 0 ? 'Yes' : 'No',
    ]);

    exportAnalyticsCSV('autoverse-vehicle-catalog-audit', headers, rows);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 0.4rem',
              color: '#f8fafc',
            }}
          >
            Vehicle & Manufacturer Analytics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Fleet composition breakdown by automotive marque, propulsion architecture, and specification audit completeness.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#2563eb',
            border: 'none',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '0.55rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Download size={14} />
          <span>Export Fleet Audit CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <AnalyticsNavTabs />

      {/* Completeness Telemetry Banner */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#f8fafc' }}>
          Catalog Specification Audit & Data Quality
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <CheckCircle2 size={15} />
              <span>Technical Telemetry</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {catalog.catalogCompleteness.specsCompletenessPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Verified top speed & 0-60 mph benchmarks</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <CheckCircle2 size={15} />
              <span>High-Res Visual Assets</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {catalog.catalogCompleteness.withHighResImagePct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Hero image or multi-angle 3D media verified</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <CheckCircle2 size={15} />
              <span>Safety & Features Index</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {catalog.catalogCompleteness.safetyRatedPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Euro NCAP / NHTSA safety ratings indexed</div>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00f0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <AlertCircle size={15} />
              <span>EV & Hybrid Penetration</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {catalog.catalogCompleteness.electricOrHybridPct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Share of electrified models in the portfolio</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Vehicles by Manufacturer"
          subtitle="Distribution of models across OEM partner marques"
          data={catalog.byManufacturer}
          maxBars={8}
          barColor="#3b82f6"
        />

        <AnalyticsDonutChart
          title="Powertrain Architecture"
          subtitle="BEV vs. PHEV vs. High-Performance ICE"
          data={catalog.byPowertrain}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Price Tier Segmentation"
          subtitle="Pricing distribution across market categories"
          data={catalog.byPriceBracket}
          barColor="#10b981"
        />

        <AnalyticsBarChart
          title="Vehicles by Model Year"
          subtitle="Fleet representation across model release years"
          data={catalog.byLaunchYear}
          barColor="#8b5cf6"
        />
      </div>

      {/* Detailed Vehicle Completeness Table */}
      <div
        style={{
          backgroundColor: '#0c1017',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#f8fafc' }}>
          Catalog Inventory Audit Sample
        </h3>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Model</th>
                <th style={{ padding: '0.75rem 1rem' }}>Marque</th>
                <th style={{ padding: '0.75rem 1rem' }}>Powertrain</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price (USD)</th>
                <th style={{ padding: '0.75rem 1rem' }}>0-60 mph</th>
                <th style={{ padding: '0.75rem 1rem' }}>Top Speed</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.slice(0, 8).map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {v.brand} {v.model}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.brand}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.powertrain}</td>
                  <td style={{ padding: '0.75rem 1rem', fontVariantNumeric: 'tabular-nums' }}>
                    ${(v.price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.accelerationSeconds ? `${v.accelerationSeconds}s` : 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{v.topSpeedMph ? `${v.topSpeedMph} mph` : 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
