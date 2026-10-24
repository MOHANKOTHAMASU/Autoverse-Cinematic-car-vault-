// AutoVerse Stage 24: Executive Analytics Overview Dashboard
// Route: /admin/analytics
// Real-time verified metrics across catalog, marketplace, test drives, offers, and community reviews.

import React, { useState, useMemo } from 'react';
import {
  Car,
  Building2,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Mail,
  Clock,
  Tag,
  ShieldAlert,
  Landmark,
} from 'lucide-react';
import { AnalyticsNavTabs } from '../../../components/analytics/AnalyticsNavTabs';
import { AnalyticsFilterBar } from '../../../components/analytics/AnalyticsFilterBar';
import { AnalyticsMetricCard } from '../../../components/analytics/AnalyticsMetricCard';
import { AnalyticsDonutChart } from '../../../components/analytics/AnalyticsDonutChart';
import { AnalyticsBarChart } from '../../../components/analytics/AnalyticsBarChart';
import { AnalyticsLineChart } from '../../../components/analytics/AnalyticsLineChart';
import {
  getOverviewAnalytics,
  getVehicleCatalogAnalytics,
  getMarketplaceAnalytics,
  getDealerAnalytics,
  exportAnalyticsCSV,
} from '../../../utils/analyticsStore';
import type { DateFilterOptions } from '../../../types/analytics';

export const AdminAnalyticsOverviewPage: React.FC = () => {
  const [filters, setFilters] = useState<DateFilterOptions>({ range: 'all_time' });

  // Calculate metrics based on active filter window
  const overview = useMemo(() => getOverviewAnalytics(filters), [filters]);
  const catalog = useMemo(() => getVehicleCatalogAnalytics(), []);
  const marketplace = useMemo(() => getMarketplaceAnalytics(filters), [filters]);
  const dealers = useMemo(() => getDealerAnalytics(filters), [filters]);

  const handleResetFilters = () => {
    setFilters({ range: 'all_time' });
  };

  const handleExportCSV = () => {
    const headers = ['Metric Category', 'Key Indicator', 'Metric Value', 'Reporting Scope'];
    const rows = [
      ['Catalog', 'Total Vehicles in Fleet', overview.totalCatalogVehicles, 'Global Verified Database'],
      ['Catalog', 'Verified Marques & OEMs', overview.totalManufacturers, 'Official Automotive Partners'],
      ['Catalog', 'Published Launches', overview.publishedLaunches, 'Official Launch Calendar'],
      ['Community', 'Published Owner Reviews', overview.totalPublishedReviews, 'Verified Owner Feedback'],
      ['Marketplace', 'Active Pre-Owned Listings', overview.activeUsedListings, 'Public Discovery Inventory'],
      ['Marketplace', 'Pending Buyer Enquiries', overview.pendingDealerEnquiries, 'Awaiting Dealer/Seller Reply'],
      ['Dealers', 'Test-Drive Booking Requests', overview.testDriveRequests, filters.range],
      ['Offers', 'Active Dealer Offers', overview.activeDealerOffers, 'Unexpired Promotions'],
      ['Financing', 'Saved Loan Scenarios', overview.savedFinancingScenarios, 'User Saved Calculations'],
      ['Safety', 'Tracked Recall Bulletins', overview.trackedSafetyRecalls, 'Official NHTSA/EU Database'],
    ];

    exportAnalyticsCSV('autoverse-executive-overview', headers, rows);
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
          Automotive Intelligence & Analytics
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          Executive dashboard aggregating verified vehicle specifications, used-car marketplace velocity, test-drive appointments, and dealer offers.
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

      {/* KPI Summary Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <AnalyticsMetricCard
          title="Fleet Catalog"
          value={overview.totalCatalogVehicles}
          subtext="Verified production vehicles"
          icon={Car}
          iconColor="#00f0ff"
          tooltip="Total production cars cataloged with technical specifications"
        />

        <AnalyticsMetricCard
          title="Marques & OEMs"
          value={overview.totalManufacturers}
          subtext="Official automotive brands"
          icon={Building2}
          iconColor="#38bdf8"
          tooltip="Distinct verified automotive manufacturers"
        />

        <AnalyticsMetricCard
          title="Upcoming Launches"
          value={overview.publishedLaunches}
          subtext="Tracked pipeline models"
          icon={Calendar}
          iconColor="#3b82f6"
          tooltip="Verified upcoming and recent vehicle launches"
        />

        <AnalyticsMetricCard
          title="Owner Reviews"
          value={overview.totalPublishedReviews}
          subtext="Published owner ratings"
          icon={MessageSquare}
          iconColor="#8b5cf6"
          tooltip="Moderated and published community owner reviews"
        />

        <AnalyticsMetricCard
          title="Active Listings"
          value={overview.activeUsedListings}
          subtext="Used-car inventory"
          icon={ShoppingBag}
          iconColor="#10b981"
          tooltip="Pre-owned vehicles currently listed in the marketplace"
        />

        <AnalyticsMetricCard
          title="Pending Enquiries"
          value={overview.pendingDealerEnquiries}
          subtext="Buyer inquiries awaiting reply"
          icon={Mail}
          iconColor="#f59e0b"
          tooltip="Marketplace buyer enquiries in pending state"
        />

        <AnalyticsMetricCard
          title="Test-Drive Bookings"
          value={overview.testDriveRequests}
          subtext="Requested test sessions"
          icon={Clock}
          iconColor="#ec4899"
          tooltip="Appointments submitted for dealership test drives"
        />

        <AnalyticsMetricCard
          title="Active Specials"
          value={overview.activeDealerOffers}
          subtext="Unexpired dealer offers"
          icon={Tag}
          iconColor="#00f0ff"
          tooltip="Valid approved promotional offers from dealer partners"
        />

        <AnalyticsMetricCard
          title="Saved Scenarios"
          value={overview.savedFinancingScenarios}
          subtext="Private loan calculations"
          icon={Landmark}
          iconColor="#34d399"
          tooltip="Calculated loan and EMI scenarios saved to user profiles"
        />

        <AnalyticsMetricCard
          title="Safety Recalls"
          value={overview.trackedSafetyRecalls}
          subtext="Official recall notices"
          icon={ShieldAlert}
          iconColor="#ef4444"
          tooltip="Safety recall bulletins indexed in the compliance database"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <AnalyticsDonutChart
          title="Catalog Powertrain Mix"
          subtitle="Distribution of Electric, Hybrid, and ICE engines"
          data={catalog.byPowertrain}
        />

        <AnalyticsBarChart
          title="Used-Car Marketplace Status"
          subtitle="Inventory lifecycle breakdown"
          data={marketplace.byStatus}
        />
      </div>

      {/* Time-Series Activity Trend */}
      <div style={{ marginBottom: '2rem' }}>
        <AnalyticsLineChart
          title="Test-Drive Request Velocity"
          subtitle="Daily appointment demand submitted across verified dealerships"
          data={dealers.bookingTimeline}
          strokeColor="#00f0ff"
        />
      </div>

      {/* Data Source Freshness Disclaimer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#94a3b8',
          fontSize: '0.8rem',
        }}
      >
        <span style={{ color: '#00f0ff', fontWeight: 700 }}>Data Provenance Notice:</span>
        <span>
          Metrics represent actual transactional and catalog database records. AutoVerse does not fabricate synthetic visitor counts, conversion guesses, or promotional quotes.
        </span>
      </div>
    </div>
  );
};
