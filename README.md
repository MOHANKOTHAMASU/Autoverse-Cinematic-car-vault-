# AutoVerse — Cinematic Car Vault

![AutoVerse Cover](https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1920&q=85)

> **AutoVerse** is a flagship, progressive full-stack automotive platform and digital car vault. Engineered with React 19, TypeScript, and Vite, it unites high-performance automotive journalism, 3D interactive vehicle customization, side-by-side technical comparison radars, reducing-balance financing & 5-year Total Cost of Ownership (TCO) calculators, pre-owned marketplace commerce, dealership booking dispatch, offline-first PWA resilience, and an administrative intelligence analytics suite.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Installable-blueviolet.svg?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ecf8e.svg?logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-446%20Passed%20%7C%200%20Failed-success.svg)](#test-suite--quality-assurance)
[![Deployment](https://img.shields.io/badge/Vercel-Production%20Ready-black.svg?logo=vercel)](https://vercel.com/)

---

## 🌟 Highlights & Key Capabilities

- **Road Cinema & High-Fidelity Reels**: Curated high-definition automotive cinema including open-top high-altitude alpine grand tours under real clouds with crisp climate visibility, Mojave Desert midnight velocity runs, and Nürburgring aerodynamic lap telemetry.
- **Interactive 3D Configurator Studio**: Real-time vehicle configurator with multi-angle rotation, official factory paint coats, aerodynamic aero packages, wheels, and interior trims.
- **Top 50 Production Vehicle Catalog**: 50 verified production sports cars, luxury grand tourers, and high-efficiency electric vehicles with 100% unique photography and technical datasheets.
- **Head-to-Head Comparison Engine**: Side-by-side radar metrics comparing acceleration, power, range, charging curves, curb weight, and dimensions.
- **Smart Car Financing & Reducing-Balance EMI**: Bank-grade mathematical amortization modeling balloon payments, zero-interest schemes, subsidy deductions, and multi-lender APR comparisons.
- **5-Year Total Cost of Ownership (TCO) Calculator**: Comprehensive lifecycle financial modeling factoring regional electricity tariffs, fuel economy, maintenance schedules, insurance, depreciation curves, and resale retention.
- **Pre-Owned Marketplace**: Consumer car listing portal featuring escrow verification, moderation queue, condition disclosures, and buyer enquiry dispatch.
- **Dealership Network & Test-Drive Bookings**: Authorized showroom directory across major metropolitan centers with real-time test-drive appointment scheduling.
- **Progressive Web App (PWA)**: W3C compliant manifest, versioned service worker (`sw.js`), stale-while-revalidate caching, offline fallback screen (`offline.html`), and cross-platform installation prompts (including iOS Safari Add-to-Home-Screen instructions).
- **Executive Analytics Dashboard**: Administrative telemetry suite powered by custom interactive SVG charts (donut distribution, multi-point trend lines, horizontal comparison bars) and formula-injection-sanitized CSV exports (CWE-1236 defense).
- **Enterprise Security & Supabase Integration**: Strict Row-Level Security (RLS) policies, password encryption, session persistence, and role-based access control (RBAC).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 8](https://vitejs.dev/) + [Oxlint](https://oxc.rs/) |
| **Routing** | [React Router v7](https://reactrouter.com/) (Code-split lazy loading) |
| **Icons & Design Tokens** | [Lucide React](https://lucide.dev/) + Vanilla CSS Custom Properties (Dark Cinematic Theme) |
| **PWA & Offline** | Web App Manifest + Service Worker + Stale-While-Revalidate Caching |
| **Database & Backend** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`) + PostgreSQL with Row-Level Security (RLS) |
| **Mathematical Modeling** | Deterministic Reducing-Balance Loan Equations + EV/ICE Thermodynamic Consumption Physics |
| **Testing Engine** | Node.js Automated Test Suites (446 Validation Checks across 24 Stages) |

---

## 🧭 Complete Application Route Directory

### 🚗 Public Discovery & Automotive Experience
- `/` — Homepage, 3D Hero Showcase & Featured Launches
- `/cinema` — Road Cinema Fullscreen Theater (Open-Top Mountain Reel & High-Speed Drives)
- `/compare` — Head-to-Head Multi-Vehicle Comparison Studio
- `/car-finder` — Multi-Faceted Automotive Search & Discovery Engine
- `/configurator` — 3D Vehicle Customization & Paint Studio
- `/cars/:slug` — Vehicle Engineering Dossier (e.g. `/cars/porsche-taycan-turbo-s`)
- `/manufacturers` — Automotive OEM Manufacturers Directory
- `/launches` — Official Verified Vehicle Launches & Circulars
- `/dealers` — Authorized Showroom & Dealership Network Directory
- `/dealers/:slug` — Dealership Profile & Showroom Inventory
- `/offers` — Verified Dealer Promotional Offers & Commercial Subsidies
- `/financing` — Smart Car Financing & Reducing-Balance EMI Calculator
- `/used-cars` — Pre-Owned Verified Automotive Marketplace
- `/sell-car` — Used-Car Listing Submission Portal
- `/safety` — Automotive Safety Intelligence & Crash Ratings (Euro NCAP/B-NCAP)
- `/recalls` — Official Manufacturer Safety Recalls & VIN Search Desk
- `/charging` — Ultra-Fast EV Charging Infrastructure Locator
- `/market-intelligence` — Depreciation Forecasts & Residual Value Trends
- `/news` — Editorial Automotive News & Investigative Journalism
- `/reviews` — Verified Owner Reviews & Long-Term Durability Reports
- `/write-review` — Verified Owner Review Submission Form
- `/community` — Enthusiast Forums, Technical Q&A & Community Circles
- `/trip-planner` — EV & Hybrid Dynamic Route Planner with Elevation/Weather Consumption
- `/assistant` — AutoVerse AI Engineering Assistant

### 👤 User Account & Private Garage Portals (Authenticated)
- `/dashboard` — Unified Personalized Automotive Dashboard
- `/garage` — Digital Vehicle Garage, Mileage Tracker & Maintenance Logs
- `/my-financing` — User Saved Financing Scenarios & Amortization Comparisons
- `/my-listings` — User Pre-Owned Car Listings & Inquiries
- `/test-drive-bookings` — User Scheduled Test-Drive Appointments
- `/my-reviews` — User Published Reviews & Helpful Badges
- `/reading-list` — Saved Editorial Articles & Bookmarks
- `/saved-community` — Bookmarked Community Forum Discussions
- `/saved-trips` — Saved Expedition Waypoints & Charging Itineraries
- `/my-alerts` — Vehicle Safety Recalls & VIN Notification Center
- `/profile` — User Account Settings & Profile
- `/login` / `/register` / `/reset-password` — Authentication Workflows

### 🛡️ Administrative Consoles (`AdminRoute` Protected)
- `/admin` — Executive Admin Overview Hub
- `/admin/vehicles` — Vehicle Catalog Fleet Manager
- `/admin/manufacturers` — OEM Manufacturer Management
- `/admin/launches` — Official Launches & Circulars Desk
- `/admin/marketplace` — Used-Car Marketplace Moderation Queue
- `/admin/dealers` — Authorized Dealership Network Administration
- `/admin/test-drives` — Test-Drive Booking Coordination & Dispatch
- `/admin/offers` — Commercial Dealer Offers & Subsidy Management
- `/admin/finance-settings` — Institutional Auto Loan Provider Configuration
- `/admin/analytics` — Executive Analytics Hub
- `/admin/analytics/vehicles` — Fleet Composition & Powertrain Mix Analytics
- `/admin/analytics/marketplace` — Used-Car Inventory & Pricing Analytics
- `/admin/analytics/dealers` — Dealership Footprint & Test-Drive Demand Analytics
- `/admin/analytics/offers` — Offer Performance & Consumer Financing Trends
- `/admin/safety` — Safety Recalls Database & Crash Ledger
- `/admin/charging` — EV Charging Station Infrastructure Manager
- `/admin/reviews` — Review Moderation & Owner Verification Desk
- `/admin/articles` — Editorial Publishing & CMS Studio
- `/admin/community` — Forum Topic & Comment Moderation
- `/admin/cinema` — Road Cinema Reel Catalog Manager
- `/admin/assistant` — AI Telemetry & Query Audit
- `/admin/activity` — Security Audit Logs & Session Ledger
- `/admin/users` — Role-Based Access Control (RBAC) Management

---

## 🔒 Security & Privacy Architecture

1. **Role-Based Access Control (RBAC)**: All `/admin/*` routes strictly require administrative roles validated via `AdminRoute` and Supabase RLS.
2. **User Data Isolation**: Garage records, saved financing calculations, test-drive bookings, and private listings enforce strict `auth.uid() = user_id` row-level policies.
3. **Formula Injection Sanitization (CWE-1236)**: All CSV data exports strip and escape command injection prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`).
4. **Service Worker Privacy Guard**: Administrative dashboards, user private accounts (`/my-*`), authorization tokens, and mutating HTTP methods are completely excluded from service worker caching.
5. **No Secrets in Bundles**: Client-side bundles only consume public environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); database passwords and service-role keys remain strictly server-side.

---

## 🧪 Test Suite & Quality Assurance

AutoVerse maintains an extensive automated regression test suite covering all 24 development stages:

```bash
# Execute the comprehensive 446-check multi-stage automated audit
node src/scratch/run_all_stages.cjs
```

```text
================================================================
      AUTOVERSE MASTER STAGE: COMPREHENSIVE SUITE AUDIT         
================================================================

Running test_stage2_routes.cjs               ... ✅ PASS
Running test_stage3_verification.cjs         ... ✅ PASS
Running test_stage4_comparison.cjs           ... ✅ PASS (22 checks)
Running test_stage5_cinema.cjs               ... ✅ PASS (31 checks)
Running test_stage6_auth.cjs                 ... ✅ PASS (24 checks)
Running test_stage7_admin.cjs                ... ✅ PASS (10 checks)
Running test_stage8_audit.cjs                ... ✅ PASS (42 checks)
Running test_stage9_car_finder.cjs           ... ✅ PASS (42 checks)
Running test_stage9_top50_safety.cjs         ... ✅ PASS (43 checks)
Running test_stage10_configurator.cjs        ... ✅ PASS (18 checks)
Running test_stage11_ownership.cjs           ... ✅ PASS (16 checks)
Running test_stage12_calculator.cjs          ... ✅ PASS (19 checks)
Running test_stage13_editorial.cjs           ... ✅ PASS
Running test_stage14_community.cjs           ... ✅ PASS
Running test_stage15_assistant.cjs           ... ✅ PASS
Running test_stage16_trip_planner.cjs        ... ✅ PASS
Running test_stage17_safety.cjs              ... ✅ PASS (68 checks)
Running test_stage18_market_intelligence.cjs ... ✅ PASS
Running test_stage19_dashboard.cjs           ... ✅ PASS
Running test_stage20_dealers.cjs             ... ✅ PASS (20 checks)
Running test_stage21_marketplace.cjs         ... ✅ PASS (24 checks)
Running test_stage22_financing.cjs           ... ✅ PASS (25 checks)
Running test_stage23_pwa.cjs                 ... ✅ PASS (22 checks)
Running test_stage24_analytics.cjs           ... ✅ PASS (20 checks)

================================================================
OVERALL STATUS: ALL STAGES OPERATIONAL 🎉
TOTAL CHECKS RECORDED: 446 Passed | 0 Failed
================================================================
```

---

## ⚡ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/MOHANKOTHAMASU/Autoverse-Cinematic-car-vault-.git
cd Autoverse-Cinematic-car-vault-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env` if connecting to Supabase:
```bash
cp .env.example .env
```
*(AutoVerse runs out-of-the-box in local offline-first mode if Supabase keys are not provided).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 5. Build for Production
```bash
npm run build
```
Compiled production files are output to `dist/`.

---

## 🗄️ Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com/).
2. Navigate to **SQL Editor** $\rightarrow$ **New Query**.
3. Execute the production migration file located at:
   ```
   supabase/migrations/20261024000000_autoverse_master_schema.sql
   ```
4. Copy your **Project URL** and **Anon Public Key** from **Project Settings $\rightarrow$ API** into your `.env` file or Vercel dashboard.

---

## 🚀 Vercel Deployment

1. Import this repository on [vercel.com/new](https://vercel.com/new).
2. Framework Preset: **Vite** (auto-detected).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Single-Page Application (SPA) routing is pre-configured via `vercel.json` and `public/_redirects`.

---

## 📄 License & Credits

Architected and developed by **Mohan Venkata Subba Rao** ([@MOHANKOTHAMASU](https://github.com/MOHANKOTHAMASU)).  
Released under the MIT License.
