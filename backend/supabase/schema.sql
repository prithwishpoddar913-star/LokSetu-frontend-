-- =====================================================================
-- STAMP SAFAR — DATABASE SCHEMA (Idempotent & Production Ready)
-- Target: Supabase Postgres
-- =====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. USER PROFILES & ROLES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Trigger to create profile automatically on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE
      -- Owner / admin override for platform administrator
      WHEN LOWER(NEW.email) = 'prithwishpoddar913@gmail.com' THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 3. CUSTOMER SAVED ADDRESSES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- =====================================================================
-- 4. PRODUCTS: STAMPS & HANDICRAFTS (Editable from Supabase)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.stamps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  state TEXT,
  city TEXT,
  year INTEGER,
  rarity TEXT,
  image TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.handicraft_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  artisan_name TEXT,
  state TEXT NOT NULL,
  district TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 5,
  image TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stamps_category ON public.stamps(category);
CREATE INDEX IF NOT EXISTS idx_stamps_state ON public.stamps(state);
CREATE INDEX IF NOT EXISTS idx_handicrafts_state ON public.handicraft_products(state);

-- =====================================================================
-- 5. ORDERS & ORDER ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'placed',
  payment_method TEXT NOT NULL DEFAULT 'upi_qr',
  payment_status TEXT NOT NULL DEFAULT 'created',
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  protection_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  address TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  email TEXT,
  stamp_id TEXT,
  item TEXT,
  date TEXT,
  tracking_step TEXT DEFAULT 'Confirmed',
  utr_number TEXT,
  proof_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was already created earlier
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'placed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'upi_qr';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'created';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS protection_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stamp_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS item TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_step TEXT DEFAULT 'Confirmed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utr_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL DEFAULT 'stamp',
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =====================================================================
-- 6. PAYMENTS LEDGER
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  upi_utr TEXT,
  proof_url TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_upi_utr ON public.payments(upi_utr);

-- =====================================================================
-- 7. HOMESTAY BOOKINGS & ENQUIRIES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.homestay_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  homestay_id TEXT NOT NULL,
  homestay_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10, 2) NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'enquiry'
    CHECK (status IN ('enquiry', 'confirmed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homestays_user ON public.homestay_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_homestays_created ON public.homestay_bookings(created_at DESC);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);

-- =====================================================================
-- 8. LOGIN SECURITY: ATTEMPTS & 24H SYNCHRONIZED LOCKOUTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.auth_lockouts (
  email TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  blocked_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip TEXT,
  success BOOLEAN NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON public.login_attempts(created_at DESC);

-- Atomic synchronized function with advisory transaction lock
CREATE OR REPLACE FUNCTION public.check_and_record_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm_email TEXT;
  v_lockout RECORD;
  v_attempts INTEGER;
  v_blocked_until TIMESTAMPTZ;
  v_remaining_seconds INTEGER;
BEGIN
  v_norm_email := LOWER(TRIM(p_email));

  -- 1. Take advisory transaction lock on hashtext of email
  -- Serializes rapid / parallel login attempts for the exact same email
  PERFORM pg_advisory_xact_lock(hashtext(v_norm_email));

  -- 2. Check existing lockout entry
  SELECT * INTO v_lockout
  FROM public.auth_lockouts
  WHERE email = v_norm_email;

  -- If currently blocked and block window has not expired
  IF FOUND AND v_lockout.blocked_until IS NOT NULL AND v_lockout.blocked_until > NOW() THEN
    v_remaining_seconds := GREATEST(1, EXTRACT(EPOCH FROM (v_lockout.blocked_until - NOW()))::INTEGER);

    INSERT INTO public.login_attempts (email, ip, success, message)
    VALUES (v_norm_email, p_ip, FALSE, 'Blocked account login attempt');

    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked', TRUE,
      'remaining_seconds', v_remaining_seconds,
      'message', 'Too many failed login attempts. Account is temporarily blocked for 24 hours.'
    );
  END IF;

  -- 3. If login was successful
  IF p_success THEN
    INSERT INTO public.auth_lockouts (email, failed_attempts, blocked_until, last_attempt_at)
    VALUES (v_norm_email, 0, NULL, NOW())
    ON CONFLICT (email) DO UPDATE
    SET failed_attempts = 0, blocked_until = NULL, last_attempt_at = NOW();

    INSERT INTO public.login_attempts (email, ip, success, message)
    VALUES (v_norm_email, p_ip, TRUE, 'Successful login');

    RETURN jsonb_build_object(
      'allowed', TRUE,
      'blocked', FALSE,
      'attempts_remaining', 5
    );
  END IF;

  -- 4. If login failed
  v_attempts := COALESCE(v_lockout.failed_attempts, 0) + 1;

  IF v_attempts >= 5 THEN
    v_blocked_until := NOW() + INTERVAL '24 hours';

    INSERT INTO public.auth_lockouts (email, failed_attempts, blocked_until, last_attempt_at)
    VALUES (v_norm_email, v_attempts, v_blocked_until, NOW())
    ON CONFLICT (email) DO UPDATE
    SET failed_attempts = v_attempts, blocked_until = v_blocked_until, last_attempt_at = NOW();

    INSERT INTO public.login_attempts (email, ip, success, message)
    VALUES (v_norm_email, p_ip, FALSE, 'Exceeded max failed attempts (account locked 24h)');

    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked', TRUE,
      'attempts_remaining', 0,
      'remaining_seconds', 86400,
      'message', 'Maximum 5 failed attempts reached. Account has been blocked for 24 hours.'
    );
  ELSE
    INSERT INTO public.auth_lockouts (email, failed_attempts, blocked_until, last_attempt_at)
    VALUES (v_norm_email, v_attempts, NULL, NOW())
    ON CONFLICT (email) DO UPDATE
    SET failed_attempts = v_attempts, last_attempt_at = NOW();

    INSERT INTO public.login_attempts (email, ip, success, message)
    VALUES (v_norm_email, p_ip, FALSE, 'Failed password attempt');

    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked', FALSE,
      'attempts_remaining', (5 - v_attempts),
      'message', 'Invalid email or password.'
    );
  END IF;
END;
$$;

-- Manual Admin Unblock Helper
CREATE OR REPLACE FUNCTION public.admin_unblock_email(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can manually unblock accounts';
  END IF;

  DELETE FROM public.auth_lockouts
  WHERE email = LOWER(TRIM(p_email));
END;
$$;

-- =====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handicraft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homestay_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ADDRESSES
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- PRODUCTS (Stamps & Handicrafts: public read, admin write)
DROP POLICY IF EXISTS "Public read stamps" ON public.stamps;
CREATE POLICY "Public read stamps" ON public.stamps
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write stamps" ON public.stamps;
CREATE POLICY "Admin write stamps" ON public.stamps
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read handicrafts" ON public.handicraft_products;
CREATE POLICY "Public read handicrafts" ON public.handicraft_products
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write handicrafts" ON public.handicraft_products;
CREATE POLICY "Admin write handicrafts" ON public.handicraft_products
  FOR ALL USING (public.is_admin());

-- ORDERS (Customers read/insert own; client CANNOT update status or payment_status)
DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers create orders" ON public.orders;
CREATE POLICY "Customers create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Read order items" ON public.order_items;
CREATE POLICY "Read order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Insert order items" ON public.order_items;
CREATE POLICY "Insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

-- PAYMENTS (Client cannot mark paid; admin or edge function service_role)
DROP POLICY IF EXISTS "Read own payments" ON public.payments;
CREATE POLICY "Read own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Client insert payments with status created or pending" ON public.payments;
CREATE POLICY "Client insert payments with status created or pending" ON public.payments
  FOR INSERT WITH CHECK (
    status IN ('created', 'pending_verification')
  );

DROP POLICY IF EXISTS "Admin update payments" ON public.payments;
CREATE POLICY "Admin update payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- HOMESTAYS
DROP POLICY IF EXISTS "Users read own bookings" ON public.homestay_bookings;
CREATE POLICY "Users read own bookings" ON public.homestay_bookings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create bookings" ON public.homestay_bookings;
CREATE POLICY "Users create bookings" ON public.homestay_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ENQUIRIES (Anyone can insert; admins can read)
DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view enquiries" ON public.enquiries;
CREATE POLICY "Admin view enquiries" ON public.enquiries
  FOR SELECT USING (public.is_admin());

-- SECURITY TABLES: ADMIN ONLY
DROP POLICY IF EXISTS "Admin read login attempts" ON public.login_attempts;
CREATE POLICY "Admin read login attempts" ON public.login_attempts
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin read lockouts" ON public.auth_lockouts;
CREATE POLICY "Admin read lockouts" ON public.auth_lockouts
  FOR SELECT USING (public.is_admin());

-- =====================================================================
-- 10. ADMIN REPORTING VIEWS (Accessible in Supabase Table Editor / SQL)
-- =====================================================================

-- 1. Daily Sales View
CREATE OR REPLACE VIEW public.v_daily_sales AS
SELECT
  DATE_TRUNC('day', o.created_at)::DATE AS sale_date,
  COUNT(DISTINCT o.id) AS orders_count,
  COALESCE(SUM(NULLIF(o.total, 0)), SUM(o.amount), 0) AS total_revenue,
  COALESCE(SUM(CASE WHEN oi.product_type = 'stamp' THEN oi.quantity ELSE 0 END), 0) AS stamps_sold,
  COALESCE(SUM(CASE WHEN oi.product_type = 'handicraft' THEN oi.quantity ELSE 0 END), 0) AS handicrafts_sold
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY sale_date DESC;

-- 2. Today Summary View
CREATE OR REPLACE VIEW public.v_today_summary AS
SELECT
  COUNT(DISTINCT o.id) AS today_orders_count,
  COALESCE(SUM(NULLIF(o.total, 0)), SUM(o.amount), 0) AS today_revenue,
  COALESCE(SUM(CASE WHEN oi.product_type = 'stamp' THEN oi.quantity ELSE 0 END), 0) AS stamps_sold_today,
  COALESCE(SUM(CASE WHEN oi.product_type = 'handicraft' THEN oi.quantity ELSE 0 END), 0) AS handicrafts_sold_today,
  COUNT(DISTINCT CASE WHEN o.payment_method = 'cod' THEN o.id END) AS cod_orders_count,
  COUNT(DISTINCT CASE WHEN o.payment_method = 'upi_qr' AND o.payment_status = 'pending_verification' THEN o.id END) AS upi_qr_pending_verification,
  COUNT(DISTINCT CASE WHEN o.payment_method = 'razorpay' AND o.payment_status = 'paid' THEN o.id END) AS razorpay_paid_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelled';

-- 3. Orders by Payment Method
CREATE OR REPLACE VIEW public.v_orders_by_payment_method AS
SELECT
  payment_method,
  payment_status,
  COUNT(*) AS orders_count,
  COALESCE(SUM(total), 0) AS total_amount
FROM public.orders
GROUP BY payment_method, payment_status
ORDER BY orders_count DESC;

-- 4. Orders by Delivery Address
CREATE OR REPLACE VIEW public.v_orders_by_address AS
SELECT
  o.shipping_address->>'city' AS city,
  o.shipping_address->>'district' AS district,
  o.shipping_address->>'state' AS state,
  o.shipping_address->>'pincode' AS pincode,
  COUNT(*) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_spent
FROM public.orders o
GROUP BY
  o.shipping_address->>'city',
  o.shipping_address->>'district',
  o.shipping_address->>'state',
  o.shipping_address->>'pincode'
ORDER BY total_orders DESC;

-- 5. Pending Cash on Delivery Orders
CREATE OR REPLACE VIEW public.v_cod_orders AS
SELECT
  o.id,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.customer_email,
  o.total,
  o.shipping_address->>'line1' AS address_line,
  o.shipping_address->>'city' AS city,
  o.shipping_address->>'state' AS state,
  o.shipping_address->>'pincode' AS pincode,
  o.status,
  o.created_at
FROM public.orders o
WHERE o.payment_method = 'cod' AND o.status IN ('placed', 'confirmed')
ORDER BY o.created_at DESC;

-- 6. Best Selling Items
CREATE OR REPLACE VIEW public.v_best_selling_items AS
SELECT
  product_type,
  product_id,
  name,
  SUM(quantity) AS total_quantity_sold,
  SUM(line_total) AS total_revenue_generated
FROM public.order_items
GROUP BY product_type, product_id, name
ORDER BY total_quantity_sold DESC;

-- 7. Upcoming Homestay Bookings
CREATE OR REPLACE VIEW public.v_homestay_bookings AS
SELECT
  hb.id,
  hb.homestay_id,
  hb.homestay_name,
  hb.guest_name,
  hb.phone,
  hb.email,
  hb.check_in,
  hb.check_out,
  hb.guests,
  hb.total,
  hb.status,
  hb.created_at
FROM public.homestay_bookings hb
ORDER BY hb.check_in ASC;

-- 8. Customer Lifetime Value
CREATE OR REPLACE VIEW public.v_customers AS
SELECT
  COALESCE(p.id, o.user_id) AS customer_id,
  COALESCE(p.full_name, o.customer_name, 'Guest') AS name,
  COALESCE(u.email, o.customer_email) AS email,
  COALESCE(p.phone, o.customer_phone) AS phone,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.total), 0) AS total_spent,
  MAX(o.created_at) AS last_order_date
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN auth.users u ON o.user_id = u.id
GROUP BY COALESCE(p.id, o.user_id), p.full_name, o.customer_name, u.email, o.customer_email, p.phone, o.customer_phone
ORDER BY total_spent DESC;

-- =====================================================================
-- 11. COMMUNITY ONBOARDING, REVIEWS, REPORTS & EVENTS (SFIC EAST)
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

-- RLS FOR NEW COMMUNITY TABLES
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "Anyone submit review" ON public.reviews;
CREATE POLICY "Anyone submit review" ON public.reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
CREATE POLICY "Admin manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone submit report" ON public.reports;
CREATE POLICY "Anyone submit report" ON public.reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reports" ON public.reports;
CREATE POLICY "Admin manage reports" ON public.reports
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public insert events" ON public.events;
CREATE POLICY "Public insert events" ON public.events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read events" ON public.events;
CREATE POLICY "Admin read events" ON public.events
  FOR SELECT USING (public.is_admin());

-- =====================================================================
-- 12. PUBLIC IMPACT AGGREGATE VIEWS (TASK 9)
-- =====================================================================

CREATE OR REPLACE VIEW public.v_public_impact AS
SELECT
  (SELECT COUNT(*) FROM public.artisans WHERE status = 'approved') AS approved_artisans_count,
  (SELECT COUNT(*) FROM public.guides WHERE status = 'approved') AS approved_guides_count,
  (SELECT COUNT(*) FROM public.hosts WHERE status = 'approved') AS approved_hosts_count,
  (
    (SELECT COUNT(*) FROM public.artisans WHERE status = 'approved') +
    (SELECT COUNT(*) FROM public.guides WHERE status = 'approved') +
    (SELECT COUNT(*) FROM public.hosts WHERE status = 'approved')
  ) AS total_community_members,
  (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled') AS total_orders_count,
  (SELECT COALESCE(SUM(total), 0) FROM public.orders WHERE status != 'cancelled') AS total_order_value,
  (SELECT COALESCE(SUM(ROUND(total * 0.90, 2)), 0) FROM public.orders WHERE status IN ('placed', 'confirmed', 'shipped', 'delivered')) AS total_community_payout,
  (SELECT COUNT(*) FROM public.homestay_bookings WHERE status != 'cancelled') AS total_homestay_bookings,
  (SELECT COALESCE(SUM(total), 0) FROM public.homestay_bookings WHERE status != 'cancelled') AS total_homestay_value,
  (SELECT COUNT(*) FROM public.enquiries) AS total_enquiries_count,
  (SELECT COUNT(*) FROM public.stamps WHERE is_active = true) AS total_stamps_count,
  18 AS total_destinations_mapped,
  3 AS total_states_covered,
  NOW() AS last_updated_at;

CREATE OR REPLACE VIEW public.v_impact_by_state AS
SELECT
  s.state_name AS state,
  COALESCE(a.artisan_count, 0) AS artisans,
  COALESCE(g.guide_count, 0) AS guides,
  COALESCE(h.host_count, 0) AS hosts,
  (COALESCE(a.artisan_count, 0) + COALESCE(g.guide_count, 0) + COALESCE(h.host_count, 0)) AS total_members
FROM (
  SELECT 'West Bengal' AS state_name
  UNION ALL
  SELECT 'Bihar'
  UNION ALL
  SELECT 'Jharkhand'
) s
LEFT JOIN (
  SELECT state, COUNT(*) AS artisan_count
  FROM public.artisans
  WHERE status = 'approved'
  GROUP BY state
) a ON s.state_name = a.state
LEFT JOIN (
  SELECT state, COUNT(*) AS guide_count
  FROM public.guides
  WHERE status = 'approved'
  GROUP BY state
) g ON s.state_name = g.state
LEFT JOIN (
  SELECT state, COUNT(*) AS host_count
  FROM public.hosts
  WHERE status = 'approved'
  GROUP BY state
) h ON s.state_name = h.state;

CREATE OR REPLACE VIEW public.v_community_payouts AS
SELECT
  COALESCE(SUM(ROUND(o.total * 0.90, 2)), 0) AS direct_artisan_payout,
  COALESCE(SUM(ROUND(o.total * 0.10, 2)), 0) AS platform_maintenance_fee,
  COUNT(o.id) AS total_transactions,
  DATE_TRUNC('month', o.created_at)::DATE AS payout_month
FROM public.orders o
WHERE o.status != 'cancelled'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY payout_month DESC;

CREATE OR REPLACE VIEW public.v_impact_timeseries AS
SELECT
  d.day::DATE AS activity_date,
  COALESCE(e.enquiry_count, 0) AS enquiries,
  COALESCE(o.order_count, 0) AS orders,
  COALESCE(b.booking_count, 0) AS bookings
FROM (
  SELECT GENERATE_SERIES(
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS day
) d
LEFT JOIN (
  SELECT DATE(created_at) AS dt, COUNT(*) AS enquiry_count
  FROM public.enquiries
  GROUP BY DATE(created_at)
) e ON d.day::DATE = e.dt
LEFT JOIN (
  SELECT DATE(created_at) AS dt, COUNT(*) AS order_count
  FROM public.orders
  WHERE status != 'cancelled'
  GROUP BY DATE(created_at)
) o ON d.day::DATE = o.dt
LEFT JOIN (
  SELECT DATE(created_at) AS dt, COUNT(*) AS booking_count
  FROM public.homestay_bookings
  WHERE status != 'cancelled'
  GROUP BY DATE(created_at)
) b ON d.day::DATE = b.dt
ORDER BY activity_date ASC;
