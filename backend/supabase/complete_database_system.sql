-- ======================================================================================
-- STAMP SAFAR — COMPLETE PRODUCTION-READY SUPABASE DATABASE SYSTEM
-- Target: Supabase Postgres (Compatible with Supabase SQL Editor)
-- Purpose: Complete customer, order, order items, payments, web analytics,
--          user sessions, product inventory, triggers, RLS, and admin analytics.
-- ======================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================================
-- 2. ENUMS & DOMAINS
-- ======================================================================================
DO $$ BEGIN
  CREATE TYPE public.order_status_type AS ENUM (
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method_type AS ENUM (
    'UPI',
    'Cash on Delivery',
    'Card',
    'Net Banking',
    'Razorpay'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status_type AS ENUM (
    'Pending',
    'Successful',
    'Failed',
    'Refunded',
    'COD Pending',
    'COD Collected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ======================================================================================
-- 3. PROFILES / ADMIN HELPER (INTEGRATED WITH AUTH.USERS)
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin verification function used in Row Level Security policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) OR (
    -- Direct email fallback for platform owner
    auth.jwt() ->> 'email' IN ('mailtoprithwishpoddar@gmail.com', 'prithwishpoddar913@gmail.com')
  );
$$;

-- Automatically create or update profile on signup
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
      WHEN LOWER(NEW.email) IN ('mailtoprithwishpoddar@gmail.com', 'prithwishpoddar913@gmail.com') THEN 'admin'
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

-- ======================================================================================
-- 4. TABLE: CUSTOMERS
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  delivery_address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_reg_date ON public.customers(registration_date DESC);

-- Trigger to keep customers updated when profiles change or users login
CREATE OR REPLACE FUNCTION public.sync_user_to_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.customers (
    user_id,
    full_name,
    email,
    phone,
    registration_date,
    last_login
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.created_at,
    NEW.last_sign_in_at
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    last_login = EXCLUDED.last_login,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_sync_customer ON auth.users;
CREATE TRIGGER on_auth_user_sync_customer
  AFTER INSERT OR UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_to_customer();

-- ======================================================================================
-- 5. TABLE: PRODUCTS / STAMPS (Reuses & expands existing stamps table safely)
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.stamps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  year INTEGER,
  rarity TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
  image TEXT,
  product_status TEXT NOT NULL DEFAULT 'Available' CHECK (product_status IN ('Available', 'Low Stock', 'Out of Stock', 'Discontinued')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward compatibility columns for existing website schema
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'India';
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS product_status TEXT NOT NULL DEFAULT 'Available';
ALTER TABLE public.stamps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_stamps_category ON public.stamps(category);
CREATE INDEX IF NOT EXISTS idx_stamps_rarity ON public.stamps(rarity);
CREATE INDEX IF NOT EXISTS idx_stamps_price ON public.stamps(price);
CREATE INDEX IF NOT EXISTS idx_stamps_stock ON public.stamps(stock);
CREATE INDEX IF NOT EXISTS idx_stamps_status ON public.stamps(product_status);

-- ======================================================================================
-- 6. TABLE: ORDERS
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_status TEXT NOT NULL DEFAULT 'Pending' 
    CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  final_payable_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (final_payable_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (payment_status IN ('Pending', 'Successful', 'Failed', 'Refunded', 'COD Pending', 'COD Collected')),
  payment_method TEXT NOT NULL DEFAULT 'UPI'
    CHECK (payment_method IN ('UPI', 'Cash on Delivery', 'Card', 'Net Banking', 'Razorpay', 'upi_qr')),
  expected_delivery_date DATE,
  actual_delivery_date TIMESTAMPTZ,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  delivery_notes TEXT,
  
  -- Legacy columns preserved for backwards compatibility with existing UI
  status TEXT DEFAULT 'placed',
  amount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  shipping NUMERIC(10, 2) DEFAULT 0,
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  protection_fee NUMERIC(10, 2) DEFAULT 0,
  address TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  email TEXT,
  stamp_id TEXT,
  item TEXT,
  date TEXT,
  tracking_step TEXT DEFAULT 'Order Placed',
  utr_number TEXT,
  proof_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration-safe column checks
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS final_payable_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'UPI';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- ======================================================================================
-- 7. TABLE: ORDER ITEMS
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  stamp_id TEXT, -- nullable references public.stamps(id)
  stamp_name TEXT NOT NULL,
  stamp_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility with previous product_id / line_total columns
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS stamp_id TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS stamp_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS stamp_image TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_stamp_id ON public.order_items(stamp_id);

-- ======================================================================================
-- 8. TABLE: PAYMENTS
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL 
    CHECK (payment_method IN ('UPI', 'Cash on Delivery', 'Card', 'Net Banking', 'Razorpay', 'upi_qr')),
  payment_amount NUMERIC(10, 2) NOT NULL CHECK (payment_amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (payment_status IN ('Pending', 'Successful', 'Failed', 'Refunded', 'COD Pending', 'COD Collected')),
  transaction_id TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Provider specifics (Razorpay / UPI UTR)
  provider TEXT DEFAULT 'manual',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  upi_utr TEXT,
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON public.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);

-- ======================================================================================
-- 9. TABLE: USER SESSIONS (INACTIVITY-BASED TRACKING)
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  session_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end_time TIMESTAMPTZ,
  device_type TEXT DEFAULT 'Desktop',
  browser TEXT,
  session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'idle', 'closed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON public.user_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.user_sessions(last_activity_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.user_sessions(session_status);

-- ======================================================================================
-- 10. TABLE: WEBSITE USER ACTIVITY
-- ======================================================================================
CREATE TABLE IF NOT EXISTS public.website_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  session_id TEXT REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  page_visited TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'Website Visit',
      'Login',
      'Logout',
      'Product Viewed',
      'Add to Cart',
      'Checkout Started',
      'Order Placed',
      'Payment Attempted',
      'Filter Applied'
    )
  ),
  device_type TEXT DEFAULT 'Desktop',
  browser TEXT,
  ip_address INET, -- Stored only when legally permitted
  metadata JSONB DEFAULT '{}'::jsonb,
  activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.website_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_customer ON public.website_activity(customer_id);
CREATE INDEX IF NOT EXISTS idx_activity_session ON public.website_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.website_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.website_activity(activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_page ON public.website_activity(page_visited);

-- ======================================================================================
-- 11. AUTOMATIC TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ======================================================================================

-- A. Auto-generate Unique Human-Friendly Order Number if omitted (e.g. SF-2026-874291)
CREATE OR REPLACE FUNCTION public.set_order_number_and_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'SF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;

  -- Default expected delivery date: 5 days from order date
  IF NEW.expected_delivery_date IS NULL THEN
    NEW.expected_delivery_date := CURRENT_DATE + INTERVAL '5 days';
  END IF;

  -- Keep legacy columns synchronized
  NEW.status := COALESCE(NEW.order_status, NEW.status);
  NEW.amount := COALESCE(NEW.final_payable_amount, NEW.amount);
  NEW.total := COALESCE(NEW.final_payable_amount, NEW.total);

  -- Track actual delivery date when status changes to Delivered
  IF NEW.order_status = 'Delivered' AND (OLD IS NULL OR OLD.order_status != 'Delivered') THEN
    NEW.actual_delivery_date := NOW();
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_before_insert_update ON public.orders;
CREATE TRIGGER trg_order_before_insert_update
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number_and_dates();

-- B. Auto-recalculate Order Totals when items change
CREATE OR REPLACE FUNCTION public.recalculate_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id TEXT;
  v_subtotal NUMERIC(10, 2);
  v_delivery NUMERIC(10, 2);
  v_discount NUMERIC(10, 2);
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
  FROM public.order_items
  WHERE order_id = v_order_id;

  SELECT delivery_charge, discount INTO v_delivery, v_discount
  FROM public.orders
  WHERE id = v_order_id;

  UPDATE public.orders
  SET
    total_amount = v_subtotal,
    final_payable_amount = GREATEST(0, (v_subtotal + COALESCE(v_delivery, 0) - COALESCE(v_discount, 0))),
    subtotal = v_subtotal,
    total = GREATEST(0, (v_subtotal + COALESCE(v_delivery, 0) - COALESCE(v_discount, 0))),
    amount = GREATEST(0, (v_subtotal + COALESCE(v_delivery, 0) - COALESCE(v_discount, 0))),
    updated_at = NOW()
  WHERE id = v_order_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_recalc ON public.order_items;
CREATE TRIGGER trg_order_items_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_totals();

-- C. Inventory Management: Deduct Stock on Confirmed Order, Prevent Negative Stock
CREATE OR REPLACE FUNCTION public.handle_inventory_deduction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.stamp_id IS NOT NULL THEN
    -- Check if stock is sufficient
    IF EXISTS (
      SELECT 1 FROM public.stamps
      WHERE id = NEW.stamp_id AND stock < NEW.quantity
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for stamp ID %', NEW.stamp_id;
    END IF;

    -- Safely decrement stock
    UPDATE public.stamps
    SET
      stock = stock - NEW.quantity,
      product_status = CASE
        WHEN (stock - NEW.quantity) = 0 THEN 'Out of Stock'
        WHEN (stock - NEW.quantity) <= 3 THEN 'Low Stock'
        ELSE 'Available'
      END,
      updated_at = NOW()
    WHERE id = NEW.stamp_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deduct_stamp_stock ON public.order_items;
CREATE TRIGGER trg_deduct_stamp_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_inventory_deduction();

-- D. Payment & Order Status Sync
CREATE OR REPLACE FUNCTION public.sync_payment_to_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.payment_status = 'Successful' THEN
    UPDATE public.orders
    SET
      payment_status = 'Successful',
      order_status = CASE WHEN order_status = 'Pending' THEN 'Confirmed' ELSE order_status END,
      updated_at = NOW()
    WHERE id = NEW.order_id;
  ELSIF NEW.payment_status = 'COD Pending' THEN
    UPDATE public.orders
    SET
      payment_status = 'COD Pending',
      order_status = CASE WHEN order_status = 'Pending' THEN 'Confirmed' ELSE order_status END,
      updated_at = NOW()
    WHERE id = NEW.order_id;
  ELSIF NEW.payment_status = 'COD Collected' THEN
    UPDATE public.orders
    SET
      payment_status = 'COD Collected',
      order_status = 'Delivered',
      actual_delivery_date = COALESCE(actual_delivery_date, NOW()),
      updated_at = NOW()
    WHERE id = NEW.order_id;
  ELSIF NEW.payment_status = 'Refunded' THEN
    UPDATE public.orders
    SET
      payment_status = 'Refunded',
      order_status = 'Cancelled',
      updated_at = NOW()
    WHERE id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_payment_status ON public.payments;
CREATE TRIGGER trg_sync_payment_status
  AFTER INSERT OR UPDATE OF payment_status ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_payment_to_order();

-- E. Inactivity Heartbeat for User Sessions (Keep session active if event arrives)
CREATE OR REPLACE FUNCTION public.touch_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE public.user_sessions
    SET
      last_activity_time = NEW.activity_timestamp,
      session_status = 'active'
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_session ON public.website_activity;
CREATE TRIGGER trg_touch_session
  AFTER INSERT ON public.website_activity
  FOR EACH ROW EXECUTE FUNCTION public.touch_session_activity();

-- ======================================================================================
-- 12. ADMIN ANALYTICS & DATABASE VIEWS
-- ======================================================================================

-- 1. admin_all_orders
CREATE OR REPLACE VIEW public.admin_all_orders AS
SELECT
  o.id AS internal_order_id,
  o.order_number,
  o.order_date,
  o.order_status,
  COALESCE(c.full_name, o.customer_name, 'Guest Customer') AS customer_name,
  COALESCE(c.email, o.customer_email, o.email, 'N/A') AS customer_email,
  COALESCE(c.phone, o.customer_phone, 'N/A') AS customer_phone,
  o.payment_method,
  o.payment_status,
  o.total_amount,
  o.delivery_charge,
  o.discount,
  o.final_payable_amount,
  o.expected_delivery_date,
  o.actual_delivery_date,
  COALESCE(c.city, o.shipping_address->>'city', '') AS city,
  COALESCE(c.state, o.shipping_address->>'state', '') AS state
FROM public.orders o
LEFT JOIN public.customers c ON o.customer_id = c.id
ORDER BY o.order_date DESC;

-- 2. admin_order_details (Comprehensive joined view requested)
CREATE OR REPLACE VIEW public.admin_order_details AS
SELECT
  o.order_number AS "Order Number",
  COALESCE(c.full_name, o.customer_name, 'Guest Customer') AS "Customer Name",
  COALESCE(c.email, o.customer_email, o.email, 'N/A') AS "Customer Email",
  COALESCE(c.phone, o.customer_phone, 'N/A') AS "Phone",
  oi.stamp_name AS "Stamp Name",
  oi.quantity AS "Quantity",
  oi.unit_price AS "Unit Price",
  oi.subtotal AS "Item Subtotal",
  o.final_payable_amount AS "Total Amount",
  o.payment_method AS "Payment Method",
  o.payment_status AS "Payment Status",
  o.order_status AS "Order Status",
  o.order_date AS "Order Date",
  o.expected_delivery_date AS "Delivery Date",
  o.actual_delivery_date AS "Actual Delivered At"
FROM public.orders o
LEFT JOIN public.customers c ON o.customer_id = c.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
ORDER BY o.order_date DESC;

-- 3. admin_customer_details
CREATE OR REPLACE VIEW public.admin_customer_details AS
SELECT
  c.id AS customer_id,
  c.full_name,
  c.email,
  c.phone,
  c.city,
  c.state,
  c.pincode,
  c.registration_date,
  c.last_login,
  COUNT(DISTINCT o.id) AS total_orders_placed,
  COALESCE(SUM(o.final_payable_amount) FILTER (WHERE o.order_status != 'Cancelled'), 0) AS lifetime_spend,
  MAX(o.order_date) AS last_order_date
FROM public.customers c
LEFT JOIN public.orders o ON c.id = o.customer_id
GROUP BY c.id;

-- 4. admin_payment_details
CREATE OR REPLACE VIEW public.admin_payment_details AS
SELECT
  p.id AS payment_id,
  o.order_number,
  COALESCE(c.full_name, o.customer_name, 'Guest') AS customer_name,
  p.payment_method,
  p.payment_amount,
  p.payment_status,
  COALESCE(p.transaction_id, p.upi_utr, p.razorpay_payment_id, 'N/A') AS transaction_id,
  p.payment_date,
  p.provider
FROM public.payments p
JOIN public.orders o ON p.order_id = o.id
LEFT JOIN public.customers c ON p.customer_id = c.id
ORDER BY p.payment_date DESC;

-- 5. admin_sales_summary
CREATE OR REPLACE VIEW public.admin_sales_summary AS
SELECT
  COUNT(*) FILTER (WHERE order_status != 'Cancelled') AS total_orders,
  COALESCE(SUM(final_payable_amount) FILTER (WHERE order_status != 'Cancelled'), 0) AS total_revenue,
  COALESCE(AVG(final_payable_amount) FILTER (WHERE order_status != 'Cancelled'), 0) AS average_order_value,
  COUNT(*) FILTER (WHERE payment_status = 'Successful') AS successful_payments_count,
  COUNT(*) FILTER (WHERE payment_method = 'Cash on Delivery') AS total_cod_orders,
  COUNT(*) FILTER (WHERE payment_method IN ('UPI', 'upi_qr')) AS total_upi_orders,
  COUNT(*) FILTER (WHERE payment_status IN ('Pending', 'COD Pending')) AS pending_payments_count,
  COUNT(*) FILTER (WHERE payment_status = 'Refunded') AS refunded_payments_count,
  COALESCE(SUM(final_payable_amount) FILTER (WHERE payment_status = 'Refunded'), 0) AS refunded_amount
FROM public.orders;

-- 6. admin_daily_sales
CREATE OR REPLACE VIEW public.admin_daily_sales AS
SELECT
  DATE_TRUNC('day', order_date)::DATE AS sales_date,
  COUNT(*) AS total_orders,
  SUM(final_payable_amount) AS daily_revenue,
  COUNT(*) FILTER (WHERE payment_status = 'Successful') AS successful_orders
FROM public.orders
WHERE order_status != 'Cancelled'
GROUP BY DATE_TRUNC('day', order_date)::DATE
ORDER BY sales_date DESC;

-- 7. admin_monthly_sales
CREATE OR REPLACE VIEW public.admin_monthly_sales AS
SELECT
  TO_CHAR(order_date, 'YYYY-MM') AS sales_month,
  COUNT(*) AS total_orders,
  SUM(final_payable_amount) AS monthly_revenue,
  AVG(final_payable_amount) AS average_order_value
FROM public.orders
WHERE order_status != 'Cancelled'
GROUP BY TO_CHAR(order_date, 'YYYY-MM')
ORDER BY sales_month DESC;

-- 8. admin_best_selling_stamps
CREATE OR REPLACE VIEW public.admin_best_selling_stamps AS
SELECT
  oi.stamp_id,
  oi.stamp_name,
  s.category,
  s.price,
  s.stock AS current_stock,
  SUM(oi.quantity) AS total_units_sold,
  SUM(oi.subtotal) AS total_revenue_generated
FROM public.order_items oi
LEFT JOIN public.stamps s ON oi.stamp_id = s.id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.order_status != 'Cancelled'
GROUP BY oi.stamp_id, oi.stamp_name, s.category, s.price, s.stock
ORDER BY total_units_sold DESC;

-- 9. admin_low_stock_products
CREATE OR REPLACE VIEW public.admin_low_stock_products AS
SELECT
  id AS stamp_id,
  name AS stamp_name,
  category,
  price,
  stock,
  product_status
FROM public.stamps
WHERE stock <= 3 OR product_status IN ('Low Stock', 'Out of Stock')
ORDER BY stock ASC;

-- 10. admin_active_users (Strict 5-minute inactivity window)
CREATE OR REPLACE VIEW public.admin_active_users AS
SELECT
  s.id AS session_id,
  s.user_id,
  COALESCE(c.full_name, 'Guest Visitor') AS visitor_name,
  COALESCE(c.email, 'guest@stampsafar.in') AS visitor_email,
  s.device_type,
  s.browser,
  s.session_start_time,
  s.last_activity_time,
  ROUND(EXTRACT(EPOCH FROM (NOW() - s.last_activity_time)) / 60, 1) AS minutes_idle
FROM public.user_sessions s
LEFT JOIN public.customers c ON s.customer_id = c.id
WHERE s.last_activity_time >= (NOW() - INTERVAL '5 minutes')
ORDER BY s.last_activity_time DESC;

-- 11. admin_website_analytics
CREATE OR REPLACE VIEW public.admin_website_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.website_activity WHERE activity_type = 'Website Visit') AS total_visits,
  (SELECT COUNT(DISTINCT user_id) FROM public.website_activity WHERE user_id IS NOT NULL) AS unique_registered_visitors,
  (SELECT COUNT(DISTINCT session_id) FROM public.website_activity WHERE user_id IS NULL) AS guest_sessions_count,
  (SELECT COUNT(*) FROM public.admin_active_users) AS currently_active_users_now,
  (SELECT COUNT(*) FROM public.website_activity WHERE activity_type = 'Product Viewed') AS total_product_views,
  (SELECT COUNT(*) FROM public.website_activity WHERE activity_type = 'Add to Cart') AS total_add_to_cart,
  (SELECT COUNT(*) FROM public.website_activity WHERE activity_type = 'Checkout Started') AS total_checkouts_started,
  (SELECT COUNT(*) FROM public.orders) AS total_orders_completed;

-- 12. admin_recent_orders
CREATE OR REPLACE VIEW public.admin_recent_orders AS
SELECT
  order_number,
  customer_name,
  total_amount,
  payment_method,
  payment_status,
  order_status,
  order_date
FROM public.admin_all_orders
LIMIT 20;

-- ======================================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;

-- Customers RLS:
-- 1. Users can view and update their own customer record
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can create customer record on checkout" ON public.customers;
CREATE POLICY "Anyone can create customer record on checkout"
  ON public.customers FOR INSERT
  WITH CHECK (true);

-- Orders RLS:
-- 2. Customers see their own orders; Admins see all orders
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin or server can update orders" ON public.orders;
CREATE POLICY "Only admin or server can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- Order Items RLS:
DROP POLICY IF EXISTS "View order items" ON public.order_items;
CREATE POLICY "View order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Insert order items" ON public.order_items;
CREATE POLICY "Insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Payments RLS:
DROP POLICY IF EXISTS "View payments" ON public.payments;
CREATE POLICY "View payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Insert payments" ON public.payments;
CREATE POLICY "Insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Stamps RLS:
DROP POLICY IF EXISTS "Public can view active stamps" ON public.stamps;
CREATE POLICY "Public can view active stamps"
  ON public.stamps FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage stamps" ON public.stamps;
CREATE POLICY "Admins can manage stamps"
  ON public.stamps FOR ALL
  USING (public.is_admin());

-- Sessions and Activity RLS:
DROP POLICY IF EXISTS "Insert session" ON public.user_sessions;
CREATE POLICY "Insert session" ON public.user_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update own session" ON public.user_sessions;
CREATE POLICY "Update own session" ON public.user_sessions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Insert activity" ON public.website_activity;
CREATE POLICY "Insert activity" ON public.website_activity FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.website_activity;
CREATE POLICY "Admins can view all analytics" ON public.website_activity FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "Admins can view all sessions" ON public.user_sessions FOR SELECT USING (public.is_admin());

-- Grant view permissions to authenticated and service_role
GRANT SELECT ON public.admin_all_orders TO authenticated, service_role;
GRANT SELECT ON public.admin_order_details TO authenticated, service_role;
GRANT SELECT ON public.admin_customer_details TO authenticated, service_role;
GRANT SELECT ON public.admin_payment_details TO authenticated, service_role;
GRANT SELECT ON public.admin_sales_summary TO authenticated, service_role;
GRANT SELECT ON public.admin_daily_sales TO authenticated, service_role;
GRANT SELECT ON public.admin_monthly_sales TO authenticated, service_role;
GRANT SELECT ON public.admin_best_selling_stamps TO authenticated, service_role;
GRANT SELECT ON public.admin_low_stock_products TO authenticated, service_role;
GRANT SELECT ON public.admin_active_users TO authenticated, service_role;
GRANT SELECT ON public.admin_website_analytics TO authenticated, service_role;
GRANT SELECT ON public.admin_recent_orders TO authenticated, service_role;

-- ======================================================================================
-- END OF COMPLETE SUPABASE DATABASE SYSTEM SCRIPT
-- ======================================================================================
