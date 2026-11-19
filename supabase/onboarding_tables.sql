-- =====================================================================
-- STAMP SAFAR — COMMUNITY ONBOARDING, REVIEWS, REPORTS & EVENTS
-- Seva First Innovation Challenge (SFIC East)
-- =====================================================================

-- 1. ARTISANS TABLE
CREATE TABLE IF NOT EXISTS public.artisans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  craft TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('West Bengal', 'Bihar', 'Jharkhand')),
  district TEXT,
  languages TEXT,
  story TEXT,
  image TEXT,
  phone TEXT,
  payout_upi TEXT,
  payout_bank TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artisans_status ON public.artisans(status);
CREATE INDEX IF NOT EXISTS idx_artisans_state ON public.artisans(state);
CREATE INDEX IF NOT EXISTS idx_artisans_user ON public.artisans(user_id);

-- 2. GUIDES TABLE
CREATE TABLE IF NOT EXISTS public.guides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  languages TEXT NOT NULL,
  expertise TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('West Bengal', 'Bihar', 'Jharkhand')),
  destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience_years INTEGER NOT NULL DEFAULT 1,
  price_per_day NUMERIC(10, 2) NOT NULL DEFAULT 1000,
  phone TEXT,
  image TEXT,
  id_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guides_status ON public.guides(status);
CREATE INDEX IF NOT EXISTS idx_guides_state ON public.guides(state);
CREATE INDEX IF NOT EXISTS idx_guides_user ON public.guides(user_id);

-- 3. HOMESTAY HOSTS TABLE
CREATE TABLE IF NOT EXISTS public.hosts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_name TEXT NOT NULL,
  host_name TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('West Bengal', 'Bihar', 'Jharkhand')),
  district TEXT,
  address TEXT NOT NULL,
  facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  rooms INTEGER NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10, 2) NOT NULL DEFAULT 1500,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  house_rules TEXT,
  phone TEXT,
  id_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hosts_status ON public.hosts(status);
CREATE INDEX IF NOT EXISTS idx_hosts_state ON public.hosts(state);
CREATE INDEX IF NOT EXISTS idx_hosts_user ON public.hosts(user_id);

-- 4. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('artisan', 'guide', 'homestay', 'stamp')),
  target_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_type, target_id);

-- 5. SAFETY & CONTENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 6. PRIVACY-FRIENDLY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type TEXT NOT NULL,
  resource_id TEXT,
  state TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON public.events(created_at DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ARTISANS: Public reads approved; Users insert & update own; Admins manage all
DROP POLICY IF EXISTS "Public read approved artisans" ON public.artisans;
CREATE POLICY "Public read approved artisans" ON public.artisans
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create artisan profile" ON public.artisans;
CREATE POLICY "Users create artisan profile" ON public.artisans
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users update own artisan profile" ON public.artisans;
CREATE POLICY "Users update own artisan profile" ON public.artisans
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage artisans" ON public.artisans;
CREATE POLICY "Admin manage artisans" ON public.artisans
  FOR ALL USING (public.is_admin());

-- GUIDES: Public reads approved; Users insert & update own; Admins manage all
DROP POLICY IF EXISTS "Public read approved guides" ON public.guides;
CREATE POLICY "Public read approved guides" ON public.guides
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create guide profile" ON public.guides;
CREATE POLICY "Users create guide profile" ON public.guides
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users update own guide profile" ON public.guides;
CREATE POLICY "Users update own guide profile" ON public.guides
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage guides" ON public.guides;
CREATE POLICY "Admin manage guides" ON public.guides
  FOR ALL USING (public.is_admin());

-- HOSTS: Public reads approved; Users insert & update own; Admins manage all
DROP POLICY IF EXISTS "Public read approved hosts" ON public.hosts;
CREATE POLICY "Public read approved hosts" ON public.hosts
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create host profile" ON public.hosts;
CREATE POLICY "Users create host profile" ON public.hosts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users update own host profile" ON public.hosts;
CREATE POLICY "Users update own host profile" ON public.hosts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage hosts" ON public.hosts;
CREATE POLICY "Admin manage hosts" ON public.hosts
  FOR ALL USING (public.is_admin());

-- REVIEWS: Public reads approved; anyone can submit; admins moderate
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "Anyone submit review" ON public.reviews;
CREATE POLICY "Anyone submit review" ON public.reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
CREATE POLICY "Admin manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

-- REPORTS: Anyone can insert; admins can read & update
DROP POLICY IF EXISTS "Anyone submit report" ON public.reports;
CREATE POLICY "Anyone submit report" ON public.reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reports" ON public.reports;
CREATE POLICY "Admin manage reports" ON public.reports
  FOR ALL USING (public.is_admin());

-- EVENTS: Anyone can insert; admins can read
DROP POLICY IF EXISTS "Public insert events" ON public.events;
CREATE POLICY "Public insert events" ON public.events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read events" ON public.events;
CREATE POLICY "Admin read events" ON public.events
  FOR SELECT USING (public.is_admin());
