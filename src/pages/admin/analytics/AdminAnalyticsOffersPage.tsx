// AutoVerse Stage 24: Dealer Offers & Financing Analytics
// Route: /admin/analytics/offers
// Promotional campaign composition, validity expiration ratio, and consumer financing scenario behavior.

import React, { useState, useMemo } from 'react';
import { AnalyticsNavTabs } from '../../../components/analytics/AnalyticsNavTabs';
import { AnalyticsFilterBar } from '../../../components/analytics/AnalyticsFilterBar';
import { AnalyticsMetricCard } from '../../../components/analytics/AnalyticsMetricCard';
import { AnalyticsDonutChart } from '../../../components/analytics/AnalyticsDonutChart';
import { AnalyticsBarChart } from '../../../components/analytics/AnalyticsBarChart';
import {
  getOffersAnalytics,
  exportAnalyticsCSV,
} from '../../../utils/analyticsStore';
import { getAllOffers } from '../../../utils/financeStore';
import { Tag, CheckCircle2, Clock, Landmark, AlertTriangle } from 'lucide-react';
import type { DateFilterOptions } from '../../../types/analytics';

export const AdminAnalyticsOffersPage: React.FC = () => {
  const [filters, setFilters] = useState<DateFilterOptions>({ range: 'all_time' });

  const offersData = useMemo(() => getOffersAnalytics(filters), [filters]);

  const handleResetFilters = () => {
    setFilters({ range: 'all_time' });
  };

  const handleExportCSV = () => {
    const offers = getAllOffers();
    const headers = ['Offer ID', 'Title', 'Category', 'Vehicle', 'Dealer Provider', 'Benefit Amount', 'Benefit Label', 'Region', 'Valid From', 'Valid Until', 'Status', 'Verification Status'];
    const rows = offers.map((o) => [
      o.id,
      o.title,
      o.category,
      o.vehicleTitle,
      o.dealerName,
      o.benefitAmount,
      o.benefitFormatted,
      o.region,
      o.validFrom,
      o.validUntil,
      o.status,
      o.verificationStatus,
    ]);

    exportAnalyticsCSV('autoverse-dealer-offers-audit', headers, rows);
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
          Dealer Offers & Financing Analytics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          Campaign distribution across incentive categories and borrower behavior captured through loan calculations.
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
          title="Total Offers"
          value={offersData.totalOffers}
          subtext="Recorded dealer bulletins"
          icon={Tag}
          iconColor="#00f0ff"
        />

        <AnalyticsMetricCard
          title="Active & Valid"
          value={offersData.activeOffersCount}
          subtext="Currently eligible specials"
          icon={CheckCircle2}
          iconColor="#10b981"
        />

        <AnalyticsMetricCard
          title="Expired Offers"
          value={offersData.expiredOffersCount}
          subtext="Past validity timeline"
          icon={Clock}
          iconColor="#f59e0b"
        />

        <AnalyticsMetricCard
          title="Pending Review"
          value={offersData.pendingOffersCount}
          subtext="Awaiting verification"
          icon={AlertTriangle}
          iconColor="#ec4899"
        />

        <AnalyticsMetricCard
          title="Saved Scenarios"
          value={offersData.savedScenariosCount}
          subtext="User loan calculations"
          icon={Landmark}
          iconColor="#38bdf8"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Offers by Category"
          subtitle="Incentive types distributed across dealerships"
          data={offersData.byCategory}
          barColor="#3b82f6"
        />

        <AnalyticsDonutChart
          title="Benefit Valuation Models"
          subtitle="Direct cash discounts vs. promo APR vs. packages"
          data={offersData.byBenefitType}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsBarChart
          title="Preferred Loan Tenures"
          subtitle="Financing periods selected by users"
          data={offersData.scenariosByTenure}
          barColor="#10b981"
        />

        <AnalyticsBarChart
          title="Down Payment Behavior"
          subtitle="Equity contributed upfront by car buyers"
          data={offersData.scenariosByDownPaymentTier}
          barColor="#8b5cf6"
        />
      </div>
    </div>
  );
};
