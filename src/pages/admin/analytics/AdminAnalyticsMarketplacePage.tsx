// AutoVerse Stage 24: Pre-Owned Marketplace Analytics
// Route: /admin/analytics/marketplace
// Inventory status breakdown, average asking prices, moderation velocity, and buyer demand trends.

import React, { useState, useMemo } from 'react';
import { AnalyticsNavTabs } from '../../../components/analytics/AnalyticsNavTabs';
import { AnalyticsFilterBar } from '../../../components/analytics/AnalyticsFilterBar';
import { AnalyticsMetricCard } from '../../../components/analytics/AnalyticsMetricCard';
import { AnalyticsDonutChart } from '../../../components/analytics/AnalyticsDonutChart';
import { AnalyticsBarChart } from '../../../components/analytics/AnalyticsBarChart';
import { AnalyticsLineChart } from '../../../components/analytics/AnalyticsLineChart';
import {
  getMarketplaceAnalytics,
  exportAnalyticsCSV,
} from '../../../utils/analyticsStore';
import { getAllListings } from '../../../utils/marketplaceStore';
import { ShoppingBag, Clock, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';
import type { DateFilterOptions } from '../../../types/analytics';

export const AdminAnalyticsMarketplacePage: React.FC = () => {
  const [filters, setFilters] = useState<DateFilterOptions>({ range: 'all_time' });

  const marketplace = useMemo(() => getMarketplaceAnalytics(filters), [filters]);

  const handleResetFilters = () => {
    setFilters({ range: 'all_time' });
  };

  const handleExportCSV = () => {
    const all = getAllListings({ includeInactive: true });
    const headers = ['Listing ID', 'Make', 'Model', 'Variant', 'Year', 'Asking Price (INR)', 'Mileage (km)', 'Fuel Type', 'Transmission', 'Status', 'City', 'Created Date'];
    const rows = all.map((l) => [
      l.id,
      l.make,
      l.model,
      l.variant,
      l.year,
      l.askingPrice,
      l.mileageKm,
      l.fuelType,
      l.transmission,
      l.status,
      l.locationCity,
      l.createdAt ? l.createdAt.split('T')[0] : '2024-10-01',
    ]);

    exportAnalyticsCSV('autoverse-marketplace-analytics', headers, rows);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 0.4rem',
            color: '#f8fafc',
          }}
        >
          Used-Car Marketplace Analytics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          Telemetry across certified pre-owned inventory, moderation turnaround, pricing distribution, and buyer enquiry volume.
        </p>
      </div>

      {/* Tabs */}
      <AnalyticsNavTabs />

      {/* Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        onExportCSV={handleExportCSV}
      />

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <AnalyticsMetricCard
          title="Total Listings"
          value={marketplace.totalListings}
          subtext="Recorded pre-owned inventory"
          icon={ShoppingBag}
          iconColor="#00f0ff"
        />

        <AnalyticsMetricCard
          title="Average Asking Price"
          value={`₹${(marketplace.averageAskingPrice / 100000).toFixed(1)}L`}
          subtext="Mean inventory valuation"
          icon={CheckCircle2}
          iconColor="#34d399"
        />

        <AnalyticsMetricCard
          title="Awaiting Moderation"
          value={marketplace.listingsAwaitingModeration}
          subtext="Pending admin verification"
          icon={Clock}
          iconColor="#f59e0b"
        />

        <AnalyticsMetricCard
          title="Buyer Enquiries"
          value={marketplace.totalBuyerEnquiries}
          subtext="Direct buyer inquiries"
          icon={Mail}
          iconColor="#3b82f6"
        />

        <AnalyticsMetricCard
          title="Resolved Moderations"
          value={marketplace.resolvedModerationCount}
          subtext="Approved or rejected entries"
          icon={ShieldAlert}
          iconColor="#8b5cf6"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsDonutChart
          title="Inventory Status Breakdown"
          subtitle="Active listings vs. sold vs. pending review"
          data={marketplace.byStatus}
        />

        <AnalyticsBarChart
          title="Top Makes in Marketplace"
          subtitle="Most listed automotive brands by private & dealer sellers"
          data={marketplace.topMakesListed}
          barColor="#3b82f6"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Fuel Type Representation"
          subtitle="Pre-owned fleet distribution across fuel technologies"
          data={marketplace.byFuelType}
          barColor="#10b981"
        />

        {/* Average Price by Fuel Type Table */}
        <div
          style={{
            backgroundColor: '#0c1017',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem' }}>
            Average Asking Price by Fuel Architecture
          </h4>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem' }}>
            Comparative valuation across propulsion categories
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {marketplace.averageAskingPriceByFuel.map((item) => (
              <div
                key={item.fuel}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>{item.fuel}</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{(item.avgPrice / 100000).toFixed(2)} Lakh
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Creation Timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <AnalyticsLineChart
          title="Marketplace Listing Velocity"
          subtitle="New vehicle submissions logged over time"
          data={marketplace.listingTimeline}
          strokeColor="#34d399"
        />
      </div>
    </div>
  );
};
