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
- **Auth**: Clerk (mock auth for dev, replace with real Clerk keys)
- **Charts**: Recharts
- **Forms**: react-hook-form + zod resolvers
- **Animations**: framer-motion
- **Build**: esbuild (CJS bundle)

## User Roles

- **Owner**: Full control — all modules, billing, settings
- **Admin**: Jobs, CRM, scheduling (no billing/franchise settings)
- **Manager**: Crew supervision — dispatch, job updates, SMS
- **Operator**: SMS-only job interaction (limited mobile-friendly view)

## Subscription Tiers

- **Free**: 3 users, core ops only (no GPS, no SMS, no analytics)
- **Independent**: 3 users + GPS, manual SMS, referral network
- **Pro**: 25 users + AI SMS, full analytics, limited support
- **Franchise**: 75 operators + landing pages, multi-location, priority support, custom API (above 75 → custom pricing)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express 5 API server
│   │   └── src/
│   │       ├── middlewares/auth.ts   # Clerk auth middleware (x-clerk-user-id header)
│   │       └── routes/              # All API routes
│   └── service-os/         # React+Vite frontend (main app)
│       └── src/
│           ├── pages/               # Landing, Demo, Dashboard, Leads, Jobs, etc.
│           ├── components/layout/   # Sidebar, Header, DashboardLayout
│           └── lib/mock-auth.tsx    # Dev mock auth (replace with Clerk)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/     # All database tables
├── scripts/                # Utility scripts
└── package.json
```

## Database Schema Tables

- **companies** — Company accounts with tier info and Stripe IDs
- **users** — Users with Clerk ID, role, and company FK
- **leads** — Sales leads / CRM
- **customers** — Converted customers
- **jobs** — Job scheduling with GPS check-in support
- **invoices** — Invoice management
- **reviews** — Post-job ratings and reviews
- **referrals** — Referral network
- **referral_groups** — Referral group marketplace
- **referral_group_members** — Group membership
- **sms_events** — SMS workflow history
- **demo_requests** — Demo scheduling requests

## API Routes

All routes under `/api/*`:

- `GET/POST /api/auth/me` — User profile (auto-creates user on first access)
- `POST /api/auth/setup` — Onboarding wizard completion
- `GET/POST /api/leads` + CRUD
- `GET/POST /api/customers` + CRUD
- `GET/POST /api/jobs` + CRUD + `/checkin` + `/complete`
- `GET/POST /api/invoices` + CRUD
- `GET/POST /api/reviews`
- `GET/POST /api/sms/events`, `POST /api/sms/send`, `POST /api/sms/webhook`
- `GET/POST /api/referrals`
- `GET/POST /api/referral-groups`
- `GET/POST /api/demo`, `GET /api/demo/slots`
- `GET /api/analytics/overview|revenue|jobs`

## Auth Middleware

The API uses Clerk headers for auth in production:
- `x-clerk-user-id` — Clerk user ID
- `x-clerk-user-email` — Email
- `x-clerk-user-first-name` / `x-clerk-user-last-name`

Users are auto-created on first API call if not found in DB.

## Pages Built

1. `/` — Public landing page (hero, features, pricing, CTA)
2. `/demo` — Demo request form with slot selection, recorded demo option, private scheduling
3. `/dashboard` — Role-based dashboard with KPIs and job overview
4. `/leads` — Lead & CRM table with status filters
5. `/jobs` — Job scheduling board
6. `/dispatch` — Dispatch board (crew assignment view)
7. `/sms` — SMS workflow center with AI compose
8. `/financials` — Financial dashboard with revenue charts and invoices
9. Other pages (customers, reviews, referrals, analytics, settings, franchise) — stubbed as placeholders

## Third-Party Integrations Needed

To fully activate features, set these environment variables:
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk authentication
- `OPENAI_API_KEY` — AI SMS composition (Pro+ tier)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — SMS sending
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — Subscriptions
- `GOOGLE_MAPS_API_KEY` — GPS tracking

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
