# ServiceOS

## Overview

ServiceOS is a SaaS operations platform for field service businesses (landscaping, roofing, HVAC, pest control, cleaning, moving). Built as a full-stack pnpm monorepo with a React+Vite frontend, Express API server, and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix primitives
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Mock auth for dev (replace with Clerk keys for production)
- **Charts**: Recharts
- **Forms**: react-hook-form + zod resolvers
- **Animations**: framer-motion
- **Build**: esbuild (CJS bundle)

## User Roles

- **Owner**: Full control — all modules, billing, settings, franchise features
- **Admin**: Jobs, CRM, scheduling, dispatch (no billing/franchise settings)
- **Manager**: Crew supervision — dispatch, job updates, SMS
- **Operator**: SMS-only job interaction (limited mobile-friendly view)

## Subscription Tiers

- **Free**: 3 users, core ops only (no GPS, no SMS, no analytics)
- **Independent**: 6 users + GPS, manual SMS, referral network, basic financials
- **Pro**: 25 users + AI SMS, full analytics, limited support
- **Franchise**: 75 operators + landing pages, multi-location, priority support, custom API
- **Enterprise**: 200+ operators, custom pricing

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server
│   │   └── src/
│   │       ├── middlewares/auth.ts   # Auth middleware (x-clerk-user-id header)
│   │       ├── routes/              # All API routes
│   │       └── services/email.ts    # Email service (Resend integration, stubbed)
│   └── service-os/         # React+Vite frontend (main app)
│       └── src/
│           ├── pages/               # All page components
│           │   ├── landing.tsx      # Public landing page
│           │   ├── demo.tsx         # Demo request flow
│           │   ├── dashboard.tsx    # Role-differentiated dashboard
│           │   ├── leads.tsx        # CRM pipeline (kanban + table views)
│           │   ├── customers.tsx    # Customer database
│           │   ├── jobs.tsx         # Job scheduling with detail panel
│           │   ├── dispatch.tsx     # Dispatch board (board/day/week/list views)
│           │   ├── sms.tsx          # SMS hub with AI compose
│           │   ├── financials.tsx   # Invoice management + revenue tracking
│           │   ├── reviews.tsx      # Review dashboard with ratings
│           │   ├── referrals.tsx    # Referral network (groups/marketplace/tracking)
│           │   ├── analytics.tsx    # Full analytics with charts
│           │   ├── gps.tsx          # Live GPS crew tracking
│           │   └── settings/
│           │       ├── demo-scheduler.tsx  # Demo admin (Owner only)
│           │       ├── landing-pages.tsx   # Landing page builder (Franchise+)
│           │       ├── locations.tsx       # Multi-location management (Franchise+)
│           │       └── api-keys.tsx        # API key management (Franchise+)
│           ├── components/
│           │   ├── layout/Sidebar.tsx      # Nav with tier-gated lock icons
│           │   ├── layout/DashboardLayout.tsx
│           │   └── ProtectedRoute.tsx      # Route guards + UpgradeCard
│           └── lib/
│               ├── mock-auth.tsx           # Dev mock auth with RoleTierSwitcher
│               └── permissions.ts          # Feature flag + role permission matrix
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/     # 21 database tables
├── scripts/                # Utility scripts
└── package.json
```

## Database Schema Tables (25 total)

- **companies** — Company accounts with tier, Stripe IDs, feature flags
- **users** — Users with Clerk ID, role, and company FK
- **leads** — Sales leads / CRM pipeline
- **customers** — Converted customers with rating average
- **jobs** — Job scheduling with GPS check-in support
- **invoices** — Invoice management with status lifecycle
- **reviews** — Post-job ratings, testimonials, public reviews
- **referrals** — Referral tracking
- **referral_groups** / **referral_group_members** — Referral network
- **sms_events** — SMS workflow history
- **demo_requests** — Demo scheduling requests
- **demo_slots** — Demo slot configuration (available days, time blocks, limits)
- **demo_bookings** — Demo booking records
- **demo_hosts** — Demo host roster
- **gps_logs** — GPS tracking data
- **email_log** — Email delivery tracking
- **lead_notes** — Lead activity notes
- **issues** — Job issue reports
- **landing_pages** — Custom landing pages (Franchise+)
- **api_keys** — API key management (Franchise+)
- **support_tickets** — Support ticket system
- **locations** — Multi-location management (Franchise+)
- **company_settings** — Company-level preferences (timezone, currency, branding)
- **user_profiles** — Extended user profiles (avatar, bio, display name)
- **user_invites** — Team invitation tokens with expiry
- **audit_log** — Account-level audit trail (90-day retention)

## API Routes

All routes under `/api/*`:

- `GET/POST /api/auth/me` — User profile (auto-creates on first access)
- `POST /api/auth/setup` — Onboarding wizard
- `GET/POST /api/leads` + CRUD
- `GET/POST /api/customers` + CRUD
- `GET/POST /api/jobs` + CRUD + `/checkin` + `/complete`
- `GET/POST /api/invoices` + CRUD
- `GET/POST /api/reviews`
- `GET/POST /api/sms/events`, `POST /api/sms/send`, `POST /api/sms/webhook`
- `GET/POST /api/referrals`
- `GET/POST /api/referral-groups`
- `GET/POST /api/demo`, `GET /api/demo/slots`, `POST /api/demo/book`
- `GET/PATCH /api/demo/settings` — Demo scheduler admin (Owner only)
- `POST /api/demo/hosts`, `PATCH /api/demo/hosts/:hostId`
- `GET /api/emails` — Email log (Admin+)
- `GET /api/analytics/overview|revenue|jobs`
- `GET/PATCH /api/company/profile` — Company info
- `GET/PATCH /api/company/settings` — Company preferences (timezone, currency, branding)
- `GET /api/users` — Team directory (Admin+)
- `PATCH /api/users/:id/role` — Change role (Owner only)
- `PATCH /api/users/:id/deactivate` — Deactivate/reactivate user (Owner only)
- `POST /api/users/invite` — Send team invite (Admin+)
- `DELETE /api/users/invite/:inviteId` — Cancel invite
- `POST /api/users/invite/:inviteId/resend` — Resend invite
- `GET/PATCH /api/users/profile` — Personal profile
- `GET /api/invites/:token` — View invite details (public)
- `POST /api/invites/:token/accept` — Accept invite (public)
- `GET /api/audit-log` — Audit trail with filters (Admin+)
- `GET /api/billing` — Billing & subscription info (Owner only)

## Auth & Permissions

### Mock Auth (Dev Mode)
- `useMockAuth()` hook exposes `role`, `tier`, `canAccessFeature()`, `hasPermission()`, `isAtLeastRole()`
- `RoleTierSwitcher` dev overlay in bottom-right corner for testing role/tier combos
- Mock auth starts signed out; click "Sign In" to authenticate
- Mock auth state persists in sessionStorage (survives page navigations)
- `/login` page with two tabs: "Sign In" (email/password) and "Demo Access" (token-based)
- Demo tokens: SERVICEOS-FREE, SERVICEOS-INDIE, SERVICEOS-PRO, SERVICEOS-FRANCHISE, SERVICEOS-ENTERPRISE
- After token activation, shows 2 accounts: Admin (owner) + Operator (field tech) for that tier
- Users can enter a token directly or request one by selecting a tier
- DEMO_PROFILES exported from mock-auth.tsx

### Permission Matrix
- `canAccess(feature, tier)` — Feature flag check against tier hierarchy
- `hasPermission(role, permission)` — Role-based permission check
- `isAtLeastRole(userRole, requiredRole)` — Role level comparison
- `ProtectedRoute` component wraps routes with role + tier guards
- `UpgradeCard` shown when tier is insufficient

### Feature Flags by Tier
- **Independent+**: gps_tracking, manual_sms, referral_network, basic_financials
- **Pro+**: ai_sms_workflow, full_analytics, tech_support_limited
- **Franchise+**: landing_pages, multi_location, tech_support_priority, custom_api_access

## Pages Built (All 12 Steps Complete)

1. `/` — Public landing page (hero, features grid, pricing, trust bar, CTA)
2. `/demo` — Demo request (phone, date/time, 8 industries, 5 team sizes) + confirmation (slots, recorded demo, private demo)
3. `/dashboard` — Role-differentiated (owner: 4 KPIs + jobs + activity; operator: 2 KPIs + my jobs); upgrade prompts for locked features
4. `/leads` — Pipeline kanban (5 stages) + table view, lead detail panel, convert-to-customer flow
5. `/customers` — Customer database with search, detail panel, ratings
6. `/jobs` — Job list with status filters, create job modal (description, address, city, revenue, end time), job detail slide-out with status lifecycle buttons (Start → Complete), issue reporting
7. `/dispatch` — 4 view modes (board/day/week/list), date navigation, status transitions
8. `/sms` — SMS hub with conversation list, AI compose toggle, message history
9. `/financials` — Revenue cards, invoice table with filters, invoice detail panel with Mark as Sent/Paid
10. `/reviews` — Review dashboard with rating stats, positive/negative filters, star display
11. `/referrals` — Network/marketplace/tracking tabs, referral group management
12. `/analytics` — 6 metric cards, revenue bar chart, completion donut, top services, lead funnel
13. `/gps` — Live GPS map placeholder with mock crew pins, crew status sidebar
14. `/settings/demo-scheduler` — Demo admin (Owner only): available days, time blocks, limits, blocked dates, host management, email toggles, upcoming demos
15. `/settings/landing-pages` — Landing page builder (Franchise+)
16. `/settings/locations` — Multi-location management with operator cap enforcement
17. `/settings/api-keys` — API key management (Franchise+)
18. `/login` — Demo profile picker (6 cards, signInAs flow)
19. `/settings/profile` — Personal profile editor (name, email, phone, bio, avatar, password)
20. `/settings/company` — Company profile + branding + regional settings + notification prefs (Admin+)
21. `/settings/users` — Team directory + invite modal + pending invites table (Admin+)
22. `/settings/billing` — Current plan, upgrade/downgrade, payment method, invoice history (Owner only)
23. `/settings/audit` — Audit log table with search/action filters, 90-day retention (Admin+)

## Third-Party Integrations

To fully activate features, set these environment variables:
- `OPENAI_API_KEY` — AI SMS composition (Pro+ tier)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — SMS sending
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — Subscriptions
- `GOOGLE_MAPS_API_KEY` — GPS tracking map
- `RESEND_API_KEY`, `RESEND_SENDER_EMAIL` — Email delivery
- `VITE_DEMO_VIDEO_URL` — Recorded demo video link
- `VITE_DEMO_CALENDAR_URL` — External calendar link

## Development

```bash
# Push DB schema
pnpm --filter @workspace/db run push

# Run codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/service-os run dev
```
