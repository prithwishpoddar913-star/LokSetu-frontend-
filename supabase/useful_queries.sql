-- =====================================================================
-- STAMP SAFAR — USEFUL READY-TO-RUN QUERIES FOR SUPABASE SQL EDITOR
-- =====================================================================

-- 1. Today's Summary & KPIs
SELECT * FROM public.v_today_summary;

-- 2. Today's Stamps Sold (with stamp names and quantities)
SELECT 
  oi.product_id,
  oi.name AS stamp_name,
  SUM(oi.quantity) AS total_sold,
  SUM(oi.line_total) AS revenue
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
WHERE oi.product_type = 'stamp'
  AND DATE(o.created_at) = CURRENT_DATE
  AND o.status != 'cancelled'
GROUP BY oi.product_id, oi.name
ORDER BY total_sold DESC;

-- 3. Today's Pending Cash on Delivery (COD) Orders for Dispatch
SELECT * FROM public.v_cod_orders;

-- 4. Orders Awaiting Manual UPI QR Verification
-- Run this query to inspect pending customer UPI payments, check the UTR,
-- and then mark them paid.
SELECT 
  o.id AS order_id,
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.total,
  p.upi_utr,
  p.proof_url,
  p.created_at AS payment_submitted_at
FROM public.orders o
JOIN public.payments p ON o.id = p.order_id
WHERE o.payment_method = 'upi_qr'
  AND o.payment_status = 'pending_verification'
ORDER BY p.created_at ASC;

-- 4b. To Mark a Verified UPI Payment as Paid:
-- UPDATE public.orders SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() WHERE order_number = 'SS-123456';
-- UPDATE public.payments SET status = 'paid' WHERE order_id = (SELECT id FROM public.orders WHERE order_number = 'SS-123456');

-- 5. This Month's Revenue & Daily Performance
SELECT 
  DATE_TRUNC('month', created_at)::DATE AS month_start,
  COUNT(DISTINCT id) AS total_orders,
  SUM(total) AS monthly_revenue,
  AVG(total) AS average_order_value
FROM public.orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND status != 'cancelled'
GROUP BY DATE_TRUNC('month', created_at);

-- 6. Orders Broken Down by Geographic Address (City & State)
SELECT * FROM public.v_orders_by_address;

-- 7. Upcoming Homestay Bookings & Inquiries
SELECT * FROM public.v_homestay_bookings;

-- 8. Top 10 Best Selling Items Across All Categories
SELECT * FROM public.v_best_selling_items LIMIT 10;

-- 9. Check Currently Locked Out Accounts (Security Audit)
SELECT 
  email,
  failed_attempts,
  blocked_until,
  ROUND(EXTRACT(EPOCH FROM (blocked_until - NOW())) / 60) AS minutes_remaining,
  last_attempt_at
FROM public.auth_lockouts
WHERE blocked_until > NOW();

-- 10. Manually Unblock an Email (replace with target email):
-- SELECT public.admin_unblock_email('user@example.com');
