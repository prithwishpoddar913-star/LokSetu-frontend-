-- =====================================================================
-- STAMP SAFAR — PUBLIC IMPACT VIEWS (TASK 9)
-- Aggregated read-only views for public impact dashboard. Zero PII.
-- =====================================================================

-- 1. OVERALL PUBLIC IMPACT METRICS VIEW
CREATE OR REPLACE VIEW public.v_public_impact AS
SELECT
  -- Verified/Approved Real Community counts
  (SELECT COUNT(*) FROM public.artisans WHERE status = 'approved') AS approved_artisans_count,
  (SELECT COUNT(*) FROM public.guides WHERE status = 'approved') AS approved_guides_count,
  (SELECT COUNT(*) FROM public.hosts WHERE status = 'approved') AS approved_hosts_count,
  
  -- Total Community Members
  (
    (SELECT COUNT(*) FROM public.artisans WHERE status = 'approved') +
    (SELECT COUNT(*) FROM public.guides WHERE status = 'approved') +
    (SELECT COUNT(*) FROM public.hosts WHERE status = 'approved')
  ) AS total_community_members,

  -- Commercial orders and revenue
  (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled') AS total_orders_count,
  (SELECT COALESCE(SUM(total), 0) FROM public.orders WHERE status != 'cancelled') AS total_order_value,

  -- Estimated Direct Community Share (90% fair-trade payout)
  (SELECT COALESCE(SUM(ROUND(total * 0.90, 2)), 0) FROM public.orders WHERE status IN ('placed', 'confirmed', 'shipped', 'delivered')) AS total_community_payout,

  -- Homestay bookings & enquiries
  (SELECT COUNT(*) FROM public.homestay_bookings WHERE status != 'cancelled') AS total_homestay_bookings,
  (SELECT COALESCE(SUM(total), 0) FROM public.homestay_bookings WHERE status != 'cancelled') AS total_homestay_value,
  (SELECT COUNT(*) FROM public.enquiries) AS total_enquiries_count,

  -- Philatelic & Cultural Heritage Scope
  (SELECT COUNT(*) FROM public.stamps WHERE is_active = true) AS total_stamps_count,
  18 AS total_destinations_mapped,
  3 AS total_states_covered,

  NOW() AS last_updated_at;

-- 2. STATE-WISE COMMUNITY NETWORK BREAKDOWN
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

-- 3. COMMUNITY EARNINGS SUMMARY
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

-- 4. ACTIVITY OVER TIME (ENQUIRIES, ORDERS & BOOKINGS)
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
