import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CinematicIntro } from './components/CinematicIntro';
import { FloatingAssistantWidget } from './components/FloatingAssistantWidget';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { PWAUpdateNotification } from './components/pwa/PWAUpdateNotification';

// Eagerly loaded public showcase foundations (Instant FCP)
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ManufacturersPage } from './pages/ManufacturersPage';
import { LaunchesPage } from './pages/LaunchesPage';

// Performance Code-Splitting: Lazy load heavy interactive & media modules
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const RoadCinemaPage = lazy(() => import('./pages/RoadCinemaPage').then((m) => ({ default: m.RoadCinemaPage })));
const GaragePage = lazy(() => import('./pages/GaragePage').then((m) => ({ default: m.GaragePage })));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })));
const CarFinderPage = lazy(() => import('./pages/CarFinderPage').then((m) => ({ default: m.CarFinderPage })));
const ConfiguratorPage = lazy(() => import('./pages/ConfiguratorPage').then((m) => ({ default: m.ConfiguratorPage })));
const OwnershipCalculatorPage = lazy(() => import('./pages/OwnershipCalculatorPage').then((m) => ({ default: m.OwnershipCalculatorPage })));

// Performance Code-Splitting: Lazy load Stage 13 Editorial & Review Modules
const NewsHomePage = lazy(() => import('./pages/NewsHomePage').then((m) => ({ default: m.NewsHomePage })));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })));
const ReadingListPage = lazy(() => import('./pages/ReadingListPage').then((m) => ({ default: m.ReadingListPage })));

// Performance Code-Splitting: Lazy load Stage 14 Community & Owner Review Modules
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const VehicleCommunityPage = lazy(() => import('./pages/VehicleCommunityPage').then((m) => ({ default: m.VehicleCommunityPage })));
const ReviewDetailPage = lazy(() => import('./pages/ReviewDetailPage').then((m) => ({ default: m.ReviewDetailPage })));
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage').then((m) => ({ default: m.WriteReviewPage })));
const MyReviewsPage = lazy(() => import('./pages/MyReviewsPage').then((m) => ({ default: m.MyReviewsPage })));
const SavedCommunityPage = lazy(() => import('./pages/SavedCommunityPage').then((m) => ({ default: m.SavedCommunityPage })));

// Performance Code-Splitting: Lazy load Member Authentication & Profile routes
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const VehicleOwnershipDetailPage = lazy(() => import('./pages/VehicleOwnershipDetailPage').then((m) => ({ default: m.VehicleOwnershipDetailPage })));

// Performance Code-Splitting: Lazy load Stage 7 Protected Administration Terminal
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminVehiclesPage = lazy(() => import('./pages/admin/AdminVehiclesPage').then((m) => ({ default: m.AdminVehiclesPage })));
const AdminManufacturersPage = lazy(() => import('./pages/admin/AdminManufacturersPage').then((m) => ({ default: m.AdminManufacturersPage })));
const AdminLaunchesPage = lazy(() => import('./pages/admin/AdminLaunchesPage').then((m) => ({ default: m.AdminLaunchesPage })));
const AdminCinemaPage = lazy(() => import('./pages/admin/AdminCinemaPage').then((m) => ({ default: m.AdminCinemaPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage').then((m) => ({ default: m.AdminActivityPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminArticlesPage = lazy(() => import('./pages/admin/AdminArticlesPage').then((m) => ({ default: m.AdminArticlesPage })));
const AdminArticleEditorPage = lazy(() => import('./pages/admin/AdminArticleEditorPage').then((m) => ({ default: m.AdminArticleEditorPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })));
const AdminCommunityPage = lazy(() => import('./pages/admin/AdminCommunityPage').then((m) => ({ default: m.AdminCommunityPage })));
const AssistantPage = lazy(() => import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const AdminAssistantPage = lazy(() => import('./pages/admin/AdminAssistantPage').then((m) => ({ default: m.AdminAssistantPage })));
const TripPlannerPage = lazy(() => import('./pages/TripPlannerPage').then((m) => ({ default: m.TripPlannerPage })));
const SavedTripDetailPage = lazy(() => import('./pages/SavedTripDetailPage').then((m) => ({ default: m.SavedTripDetailPage })));
const ChargingStationsPage = lazy(() => import('./pages/ChargingStationsPage').then((m) => ({ default: m.ChargingStationsPage })));
const ChargingStationDetailPage = lazy(() => import('./pages/ChargingStationDetailPage').then((m) => ({ default: m.ChargingStationDetailPage })));
const AdminChargingPage = lazy(() => import('./pages/admin/AdminChargingPage').then((m) => ({ default: m.AdminChargingPage })));

// Performance Code-Splitting: Lazy load Stage 17 Automotive Safety Intelligence & Recall Alerts
const SafetyHomePage = lazy(() => import('./pages/SafetyHomePage').then((m) => ({ default: m.SafetyHomePage })));
const RecallSearchPage = lazy(() => import('./pages/RecallSearchPage').then((m) => ({ default: m.RecallSearchPage })));
const RecallDetailPage = lazy(() => import('./pages/RecallDetailPage').then((m) => ({ default: m.RecallDetailPage })));
const VehicleSafetyPage = lazy(() => import('./pages/VehicleSafetyPage').then((m) => ({ default: m.VehicleSafetyPage })));
const MySafetyAlertsPage = lazy(() => import('./pages/MySafetyAlertsPage').then((m) => ({ default: m.MySafetyAlertsPage })));
const AdminSafetyPage = lazy(() => import('./pages/admin/AdminSafetyPage').then((m) => ({ default: m.AdminSafetyPage })));
const AdminSafetySourcesPage = lazy(() => import('./pages/admin/AdminSafetySourcesPage').then((m) => ({ default: m.AdminSafetySourcesPage })));
const AdminSafetyRecallsPage = lazy(() => import('./pages/admin/AdminSafetyRecallsPage').then((m) => ({ default: m.AdminSafetyRecallsPage })));
const AdminSafetySyncLogsPage = lazy(() => import('./pages/admin/AdminSafetySyncLogsPage').then((m) => ({ default: m.AdminSafetySyncLogsPage })));

// Performance Code-Splitting: Lazy load Stage 18 Market Intelligence & Price Analytics
const MarketIntelligencePage = lazy(() => import('./pages/MarketIntelligencePage').then((m) => ({ default: m.MarketIntelligencePage })));
const PriceExplorerPage = lazy(() => import('./pages/PriceExplorerPage').then((m) => ({ default: m.PriceExplorerPage })));
const VehiclePriceDetailPage = lazy(() => import('./pages/VehiclePriceDetailPage').then((m) => ({ default: m.VehiclePriceDetailPage })));
const SegmentAnalyticsPage = lazy(() => import('./pages/SegmentAnalyticsPage').then((m) => ({ default: m.SegmentAnalyticsPage })));
const ManufacturerAnalyticsPage = lazy(() => import('./pages/ManufacturerAnalyticsPage').then((m) => ({ default: m.ManufacturerAnalyticsPage })));
const AdminMarketPage = lazy(() => import('./pages/admin/AdminMarketPage').then((m) => ({ default: m.AdminMarketPage })));
const AdminMarketPricesPage = lazy(() => import('./pages/admin/AdminMarketPricesPage').then((m) => ({ default: m.AdminMarketPricesPage })));
const AdminMarketSourcesPage = lazy(() => import('./pages/admin/AdminMarketSourcesPage').then((m) => ({ default: m.AdminMarketSourcesPage })));
const AdminMarketImportsPage = lazy(() => import('./pages/admin/AdminMarketImportsPage').then((m) => ({ default: m.AdminMarketImportsPage })));

// Performance Code-Splitting: Lazy load Stage 19 Personalized Dashboard
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

// Performance Code-Splitting: Lazy load Stage 20 Dealer Network & Test-Drive Booking Modules
const DealerDiscoveryPage = lazy(() => import('./pages/DealerDiscoveryPage').then((m) => ({ default: m.DealerDiscoveryPage })));
const DealerDetailPage = lazy(() => import('./pages/DealerDetailPage').then((m) => ({ default: m.DealerDetailPage })));
const DealerVehiclesPage = lazy(() => import('./pages/DealerVehiclesPage').then((m) => ({ default: m.DealerVehiclesPage })));
const TestDriveBookingPage = lazy(() => import('./pages/TestDriveBookingPage').then((m) => ({ default: m.TestDriveBookingPage })));
const TestDriveDetailPage = lazy(() => import('./pages/TestDriveDetailPage').then((m) => ({ default: m.TestDriveDetailPage })));
const AdminDealersPage = lazy(() => import('./pages/admin/AdminDealersPage').then((m) => ({ default: m.AdminDealersPage })));
const AdminTestDrivesPage = lazy(() => import('./pages/admin/AdminTestDrivesPage').then((m) => ({ default: m.AdminTestDrivesPage })));

// Performance Code-Splitting: Lazy load Stage 21 Used-Car Marketplace Modules
const MarketplacePage = lazy(() => import('./pages/MarketplacePage').then((m) => ({ default: m.MarketplacePage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage })));
const SellCarPage = lazy(() => import('./pages/SellCarPage').then((m) => ({ default: m.SellCarPage })));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage').then((m) => ({ default: m.MyListingsPage })));
const SavedListingsPage = lazy(() => import('./pages/SavedListingsPage').then((m) => ({ default: m.SavedListingsPage })));
const MyEnquiriesPage = lazy(() => import('./pages/MyEnquiriesPage').then((m) => ({ default: m.MyEnquiriesPage })));
const AdminMarketplacePage = lazy(() => import('./pages/admin/AdminMarketplacePage').then((m) => ({ default: m.AdminMarketplacePage })));

// Performance Code-Splitting: Lazy load Stage 22 Dealer Offers & Smart Car Financing Modules
const OffersPage = lazy(() => import('./pages/OffersPage').then((m) => ({ default: m.OffersPage })));
const OfferDetailPage = lazy(() => import('./pages/OfferDetailPage').then((m) => ({ default: m.OfferDetailPage })));
const FinancingCalculatorPage = lazy(() => import('./pages/FinancingCalculatorPage').then((m) => ({ default: m.FinancingCalculatorPage })));
const MyFinancingPage = lazy(() => import('./pages/MyFinancingPage').then((m) => ({ default: m.MyFinancingPage })));
const AdminOffersPage = lazy(() => import('./pages/admin/AdminOffersPage').then((m) => ({ default: m.AdminOffersPage })));
const AdminFinanceSettingsPage = lazy(() => import('./pages/admin/AdminFinanceSettingsPage').then((m) => ({ default: m.AdminFinanceSettingsPage })));

// Performance Code-Splitting: Lazy load Stage 24 Automotive Analytics & Reporting Modules
const AdminAnalyticsOverviewPage = lazy(() => import('./pages/admin/analytics/AdminAnalyticsOverviewPage').then((m) => ({ default: m.AdminAnalyticsOverviewPage })));
const AdminAnalyticsVehiclesPage = lazy(() => import('./pages/admin/analytics/AdminAnalyticsVehiclesPage').then((m) => ({ default: m.AdminAnalyticsVehiclesPage })));
const AdminAnalyticsMarketplacePage = lazy(() => import('./pages/admin/analytics/AdminAnalyticsMarketplacePage').then((m) => ({ default: m.AdminAnalyticsMarketplacePage })));
const AdminAnalyticsDealersPage = lazy(() => import('./pages/admin/analytics/AdminAnalyticsDealersPage').then((m) => ({ default: m.AdminAnalyticsDealersPage })));
const AdminAnalyticsOffersPage = lazy(() => import('./pages/admin/analytics/AdminAnalyticsOffersPage').then((m) => ({ default: m.AdminAnalyticsOffersPage })));

// Scroll to top helper on route transition
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Global Intersection Observer for smooth scroll reveals
const ScrollRevealInit: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.fade-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
};

// Sleek Automotive Route Suspense Fallback
const RouteLoadingFallback: React.FC = () => (
  <div
    style={{
      minHeight: '65vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      backgroundColor: '#040608',
      color: 'var(--text-secondary)',
    }}
  >
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '2px solid rgba(6, 182, 212, 0.2)',
        borderTopColor: 'var(--accent-cyan)',
        animation: 'routeSpin 0.75s linear infinite',
      }}
    />
    <span
      style={{
        fontSize: '0.75rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-cyan)',
      }}
    >
      Synchronizing AutoVerse...
    </span>
    <style>{`@keyframes routeSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// App Layout Shell (Hides public navbar & footer on /admin/*)
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <OfflineBanner />
      <PWAUpdateNotification />
      {/* Experience 1: Dramatic Car Intro (Homepage only) */}
      {location.pathname === '/' && <CinematicIntro />}

      {!isAdminRoute && <Navbar />}

      <div style={{ flex: 1 }}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Discovery Routes (Stages 1-5, 9, 10) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/car-finder" element={<CarFinderPage />} />
            <Route path="/configurator" element={<ConfiguratorPage />} />
            <Route path="/configurator/:slug" element={<ConfiguratorPage />} />
            <Route path="/manufacturers" element={<ManufacturersPage />} />
            <Route path="/cars/:slug" element={<VehicleDetailPage />} />
            <Route path="/vehicle/:slug" element={<VehicleDetailPage />} />
            <Route path="/launches" element={<LaunchesPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/cinema" element={<RoadCinemaPage />} />
            <Route path="/garage" element={<GaragePage />} />
            <Route path="/garage/vehicles/:id" element={<VehicleOwnershipDetailPage />} />
            <Route path="/ownership-calculator" element={<OwnershipCalculatorPage />} />
            <Route path="/calculator" element={<OwnershipCalculatorPage />} />

            {/* Stage 13 Automotive News, Reviews & Editorial Routes */}
            <Route path="/news" element={<NewsHomePage />} />
            <Route path="/news/category/:slug" element={<NewsHomePage />} />
            <Route path="/news/:slug" element={<ArticleDetailPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reading-list" element={<ReadingListPage />} />

            {/* Stage 14 Community, Owner Reviews & Discussion Routes */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/vehicles/:slug" element={<VehicleCommunityPage />} />
            <Route path="/community/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="/community/write-review" element={<WriteReviewPage />} />
            <Route path="/community/write-review/:vehicleSlug" element={<WriteReviewPage />} />
            <Route
              path="/community/my-reviews"
              element={
                <ProtectedRoute>
                  <MyReviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/saved"
              element={
                <ProtectedRoute>
                  <SavedCommunityPage />
                </ProtectedRoute>
              }
            />

            {/* Stage 15 AI Automotive Assistant */}
            <Route path="/assistant" element={<AssistantPage />} />

            {/* Stage 16 EV Charging & Smart Trip Planner Routes */}
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/trip-planner/plan/:id" element={<SavedTripDetailPage />} />
            <Route path="/charging-stations" element={<ChargingStationsPage />} />
            <Route path="/charging-stations/:id" element={<ChargingStationDetailPage />} />

            {/* Stage 17 Automotive Safety Intelligence & Recall Alerts Routes */}
            <Route path="/safety" element={<SafetyHomePage />} />
            <Route path="/safety/recalls" element={<RecallSearchPage />} />
            <Route path="/safety/recalls/:slug" element={<RecallDetailPage />} />
            <Route path="/safety/vehicle/:slug" element={<VehicleSafetyPage />} />
            <Route
              path="/safety/my-alerts"
              element={
                <ProtectedRoute>
                  <MySafetyAlertsPage />
                </ProtectedRoute>
              }
            />

            {/* Stage 18 Market Intelligence & Price Analytics Routes */}
            <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
            <Route path="/market-intelligence/prices" element={<PriceExplorerPage />} />
            <Route path="/market-intelligence/vehicles/:slug" element={<VehiclePriceDetailPage />} />
            <Route path="/market-intelligence/segments" element={<SegmentAnalyticsPage />} />
            <Route path="/market-intelligence/manufacturers" element={<ManufacturerAnalyticsPage />} />

            {/* Stage 6 Authentication & Profile Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Stage 19 Personalized Automotive Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Stage 20 Dealer Network & Test-Drive Booking Routes */}
            <Route path="/dealers" element={<DealerDiscoveryPage />} />
            <Route path="/dealers/:slug" element={<DealerDetailPage />} />
            <Route path="/dealers/:slug/vehicles" element={<DealerVehiclesPage />} />
            <Route path="/test-drive" element={<TestDriveBookingPage />} />
            <Route path="/test-drive/:bookingId" element={<TestDriveDetailPage />} />

            {/* Stage 21 Used-Car Marketplace Routes */}
            <Route path="/used-cars" element={<MarketplacePage />} />
            <Route path="/used-cars/:slug" element={<ListingDetailPage />} />
            <Route path="/sell-car" element={<SellCarPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/saved-listings" element={<SavedListingsPage />} />
            <Route path="/my-enquiries" element={<MyEnquiriesPage />} />

            {/* Stage 22 Dealer Offers & Smart Car Financing Routes */}
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/:slug" element={<OfferDetailPage />} />
            <Route path="/financing" element={<FinancingCalculatorPage />} />
            <Route path="/financing/:vehicleSlug" element={<FinancingCalculatorPage />} />
            <Route
              path="/my-financing"
              element={
                <ProtectedRoute>
                  <MyFinancingPage />
                </ProtectedRoute>
              }
            />

            {/* Stage 7 Protected Administration Terminal Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              {/* Stage 24 Automotive Analytics & Reporting Routes */}
              <Route path="analytics" element={<AdminAnalyticsOverviewPage />} />
              <Route path="analytics/vehicles" element={<AdminAnalyticsVehiclesPage />} />
              <Route path="analytics/marketplace" element={<AdminAnalyticsMarketplacePage />} />
              <Route path="analytics/dealers" element={<AdminAnalyticsDealersPage />} />
              <Route path="analytics/offers" element={<AdminAnalyticsOffersPage />} />

              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="finance-settings" element={<AdminFinanceSettingsPage />} />
              <Route path="marketplace" element={<AdminMarketplacePage />} />
              <Route path="dealers" element={<AdminDealersPage />} />
              <Route path="test-drives" element={<AdminTestDrivesPage />} />
              <Route path="market-data" element={<AdminMarketPage />} />
              <Route path="market-data/prices" element={<AdminMarketPricesPage />} />
              <Route path="market-data/sources" element={<AdminMarketSourcesPage />} />
              <Route path="market-data/imports" element={<AdminMarketImportsPage />} />
              <Route path="safety" element={<AdminSafetyPage />} />
              <Route path="safety/sources" element={<AdminSafetySourcesPage />} />
              <Route path="safety/recalls" element={<AdminSafetyRecallsPage />} />
              <Route path="safety/sync-logs" element={<AdminSafetySyncLogsPage />} />
              <Route path="vehicles" element={<AdminVehiclesPage />} />
              <Route path="manufacturers" element={<AdminManufacturersPage />} />
              <Route path="launches" element={<AdminLaunchesPage />} />
              <Route path="cinema" element={<AdminCinemaPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
              <Route path="reports" element={<Navigate to="/admin/activity" replace />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="articles/new" element={<AdminArticleEditorPage />} />
              <Route path="articles/:id/edit" element={<AdminArticleEditorPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="community" element={<AdminCommunityPage />} />
              <Route path="assistant" element={<AdminAssistantPage />} />
              <Route path="charging" element={<AdminChargingPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </div>

      {!isAdminRoute && <PWAInstallBanner />}
      {!isAdminRoute && <FloatingAssistantWidget />}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ScrollRevealInit />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
