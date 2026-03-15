# ServiceOS

## Overview

ServiceOS is a SaaS operations platform designed for field service businesses such as landscaping, roofing, HVAC, pest control, cleaning, and moving. It aims to streamline business operations through a comprehensive suite of tools. The project is built as a full-stack pnpm monorepo.

Key capabilities include:
- **CRM & Lead Management**: Tracking sales leads and managing customer databases.
- **Job Scheduling & Dispatch**: Efficiently scheduling, dispatching, and tracking field jobs.
- **Financials**: Handling invoicing and revenue tracking.
- **Communication**: Integrated SMS for customer interaction and team coordination.
- **Analytics & Reporting**: Providing insights into business performance.
- **GPS Tracking**: Live tracking of field crews.
- **Referral Network**: Facilitating business growth through referrals.
- **Multi-tenant Architecture**: Supporting various user roles and subscription tiers.
- **Marketing & SEO**: Integrated marketing pages, blog, and SEO infrastructure to drive customer acquisition.

The business vision is to become the leading operations platform for field service industries, offering a scalable solution from independent contractors to large franchises.

## User Preferences

I prefer to communicate in clear and concise language.
I value iterative development and prefer to be involved in key decision points.
Please ask for confirmation before implementing significant changes or new features.
I expect detailed explanations for complex technical decisions.

## System Architecture

ServiceOS is a full-stack pnpm monorepo.

### UI/UX Decisions
- **Frontend Framework**: React + Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui and Radix primitives for a modern, accessible, and consistent user experience.
- **Design Approach**: The application features a clean, responsive design with role-differentiated dashboards and navigation. Marketing pages are distinct from the application's authenticated sections.
- **Branding**: The primary brand color is `#185FA5` blue.

### Subscription Tiers (3-tier model)
- **Free** ($0/mo): 10 users hard cap, core operations only
- **Pro** ($59/mo · $49/mo annual): 25 users included, +$1.99/mo per extra active user; AI automation, full analytics, add-ons available
- **Enterprise** ($129/mo · $108/mo annual): 50 users/location, 3 locations included, +$1.29/mo per extra active user; all add-ons included, dedicated support, SLA

User billing rules: inactive/paused/invited users are never billed. Seasonal pause supported on Pro+.

### Add-ons (Pro tier, included in Enterprise)
Standard: GPS Tracking ($14/mo), Landing Pages ($14/mo per page), SMS Campaigns ($14/mo), Live Chat ($19/mo), Background Checks ($9/check)
Enterprise unlocks: Multi-Location ($49/mo/location), Custom Reports ($19/mo), White Label ($49/mo), Onboarding Session ($59 one-time)

### Pricing & Checkout
- `/pricing` — 3-tier pricing page with billing toggle (monthly/annual), add-ons section, feature comparison table, FAQ
- `/settings/add-ons` — Manage active add-ons with live toggle cards; pay-per-use modal for background checks and onboarding
- `/checkout?tier=[tier]&billing=[monthly|annual]` — Stripe Elements checkout with FIRST30 coupon (50% off first invoice)
- Stripe env vars: STRIPE_PRICE_PRO_MONTHLY/ANNUAL, STRIPE_PRICE_ENTERPRISE_MONTHLY/ANNUAL, STRIPE_PRICE_ADDON_*, STRIPE_PRICE_USER_ADDON_PRO/ENT, STRIPE_PRICE_LOCATION_ADDON, STRIPE_COUPON_FIRST30

### Feature Gating
- `src/lib/permissions.ts` — 3-tier + addon permission system; `canAccess(feature, tier, addons?)`, `getUpgradeRequirement(feature)`, `ADDON_PRICES` registry
- `ProtectedRoute` — Smart tier/addon-aware upgrade prompts; `UpgradeCard` component for inline gating
- Mock auth profiles: free / pro / enterprise (independent and franchise removed)

### AI Pricing Wizard
- **Home page hero** — `PricingWizard` component replaces static CTA; 2-col layout (headline left, wizard right)
- **Flow** — 3 conversational steps: industry → team size → pain points (multi-select), then 1.5s processing + quote
- **AI** — `POST /api/wizard/quote` calls OpenAI GPT with system prompt from `artifacts/api-server/src/prompts/wizardPrompt.ts`; parses JSON response; upserts `wizard_leads` table; returns fallback on error
- **Quote card** — AI headline, tier badge, tier explanation, add-on toggles (live price updates), billing period toggle, competitor savings callout, 3 CTAs (subscribe/demo/free), optional email capture
- **Analytics** — GA4 events: `wizard_started`, `wizard_step_completed`, `wizard_quote_viewed`, `wizard_addon_toggled`, `wizard_cta_clicked`, `wizard_email_submitted`
- **Checkout deep link** — `/checkout?tier=pro&billing=monthly&addons=gps_tracking,sms_marketing` pre-fills order summary with add-ons and correct discounted total
- **DB** — `wizard_leads` table: session_id, industry, team_size, pain_points[], quote_json, selected_addons[], estimated_monthly, email, cta_clicked, completed
- **API routes** — `POST /api/wizard/quote`, `POST /api/wizard/lead`, `POST /api/wizard/cta-click` (all public, no auth)
- **OpenAI** — Uses Replit AI Integrations (no API key required); env vars `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` auto-provisioned

### Structure

### Technical Implementations
- **Monorepo Management**: pnpm workspaces manage the full-stack monorepo.
- **Backend Framework**: Express 5 for the API server.
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions.
- **API Definition**: OpenAPI specification used with Orval for client-side API codegen (React Query hooks and Zod schemas).
- **Authentication**: Mock authentication for development with `RoleTierSwitcher` for testing various user roles and subscription tiers. Production authentication will use Clerk.
- **State Management & Forms**: `react-hook-form` with Zod resolvers for robust form handling.
- **Animations**: `framer-motion` for fluid UI transitions.
- **Build System**: `esbuild` for efficient CJS bundle generation.
- **Email Service**: Resend integration (stubbed for development).

### Feature Specifications
- **User Roles**: Owner, Admin, Manager, Operator with granular permissions.
- **Subscription Tiers**: Free, Independent, Pro, Franchise, Enterprise, each unlocking specific features.
- **CRM**: Kanban and table views for leads, customer database, and lead-to-customer conversion.
- **Job Management**: Scheduling, dispatch board (multiple views), job detail panels, status lifecycle, issue reporting, and GPS check-ins.
- **SMS Hub**: Conversation list, AI compose functionality, message history.
- **Financials**: Revenue tracking, invoice management with status lifecycle.
- **Reviews**: Dashboard for managing customer ratings and testimonials.
- **Referrals**: Network management, marketplace, and tracking.
- **Analytics**: Comprehensive dashboards with various metric cards, charts, and lead funnel visualization. Includes an **Insights** page (`/analytics/insights`, gated to `full_analytics` feature + `admin+` role) with AI-style cards for revenue trends, overdue invoices, job counts, top services, lead conversion rate, and customer satisfaction.
- **Settings**: Extensive settings for company profile, branding, regional preferences, user management, billing, and audit logs. Franchise+ tiers include landing page builders, multi-location management, and API key management.
- **Marketing Site**: Dedicated marketing pages, blog, demo request flow, and robust SEO infrastructure including dynamic sitemaps, SEO components, and GA4 integration.
- **Demo Page (redesigned)**: `/demo` has two sections — Upcoming Live Demos (DB-backed group webinar sessions with free inline registration) and Video Demos by Tier (5 plan cards with YouTube/Vimeo embed support). Existing private demo form preserved as secondary "Prefer a private demo?" CTA at bottom. Dev-admin Scheduling page has management UI for live sessions and tier video URLs.
- **Employee Role Restrictions**: Sidebar fully filtered for operators (shows only Dashboard, My Jobs, Chat, My Earnings, My Profile). Operator Jobs view has Available/Upcoming/Past tabs with personal job counts, no Schedule Job/Board View/Live Tracking. Operator Financials shows personal My Earnings view. Route-level `minRole:"admin"` blocks GPS, Reviews, Referrals, Analytics, Dispatch. Chat and My Earnings are always visible to operators regardless of feature tier.

### System Design Choices
- **API Design**: RESTful API routes clearly structured by resource (`/api/leads`, `/api/jobs`, etc.).
- **Authorization**: A robust permission matrix (`canAccessFeature`, `hasPermission`, `isAtLeastRole`) governs access to features and functionality based on user role and subscription tier. `ProtectedRoute` components enforce these rules.
- **Data Schemas**: Zod for runtime validation of API requests and responses.
- **Database Schema**: 31 tables covering all entities from companies and users to jobs, invoices, leads, marketing content, live demo sessions, tier videos, live demo registrations, invoice templates, and invoice line items.
- **Invoice Manager**: Full invoice creation flow in the Billing settings tab. Two sections: (1) Invoice Template — logo URL, primary/accent color pickers, 3 invoice styles, business address, US state sales tax auto-lookup, payment terms, footer text; (2) Create an Invoice — customer selector, due date, line items with quantity/unit price, AI line item generation, tax calculation, Save as Draft / Send to Customer actions. AI generation uses OpenAI via Replit AI Integrations (no API key required).
- **OpenAI Integration**: Provisioned via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`). Server-side client at `lib/integrations-openai-ai-server`. Currently used for invoice AI line item suggestions (`/api/invoice-manager/ai-suggest-items`).
- **SEO**: Comprehensive SEO strategy including `react-helmet-async` for meta tags, JSON-LD schema helpers, sitemap generation, robots.txt, and GA4 integration.

## External Dependencies

- **OpenAI**: Used for AI SMS composition (requires `OPENAI_API_KEY`).
- **Twilio**: For SMS sending and receiving (requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`).
- **Stripe**: For subscription management and billing (requires `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`).
- **Google Maps Platform**: For GPS tracking maps (requires `GOOGLE_MAPS_API_KEY`).
- **Resend**: For email delivery (requires `RESEND_API_KEY`, `RESEND_SENDER_EMAIL`).
- **Google Analytics 4 (GA4)**: For tracking user behavior and marketing effectiveness (requires `VITE_GA4_MEASUREMENT_ID`).
- **Cloudinary**: For image optimization and transformation (`cloudinaryWebP` utility).
- **External Calendar/Video**: Placeholder for demo video and external calendar links (`VITE_DEMO_VIDEO_URL`, `VITE_DEMO_CALENDAR_URL`).