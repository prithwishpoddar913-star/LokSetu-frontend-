# Stamp Safar — Project Architecture

This project is separated into two dedicated directories: `frontend` and `backend`.

---

## 1. `frontend/` (Complete User Interface & Client Application)

Contains everything required to build, run, and deploy the user-facing web app:

- **`frontend/src/routes/`**: All pages:
  - `index.tsx` (Hero, problem-solution-impact storytelling, stamp categories, featured craft clusters)
  - `stamps.tsx` (Philatelic marketplace with voice search, category & rarity filters)
  - `stamps.$stampId.tsx` (Stamp detail with origin geocoding to cultural destination)
  - `stamps.$stampId.buy.tsx` (Direct checkout with UPI QR, Razorpay, Cash on Delivery)
  - `heritage.tsx` & `heritage.$destinationId.tsx` (Destination explorer & local guide links)
  - `explore.tsx` & `explore.$stateSlug.tsx` (State-specific regional tourism across Bengal, Bihar, Jharkhand)
  - `handicrafts.tsx` (GI-tagged handicraft store with 90% fair-trade community share)
  - `guides.tsx` (Certified local youth guides directory)
  - `homestays.tsx` (Village homestays directory)
  - `about.tsx` (Complete Seva First Innovation Story: problem, affected groups, 4-step solution, SDGs, roadmap, team credits)
  - `impact.tsx` (Live public impact telemetry dashboard with zero PII, state breakdown & fair-trade calculator)
  - `onboard.tsx` (Community onboarding portal for rural artisans, youth guides, and hosts)
  - `dashboard.tsx` (User dashboard with buyer orders, wishlist, and admin management panel)
  - `auth.tsx` (Secure login & registration connected to Supabase)
  - `contact.tsx` (Grievance redressal desk & direct enquiry form)
  - `privacy.tsx`, `terms.tsx`, `refunds.tsx`, `shipping.tsx` (Official policy documents)
- **`frontend/src/components/`**: UI components, modals, header, navigation, and theme toggles.
- **`frontend/src/lib/`**: Client-side state, stamps catalog, cart, wishlist, Supabase client connector, and analytics tracker.
- **`frontend/src/assets/`**: High-resolution cultural images, stamps, background videos, and UI media.
- **`frontend/public/`**: Favicon, manifest, service worker (`sw.js`), and offline page.
- **`frontend/package.json` & `frontend/vite.config.ts`**: Standalone Vite build configuration.

### How to run the frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 2. `backend/` (Server, API & Database Infrastructure)

Contains all server-side logic, database migrations, and Cloud Edge Functions:

- **`backend/supabase/`**:
  - `complete_database_system.sql`: Complete production database script for customers, orders, order items, payments, user sessions, activity tracking, inventory, RLS, and analytics views.
  - `schema.sql` & `onboarding_tables.sql`: Community tables, profiles, and RLS policies.
  - `impact_views.sql`: Aggregated public telemetry views.
  - `seed.sql`: Baseline data initialization.
  - `useful_queries.sql`: Quick queries for inspecting orders, revenue, and active users.
- **`backend/supabase/functions/`**: Cloud Edge Functions for secure server operations:
  - `create-razorpay-order/`: Creates server-side Razorpay orders.
  - `verify-razorpay-payment/`: Verifies payment cryptographic signatures.
  - `razorpay-webhook/`: Webhook listener for payment confirmations.
  - `secure-login/`: Server-side rate-limiting and authentication handler.
- **`backend/src/`**: Node.js/TypeScript server endpoints and backend utility scripts.
- **`backend/package.json`**: Backend dependencies and scripts.
