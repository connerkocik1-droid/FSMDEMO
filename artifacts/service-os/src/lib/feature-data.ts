export interface FeatureDetail {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  headline: string;
  description: string;
  benefits: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const FEATURES: FeatureDetail[] = [
  {
    slug: "ai-dispatch",
    title: "AI Dispatch",
    seoTitle: "AI-Powered Dispatch Software for Field Service",
    seoDescription:
      "Automate job dispatch with AI. ServiceOS assigns the right tech, optimizes routes, and reduces drive time by up to 30%.",
    headline: "AI-Powered Dispatch That Thinks Ahead",
    description:
      "Stop manually assigning jobs. ServiceOS uses artificial intelligence to match the right technician to every job based on skills, location, and availability — automatically.",
    benefits: [
      { title: "Smart Matching", description: "AI considers technician skills, certifications, and proximity to assign the optimal crew for every job." },
      { title: "Route Optimization", description: "Reduce drive time by up to 30% with intelligent route planning that accounts for traffic and job duration." },
      { title: "Real-Time Adjustments", description: "When priorities shift, AI re-optimizes the schedule instantly — no manual reshuffling needed." },
      { title: "Capacity Planning", description: "Forecast workload and identify gaps before they impact your customers or your bottom line." },
    ],
    steps: [
      { title: "Jobs come in", description: "New jobs are created from leads, calls, or online bookings and enter the dispatch queue." },
      { title: "AI evaluates", description: "The AI engine scores every available technician based on skills, proximity, and current workload." },
      { title: "Auto-assign", description: "The best-fit tech gets assigned and receives a mobile notification with job details and directions." },
      { title: "Monitor & adjust", description: "Track progress in real-time and let the AI handle any last-minute changes automatically." },
    ],
    faqs: [
      { question: "How does AI dispatch work in ServiceOS?", answer: "Our AI engine evaluates technician skills, location, availability, and current workload to automatically assign the best-fit technician for every job in seconds." },
      { question: "Can I override AI dispatch assignments?", answer: "Absolutely. You always have full control. The AI provides recommendations, but dispatchers can drag-and-drop to reassign any job at any time." },
      { question: "Does AI dispatch reduce drive time?", answer: "Yes. Customers report up to 30% reduction in drive time thanks to intelligent route optimization that considers traffic patterns and job proximity." },
      { question: "What happens when a technician calls out sick?", answer: "The AI automatically re-optimizes the schedule, reassigning affected jobs to the next best available technicians while minimizing disruption." },
      { question: "Is AI dispatch available on all plans?", answer: "AI dispatch features are available on Pro, Franchise, and Enterprise plans. The Free and Independent plans include manual dispatch with drag-and-drop scheduling." },
    ],
  },
  {
    slug: "gps-tracking",
    title: "GPS Tracking",
    seoTitle: "Live GPS Tracking for Field Service Teams",
    seoDescription:
      "Track your field crews in real-time with ServiceOS GPS tracking. Provide accurate ETAs, optimize routes, and improve accountability.",
    headline: "Live GPS Tracking for Every Crew Member",
    description:
      "Know exactly where your field teams are at all times. ServiceOS GPS tracking gives you real-time visibility, accurate ETAs for customers, and proof of work completion.",
    benefits: [
      { title: "Real-Time Location", description: "See every technician on a live map with position updates every 30 seconds for complete field visibility." },
      { title: "Accurate Customer ETAs", description: "Provide customers with real-time arrival estimates based on actual technician location and route conditions." },
      { title: "Geofence Alerts", description: "Get automatic notifications when technicians arrive at or leave job sites for accurate time tracking." },
      { title: "Route History", description: "Review past routes and stops to verify work completion and optimize future scheduling decisions." },
    ],
    steps: [
      { title: "Enable tracking", description: "Technicians enable GPS sharing through the ServiceOS mobile app with a single tap." },
      { title: "Live map view", description: "Dispatchers see all active crew members on a real-time map with status indicators." },
      { title: "Customer updates", description: "Customers receive automatic ETA updates via SMS as their technician approaches." },
      { title: "Review & report", description: "Access route history and time-on-site reports for payroll and performance reviews." },
    ],
    faqs: [
      { question: "How accurate is GPS tracking in ServiceOS?", answer: "ServiceOS GPS tracking updates every 30 seconds and is accurate to within 10 meters using a combination of GPS, Wi-Fi, and cellular triangulation." },
      { question: "Do technicians need a special device for GPS tracking?", answer: "No special hardware needed. GPS tracking works through the ServiceOS mobile app on any modern iOS or Android smartphone." },
      { question: "Can customers see the technician's location?", answer: "Customers receive ETA updates via SMS. You can optionally enable a live tracking link that shows the technician's approach in real-time." },
      { question: "Does GPS tracking work offline?", answer: "The app caches location data when connectivity is limited and syncs automatically when the connection is restored." },
      { question: "Is GPS tracking available on all plans?", answer: "GPS tracking is available on Independent, Pro, Franchise, and Enterprise plans." },
    ],
  },
  {
    slug: "invoicing",
    title: "Invoicing",
    seoTitle: "Field Service Invoicing Software",
    seoDescription:
      "Create and send professional invoices from the field. ServiceOS invoicing automates billing, accepts payments, and tracks revenue.",
    headline: "Get Paid Faster with Automated Invoicing",
    description:
      "Create professional invoices in seconds, send them instantly via text or email, and accept payments on the spot. ServiceOS invoicing eliminates the billing bottleneck.",
    benefits: [
      { title: "One-Tap Invoicing", description: "Generate invoices directly from completed job details — no double data entry required." },
      { title: "Mobile Payments", description: "Accept credit card, ACH, and digital wallet payments in the field or via invoice link." },
      { title: "Automated Reminders", description: "Set up automatic payment reminders so you never have to chase unpaid invoices manually." },
      { title: "Financial Reports", description: "Track revenue, outstanding balances, and payment trends with real-time financial dashboards." },
    ],
    steps: [
      { title: "Complete the job", description: "Mark a job as complete in the field with notes, photos, and customer sign-off." },
      { title: "Generate invoice", description: "ServiceOS auto-populates the invoice with job details, line items, and pricing." },
      { title: "Send & collect", description: "Send the invoice via SMS or email. Customers can pay instantly through a secure link." },
      { title: "Track payments", description: "Monitor payment status, send reminders, and reconcile revenue from your dashboard." },
    ],
    faqs: [
      { question: "Can I customize invoice templates?", answer: "Yes. You can add your company logo, customize colors, add terms and conditions, and configure line item categories to match your business." },
      { question: "What payment methods does ServiceOS support?", answer: "ServiceOS supports credit cards, debit cards, ACH bank transfers, and digital wallets including Apple Pay and Google Pay." },
      { question: "Are automated payment reminders included?", answer: "Yes. You can configure automatic reminder schedules — for example, reminders at 3 days, 7 days, and 14 days past due." },
      { question: "Can I create recurring invoices?", answer: "Yes. Set up recurring invoices for maintenance contracts, subscription services, or regular service agreements with automatic billing." },
      { question: "Does invoicing integrate with accounting software?", answer: "ServiceOS integrates with QuickBooks and Xero for automatic invoice and payment synchronization." },
    ],
  },
  {
    slug: "scheduling",
    title: "Scheduling",
    seoTitle: "Field Service Scheduling Software",
    seoDescription:
      "Streamline field service scheduling with drag-and-drop tools, recurring jobs, and automated customer notifications from ServiceOS.",
    headline: "Effortless Scheduling That Keeps Everyone in Sync",
    description:
      "Drag-and-drop scheduling that your team will actually love. ServiceOS makes it easy to book, reschedule, and manage jobs while keeping customers automatically informed.",
    benefits: [
      { title: "Drag-and-Drop Calendar", description: "Visually manage your entire team's schedule with an intuitive calendar that updates in real-time." },
      { title: "Customer Self-Booking", description: "Let customers book available slots online, reducing phone calls and administrative overhead." },
      { title: "Recurring Jobs", description: "Set up weekly, bi-weekly, or monthly recurring jobs with automatic scheduling and reminders." },
      { title: "Conflict Detection", description: "Automatically detect double-bookings, travel time conflicts, and capacity issues before they happen." },
    ],
    steps: [
      { title: "Set availability", description: "Define working hours, service areas, and capacity limits for each team member." },
      { title: "Book jobs", description: "Schedule jobs via drag-and-drop, phone intake, or customer self-booking portal." },
      { title: "Auto-notify", description: "Customers and technicians receive automatic confirmations, reminders, and updates." },
      { title: "Adapt on the fly", description: "Reschedule with a quick drag-and-drop — all notifications update automatically." },
    ],
    faqs: [
      { question: "Can customers book appointments online?", answer: "Yes. ServiceOS provides an embeddable booking widget and hosted booking page where customers can see available slots and book directly." },
      { question: "How does conflict detection work?", answer: "The scheduling engine checks for overlapping appointments, insufficient travel time between jobs, and technician capacity limits before confirming any booking." },
      { question: "Can I set up recurring maintenance schedules?", answer: "Yes. Create recurring job templates with customizable frequency (weekly, bi-weekly, monthly, quarterly) that automatically generate and schedule new jobs." },
      { question: "Do customers get appointment reminders?", answer: "Yes. Automated SMS and email reminders are sent at configurable intervals — typically 24 hours and 1 hour before the appointment." },
      { question: "Can I manage multiple crews on one calendar?", answer: "Yes. The dispatch calendar shows all crew members side-by-side with color coding, making it easy to manage multiple teams from one view." },
    ],
  },
  {
    slug: "referrals",
    title: "Referral Network",
    seoTitle: "Referral Network for Service Businesses",
    seoDescription:
      "Grow your business through referrals. ServiceOS connects you with local service providers to exchange leads and earn commissions.",
    headline: "Grow Your Business Through Referrals",
    description:
      "Connect with other local service businesses to exchange leads, earn referral commissions, and grow your revenue without spending more on advertising.",
    benefits: [
      { title: "Lead Exchange", description: "Pass jobs outside your service area or expertise to trusted partners and receive referrals in return." },
      { title: "Automatic Commissions", description: "Referral fees are tracked and calculated automatically — no spreadsheets or manual bookkeeping." },
      { title: "Partner Directory", description: "Browse and connect with verified service businesses in your area across complementary trades." },
      { title: "Performance Tracking", description: "Monitor referral revenue, conversion rates, and your most valuable referral partnerships." },
    ],
    steps: [
      { title: "Join the network", description: "Create your company profile and specify your service areas, trades, and referral preferences." },
      { title: "Connect with partners", description: "Browse the partner directory and send connection requests to complementary businesses." },
      { title: "Exchange referrals", description: "Send and receive leads through the platform with full tracking and customer details." },
      { title: "Earn commissions", description: "Referral fees are calculated automatically and tracked in your financial dashboard." },
    ],
    faqs: [
      { question: "How does the referral network work?", answer: "ServiceOS connects you with other service businesses in your area. When you receive a job outside your scope, you can refer it to a partner and earn a commission when the job is completed." },
      { question: "How are referral commissions calculated?", answer: "Commission rates are set by each business. The standard is 10% of the referred job value, but you can negotiate custom rates with individual partners." },
      { question: "Can I control which businesses I partner with?", answer: "Yes. You choose who to connect with. All businesses in the network are verified, and you can review ratings and history before connecting." },
      { question: "Is the referral network available in my area?", answer: "The ServiceOS referral network is active in all US markets. The density of available partners varies by region and is growing rapidly." },
      { question: "What plans include the referral network?", answer: "The referral network is available on Independent, Pro, Franchise, and Enterprise plans." },
    ],
  },
  {
    slug: "crm",
    title: "CRM",
    seoTitle: "Field Service CRM Software",
    seoDescription:
      "Manage customer relationships from first contact to repeat business. ServiceOS CRM tracks every interaction, job, and communication.",
    headline: "A CRM Built for Field Service Businesses",
    description:
      "Track every customer interaction, job history, and communication in one place. ServiceOS CRM helps you turn one-time customers into lifelong accounts.",
    benefits: [
      { title: "Complete Customer Profiles", description: "See every job, invoice, message, and note for each customer in a unified timeline view." },
      { title: "Lead Management", description: "Track leads from first contact through conversion with customizable pipeline stages and follow-up reminders." },
      { title: "Communication History", description: "Every SMS, email, and phone call is logged automatically so your team always has full context." },
      { title: "Customer Segmentation", description: "Group customers by service type, location, value, or custom tags for targeted marketing and service." },
    ],
    steps: [
      { title: "Import contacts", description: "Import your existing customer database or start fresh — ServiceOS makes onboarding simple." },
      { title: "Track interactions", description: "Every job, call, text, and email is automatically logged to the customer's profile." },
      { title: "Manage pipelines", description: "Move leads through customizable stages with reminders and automated follow-ups." },
      { title: "Grow relationships", description: "Use customer insights to identify upsell opportunities and maintain long-term accounts." },
    ],
    faqs: [
      { question: "Can I import my existing customer data?", answer: "Yes. ServiceOS supports CSV import, and we also offer direct migration from popular field service platforms including Jobber, Housecall Pro, and ServiceTitan." },
      { question: "Does the CRM track communication history?", answer: "Yes. All SMS messages, emails, and logged phone calls are automatically attached to the customer's profile in chronological order." },
      { question: "Can I create custom fields for customers?", answer: "Yes. Add custom fields to capture industry-specific data like equipment types, property details, service preferences, and more." },
      { question: "Is there a mobile CRM app?", answer: "Yes. The ServiceOS mobile app gives technicians access to full customer profiles, job history, and notes while in the field." },
      { question: "How does lead management work?", answer: "Leads enter your pipeline from web forms, phone calls, or referrals. You can define custom stages, set follow-up reminders, and track conversion rates." },
    ],
  },
  {
    slug: "quotes",
    title: "Quotes & Estimates",
    seoTitle: "Field Service Quoting Software",
    seoDescription:
      "Create and send professional quotes from the field in seconds. ServiceOS quoting helps you win more jobs with faster, accurate estimates.",
    headline: "Win More Jobs with Professional Quotes",
    description:
      "Create accurate, professional quotes in the field and send them to customers instantly. ServiceOS quoting helps you respond faster and close more deals.",
    benefits: [
      { title: "Quick Quote Builder", description: "Build detailed quotes from your service catalog with pre-set pricing, labor rates, and materials." },
      { title: "Digital Signatures", description: "Customers can review, approve, and sign quotes from their phone — no printing or scanning needed." },
      { title: "Quote-to-Job Conversion", description: "Approved quotes automatically convert to scheduled jobs with all details carried over." },
      { title: "Template Library", description: "Save quote templates for common jobs to generate accurate estimates in seconds, not minutes." },
    ],
    steps: [
      { title: "Assess the job", description: "Visit the site or gather details over the phone to understand the scope of work." },
      { title: "Build the quote", description: "Use the quote builder with your service catalog to create an itemized estimate in minutes." },
      { title: "Send for approval", description: "Share the quote via SMS or email. Customers review and approve with a digital signature." },
      { title: "Convert to job", description: "Approved quotes automatically become scheduled jobs — no re-entry required." },
    ],
    faqs: [
      { question: "Can I create quotes from the field?", answer: "Yes. The ServiceOS mobile app includes the full quote builder so technicians can create and send professional estimates on-site." },
      { question: "Do quotes support digital signatures?", answer: "Yes. Customers receive a secure link where they can review the quote details and sign electronically from any device." },
      { question: "Can I set up a service catalog with preset pricing?", answer: "Yes. Build a service catalog with standard pricing, labor rates, and materials. Technicians select items to build quotes quickly and consistently." },
      { question: "What happens after a quote is approved?", answer: "Approved quotes automatically convert into jobs with all details, line items, and customer information carried over. You can schedule immediately." },
      { question: "Can I track quote conversion rates?", answer: "Yes. The analytics dashboard shows quote-to-job conversion rates, average quote value, and time-to-approval metrics." },
    ],
  },
];

export function getFeatureBySlug(slug: string): FeatureDetail | undefined {
  return FEATURES.find((f) => f.slug === slug);
}
