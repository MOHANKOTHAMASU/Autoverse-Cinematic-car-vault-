-- ============================================================================
-- AUTOVERSE: MASTER PRODUCTION SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Stage 25 / Master Integration Migration: 20261024000000_autoverse_master_schema.sql
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. USER PROFILES & RBAC ROLES (Linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'dealer_admin', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can read public profile data; users can only update their own profile; admins can manage all
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. VEHICLE CATALOG & MANUFACTURERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  founded_year INTEGER,
  headquarters TEXT,
  logo_url TEXT,
  hero_image TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manufacturers are publicly viewable"
  ON public.manufacturers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT NOT NULL,
  model_year INTEGER NOT NULL,
  body_type TEXT NOT NULL,
  powertrain TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  horsepower INTEGER,
  power_kw NUMERIC,
  torque_nm INTEGER,
  acceleration_seconds NUMERIC,
  top_speed_mph NUMERIC,
  top_speed_kmh NUMERIC,
  electric_range_miles NUMERIC,
  battery_capacity_kwh NUMERIC,
  thumbnail TEXT NOT NULL,
  image_gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  safety_ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published vehicles are publicly readable"
  ON public.vehicles FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))));

-- ============================================================================
-- 4. DIGITAL GARAGE (Strict User Isolation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.garage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  custom_name TEXT,
  current_mileage INTEGER NOT NULL DEFAULT 0,
  mileage_unit TEXT NOT NULL DEFAULT 'km',
  purchase_date DATE,
  ownership_type TEXT DEFAULT 'purchased',
  service_reminders JSONB NOT NULL DEFAULT '[]'::jsonb,
  expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.garage_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own garage items"
  ON public.garage_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own garage items"
  ON public.garage_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own garage items"
  ON public.garage_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own garage items"
  ON public.garage_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. PRE-OWNED MARKETPLACE & MODERATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id TEXT PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  mileage INTEGER NOT NULL,
  mileage_unit TEXT NOT NULL DEFAULT 'km',
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_moderation', 'sold', 'rejected', 'expired')),
  moderation_notes TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  enquiry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings; sellers can view their own listings; admins can view all
CREATE POLICY "Public can view active marketplace listings"
  ON public.marketplace_listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR auth.uid() = seller_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))));

CREATE POLICY "Authenticated users can create listings"
  ON public.marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON public.marketplace_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))));

CREATE POLICY "Sellers and admins can delete listings"
  ON public.marketplace_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));

-- ============================================================================
-- 6. DEALERSHIP NETWORK & TEST-DRIVE BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.test_drive_bookings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  dealer_id TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  contact_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.test_drive_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own bookings"
  ON public.test_drive_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dealer_admin'))));

CREATE POLICY "Users can create test-drive bookings"
  ON public.test_drive_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins can update booking status"
  ON public.test_drive_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dealer_admin'))));

-- ============================================================================
-- 7. SAVED FINANCING SCENARIOS (Strict User Isolation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financing_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT,
  scenario_title TEXT NOT NULL,
  vehicle_price NUMERIC NOT NULL,
  down_payment NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  tenure_months INTEGER NOT NULL,
  balloon_payment NUMERIC NOT NULL DEFAULT 0,
  monthly_emi NUMERIC NOT NULL,
  total_interest NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.financing_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own financing scenarios"
  ON public.financing_scenarios FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. VERIFIED REVIEWS & RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_reviews (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  overall_rating NUMERIC NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_verified_owner BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending', 'rejected')),
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.vehicle_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are viewable by anyone"
  ON public.vehicle_reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))));

CREATE POLICY "Authenticated users can submit reviews"
  ON public.vehicle_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. PRIVACY-PRESERVING ANALYTICS TELEMETRY (Admin Protected)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous and users can log analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON public.vehicles(slug);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON public.vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_powertrain ON public.vehicles(powertrain);
CREATE INDEX IF NOT EXISTS idx_garage_items_user ON public.garage_items(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_test_drives_user ON public.test_drives_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_financing_user ON public.financing_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON public.vehicle_reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);

-- ============================================================================
-- 11. STORAGE BUCKET POLICIES (Declarative Reference)
-- ============================================================================
-- Public Bucket: 'vehicle-media' (vehicle photos, public listing images)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-media', 'vehicle-media', true) ON CONFLICT DO NOTHING;
-- Private Bucket: 'user-documents' (identity verification, RC documents)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false) ON CONFLICT DO NOTHING;
