// AutoVerse Stage 24: Dealer Network & Test-Drive Analytics
// Route: /admin/analytics/dealers
// Test-drive booking lifecycle, dealer geographic footprint, and popular test-drive vehicles.

import React, { useState, useMemo } from 'react';
import { AnalyticsNavTabs } from '../../../components/analytics/AnalyticsNavTabs';
import { AnalyticsFilterBar } from '../../../components/analytics/AnalyticsFilterBar';
import { AnalyticsMetricCard } from '../../../components/analytics/AnalyticsMetricCard';
import { AnalyticsDonutChart } from '../../../components/analytics/AnalyticsDonutChart';
import { AnalyticsBarChart } from '../../../components/analytics/AnalyticsBarChart';
import { AnalyticsLineChart } from '../../../components/analytics/AnalyticsLineChart';
import {
  getDealerAnalytics,
  exportAnalyticsCSV,
} from '../../../utils/analyticsStore';
import { getAllBookings } from '../../../utils/dealerStore';
import { Building2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DateFilterOptions } from '../../../types/analytics';

export const AdminAnalyticsDealersPage: React.FC = () => {
  const [filters, setFilters] = useState<DateFilterOptions>({ range: 'all_time' });

  const dealerData = useMemo(() => getDealerAnalytics(filters), [filters]);

  const handleResetFilters = () => {
    setFilters({ range: 'all_time' });
  };

  const handleExportCSV = () => {
    const bookings = getAllBookings();
    const headers = ['Booking Reference', 'Customer Name', 'Dealer Name', 'Vehicle Requested', 'Preferred Date', 'Time Slot', 'Booking Status', 'Created At'];
    const rows = bookings.map((b) => [
      b.bookingReference,
      b.userName,
      b.dealerName,
      b.vehicleName,
      b.preferredDate,
      b.preferredTimeSlot,
      b.status,
      b.createdAt,
    ]);

    exportAnalyticsCSV('autoverse-test-drives-audit', headers, rows);
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
          Dealer Network & Test-Drive Analytics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          Geographic presence of authorized retailers and appointment demand across production vehicle models.
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
          title="Verified Dealerships"
          value={dealerData.totalDealers}
          subtext="Official network partners"
          icon={Building2}
          iconColor="#00f0ff"
        />

        <AnalyticsMetricCard
          title="Test-Drive Bookings"
          value={dealerData.totalBookings}
          subtext="Total appointment volume"
          icon={Clock}
          iconColor="#3b82f6"
        />

        <AnalyticsMetricCard
          title="Pending Action"
          value={dealerData.pendingActionCount}
          subtext="Awaiting dealer confirmation"
          icon={AlertCircle}
          iconColor="#f59e0b"
        />

        <AnalyticsMetricCard
          title="Completed Drives"
          value={dealerData.byStatus.find((s) => s.label.toLowerCase().includes('completed'))?.count || 0}
          subtext="Finished road experiences"
          icon={CheckCircle2}
          iconColor="#10b981"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsDonutChart
          title="Test-Drive Status Lifecycle"
          subtitle="Appointment status distribution"
          data={dealerData.byStatus}
        />

        <AnalyticsBarChart
          title="Most Requested Models"
          subtitle="Vehicle models driving test-drive demand"
          data={dealerData.topRequestedVehicles}
          barColor="#ec4899"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Dealerships by Region"
          subtitle="Territorial distribution across states"
          data={dealerData.byRegion}
          barColor="#38bdf8"
        />

        <AnalyticsBarChart
          title="Dealerships by Metro Area"
          subtitle="Hub footprint across major cities"
          data={dealerData.byCity}
          barColor="#8b5cf6"
        />
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <AnalyticsLineChart
          title="Test-Drive Scheduling Velocity"
          subtitle="Appointments requested over time"
          data={dealerData.bookingTimeline}
          strokeColor="#00f0ff"
        />
      </div>
    </div>
  );
};
