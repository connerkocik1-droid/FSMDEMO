import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { demoSlotsTable, demoHostsTable, demoBookingsTable, demoRequestsTable, demoAccessTokensTable, liveDemoSessionsTable, tierVideosTable, jobsTable, invoicesTable, customersTable, leadsTable } from "@workspace/db/schema";
import { eq, sql, count, desc, sum, and } from "drizzle-orm";
import crypto from "crypto";

function getDemoCompanyId() {
  return parseInt(process.env.DEMO_COMPANY_ID || "1", 10);
}

const router = Router();

const TOKEN_EXPIRY = "24h";

function getJwtSecret(): string {
  const secret = process.env.DEV_ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("DEV_ADMIN_JWT_SECRET environment variable is required");
  }
  return secret;
}

export interface DevAdminRequest extends Request {
  devAdmin?: { email: string };
}

export function requireDevAdmin(req: DevAdminRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Dev admin authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { email: string; type: string };
    if (payload.type !== "dev-admin") {
      res.status(401).json({ error: "unauthorized", message: "Invalid token type" });
      return;
    }
    req.devAdmin = { email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }
}

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  const adminEmail = process.env.DEV_ADMIN_EMAIL;
  const adminPassword = process.env.DEV_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: "server_error", message: "Dev admin credentials not configured" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  try {
    const secret = getJwtSecret();
    const token = jwt.sign({ email, type: "dev-admin" }, secret, { expiresIn: TOKEN_EXPIRY });
    return res.json({ token, email, expiresIn: TOKEN_EXPIRY });
  } catch (err) {
    return res.status(500).json({ error: "server_error", message: "JWT secret not configured" });
  }
});

router.get("/verify", requireDevAdmin, (req: DevAdminRequest, res: Response) => {
  return res.json({ valid: true, email: req.devAdmin?.email });
});

async function getDemoConfig() {
  const configs = await db.select().from(demoSlotsTable).limit(1);
  if (configs.length === 0) {
    const [config] = await db.insert(demoSlotsTable).values({}).returning();
    return config;
  }
  return configs[0];
}

router.get("/demo/settings", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  try {
    const config = await getDemoConfig();
    const hosts = await db.select().from(demoHostsTable);

    const bookings = await db.select().from(demoBookingsTable)
      .orderBy(sql`${demoBookingsTable.createdAt} DESC`)
      .limit(20);

    const bookingRequests = [];
    for (const booking of bookings) {
      const requests = await db.select().from(demoRequestsTable)
        .where(eq(demoRequestsTable.id, booking.requestId))
        .limit(1);
      bookingRequests.push({
        ...booking,
        request: requests[0] || null,
      });
    }

    const totalRequests = await db.select({ count: count() }).from(demoRequestsTable);
    const confirmedRequests = await db.select({ count: count() }).from(demoRequestsTable).where(eq(demoRequestsTable.status, "confirmed"));

    return res.json({
      config,
      hosts,
      upcomingBookings: bookingRequests,
      stats: {
        totalRequests: totalRequests[0]?.count ?? 0,
        confirmedRequests: confirmedRequests[0]?.count ?? 0,
        confirmationRate: totalRequests[0]?.count ? Math.round(((confirmedRequests[0]?.count ?? 0) / (totalRequests[0]?.count as number)) * 100) : 0,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

interface DemoSettingsUpdate {
  availableDays?: string[];
  timeBlocks?: { start: string; end: string }[];
  maxPerDay?: number;
  bufferMin?: number;
  durationMin?: number;
  blockedDates?: { date: string; reason?: string }[];
  emailToggles?: Record<string, boolean>;
  assignmentMethod?: string;
}

router.patch("/demo/settings", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const body = req.body as DemoSettingsUpdate;
    const config = await getDemoConfig();

    const updateData: Partial<typeof demoSlotsTable.$inferInsert> & { updatedAt: Date } = { updatedAt: new Date() };
    if (body.availableDays !== undefined) updateData.availableDays = body.availableDays;
    if (body.timeBlocks !== undefined) updateData.timeBlocks = body.timeBlocks;
    if (body.maxPerDay !== undefined) updateData.maxPerDay = body.maxPerDay;
    if (body.bufferMin !== undefined) updateData.bufferMin = body.bufferMin;
    if (body.durationMin !== undefined) updateData.durationMin = body.durationMin;
    if (body.blockedDates !== undefined) updateData.blockedDates = body.blockedDates;
    if (body.emailToggles !== undefined) updateData.emailToggles = body.emailToggles;
    if (body.assignmentMethod !== undefined) updateData.assignmentMethod = body.assignmentMethod;

    const [updated] = await db.update(demoSlotsTable)
      .set(updateData)
      .where(eq(demoSlotsTable.id, config.id))
      .returning();

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/demo/tokens", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  try {
    const tokens = await db.select().from(demoAccessTokensTable)
      .orderBy(desc(demoAccessTokensTable.createdAt));

    return res.json({ tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/demo/tokens", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const { bookingId, demoCompanyId, expiresInDays } = req.body as {
      bookingId: number;
      demoCompanyId: number;
      expiresInDays?: number;
    };

    const token = `DEMO-${crypto.randomBytes(12).toString("hex").toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const [created] = await db.insert(demoAccessTokensTable).values({
      bookingId,
      token,
      demoCompanyId,
      expiresAt,
    }).returning();

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/demo/tokens/:tokenId/revoke", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const [revoked] = await db.update(demoAccessTokensTable)
      .set({ isRevoked: true })
      .where(eq(demoAccessTokensTable.id, tokenId))
      .returning();

    if (!revoked) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json(revoked);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/demo/accounts", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  try {
    const tokens = await db.select().from(demoAccessTokensTable)
      .orderBy(desc(demoAccessTokensTable.createdAt));

    const profiles = [
      { id: "free_owner", name: "Sam Rivera", email: "sam@samplelawn.com", tier: "free", role: "owner", token: "SERVICEOS-FREE", lastUsed: null, isActive: true },
      { id: "independent_owner", name: "Taylor Brooks", email: "taylor@brooksroofing.com", tier: "independent", role: "owner", token: "SERVICEOS-INDIE", lastUsed: null, isActive: true },
      { id: "pro_owner", name: "Jordan Lee", email: "jordan@leehvac.com", tier: "pro", role: "owner", token: "SERVICEOS-PRO", lastUsed: null, isActive: true },
      { id: "franchise_owner", name: "Casey Morgan", email: "casey@morganlawn.net", tier: "franchise", role: "owner", token: "SERVICEOS-FRANCHISE", lastUsed: null, isActive: true },
      { id: "enterprise_owner", name: "Alex Chen", email: "alex@chenservices.com", tier: "enterprise", role: "owner", token: "SERVICEOS-ENTERPRISE", lastUsed: null, isActive: true },
      { id: "field_tech", name: "Marcus Williams", email: "marcus@leehvac.com", tier: "pro", role: "operator", token: null, lastUsed: null, isActive: true },
    ];

    return res.json({ profiles, accessTokens: tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/demo/live-sessions", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  try {
    const sessions = await db.select().from(liveDemoSessionsTable)
      .orderBy(liveDemoSessionsTable.datetime);
    return res.json({ sessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/demo/live-sessions", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const { title, description, datetime, durationMin, externalMeetingLink, maxRegistrations } = req.body;
    const [session] = await db.insert(liveDemoSessionsTable).values({
      title,
      description,
      datetime: new Date(datetime),
      durationMin: durationMin || 45,
      externalMeetingLink,
      maxRegistrations,
    }).returning();
    return res.status(201).json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/demo/live-sessions/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, datetime, durationMin, externalMeetingLink, maxRegistrations } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (datetime !== undefined) updateData.datetime = new Date(datetime);
    if (durationMin !== undefined) updateData.durationMin = durationMin;
    if (externalMeetingLink !== undefined) updateData.externalMeetingLink = externalMeetingLink;
    if (maxRegistrations !== undefined) updateData.maxRegistrations = maxRegistrations;

    const [updated] = await db.update(liveDemoSessionsTable)
      .set(updateData)
      .where(eq(liveDemoSessionsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "not_found" });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/demo/live-sessions/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.delete(liveDemoSessionsTable).where(eq(liveDemoSessionsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/demo/tier-videos", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  try {
    const videos = await db.select().from(tierVideosTable).orderBy(tierVideosTable.tierName);
    return res.json({ videos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/demo/tier-videos/:tier", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  try {
    const { tier } = req.params;
    const { videoUrl, description } = req.body;

    const existing = await db.select().from(tierVideosTable).where(eq(tierVideosTable.tierName, tier)).limit(1);
    let result;
    if (existing.length > 0) {
      [result] = await db.update(tierVideosTable)
        .set({ videoUrl, description, updatedAt: new Date() })
        .where(eq(tierVideosTable.tierName, tier))
        .returning();
    } else {
      [result] = await db.insert(tierVideosTable)
        .values({ tierName: tier, videoUrl, description })
        .returning();
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/integrations", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const integrations = [
    { id: "resend", name: "Resend", category: "Email", status: process.env.RESEND_API_KEY ? "connected" : "not_configured", description: "Transactional email delivery" },
    { id: "cloudinary", name: "Cloudinary", category: "Media", status: process.env.CLOUDINARY_URL ? "connected" : "not_configured", description: "Image and video management" },
    { id: "stripe", name: "Stripe", category: "Payments", status: process.env.STRIPE_SECRET_KEY ? "connected" : "not_configured", description: "Payment processing" },
    { id: "twilio", name: "Twilio", category: "SMS", status: process.env.TWILIO_AUTH_TOKEN ? "connected" : "not_configured", description: "SMS and voice communications" },
    { id: "google_maps", name: "Google Maps", category: "Location", status: process.env.GOOGLE_MAPS_API_KEY ? "connected" : "not_configured", description: "Geocoding and mapping" },
    { id: "openai", name: "OpenAI", category: "AI", status: process.env.OPENAI_API_KEY ? "connected" : "not_configured", description: "AI-powered features" },
  ];

  return res.json({
    integrations,
    usage: {
      apiCalls: { total: 12847, thisMonth: 3241, limit: 50000 },
      emailsSent: { total: 892, thisMonth: 156, limit: 10000 },
      smsSent: { total: 234, thisMonth: 45, limit: 5000 },
    },
  });
});

// ─── Demo Data Builder ────────────────────────────────────────────────────────

router.get("/demo-data/overview", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const [jobCount] = await db.select({ c: count() }).from(jobsTable).where(eq(jobsTable.companyId, cid));
  const [custCount] = await db.select({ c: count() }).from(customersTable).where(eq(customersTable.companyId, cid));
  const [leadCount] = await db.select({ c: count() }).from(leadsTable).where(eq(leadsTable.companyId, cid));
  const [invCount] = await db.select({ c: count() }).from(invoicesTable).where(eq(invoicesTable.companyId, cid));
  const [rev] = await db.select({ total: sum(invoicesTable.total) }).from(invoicesTable)
    .where(and(eq(invoicesTable.companyId, cid), eq(invoicesTable.status, "paid")));
  return res.json({
    jobs: Number(jobCount.c),
    customers: Number(custCount.c),
    leads: Number(leadCount.c),
    invoices: Number(invCount.c),
    totalRevenue: Number(rev.total || 0),
    demoCompanyId: cid,
  });
});

// ── Customers ──
router.get("/demo-data/customers", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const rows = await db.select().from(customersTable).where(eq(customersTable.companyId, cid)).orderBy(desc(customersTable.createdAt)).limit(100);
  return res.json({ customers: rows });
});

router.post("/demo-data/customers", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const { firstName, lastName, email, phone, city, state } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: "firstName and lastName required" });
  const [row] = await db.insert(customersTable).values({ companyId: cid, firstName, lastName, email: email || null, phone: phone || null, city: city || null, state: state || null }).returning();
  return res.status(201).json({ customer: row });
});

router.delete("/demo-data/customers/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  await db.delete(customersTable).where(and(eq(customersTable.id, Number(req.params.id)), eq(customersTable.companyId, cid)));
  return res.json({ ok: true });
});

// ── Jobs ──
router.get("/demo-data/jobs", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const rows = await db.select().from(jobsTable).where(eq(jobsTable.companyId, cid)).orderBy(desc(jobsTable.createdAt)).limit(100);
  return res.json({ jobs: rows });
});

router.post("/demo-data/jobs", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const { title, serviceType, status, actualRevenue, customerId, scheduledStart } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  let custId = customerId ? Number(customerId) : null;
  if (!custId) {
    const existing = await db.select({ id: customersTable.id }).from(customersTable).where(eq(customersTable.companyId, cid)).limit(1);
    if (existing.length > 0) {
      custId = existing[0].id;
    } else {
      const [newCust] = await db.insert(customersTable).values({ companyId: cid, firstName: "Demo", lastName: "Customer" }).returning();
      custId = newCust.id;
    }
  }

  const [row] = await db.insert(jobsTable).values({
    companyId: cid,
    customerId: custId,
    title,
    serviceType: serviceType || null,
    status: status || "completed",
    actualRevenue: actualRevenue ? String(actualRevenue) : null,
    estimatedRevenue: actualRevenue ? String(actualRevenue) : null,
    scheduledStart: scheduledStart ? new Date(scheduledStart) : new Date(),
  }).returning();
  return res.status(201).json({ job: row });
});

router.patch("/demo-data/jobs/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const { title, serviceType, status, actualRevenue } = req.body;
  const [row] = await db.update(jobsTable)
    .set({
      ...(title && { title }),
      ...(serviceType !== undefined && { serviceType }),
      ...(status && { status }),
      ...(actualRevenue !== undefined && { actualRevenue: String(actualRevenue), estimatedRevenue: String(actualRevenue) }),
      updatedAt: new Date(),
    })
    .where(and(eq(jobsTable.id, Number(req.params.id)), eq(jobsTable.companyId, cid)))
    .returning();
  return res.json({ job: row });
});

router.delete("/demo-data/jobs/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  await db.delete(jobsTable).where(and(eq(jobsTable.id, Number(req.params.id)), eq(jobsTable.companyId, cid)));
  return res.json({ ok: true });
});

// ── Invoices ──
router.get("/demo-data/invoices", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const rows = await db.select().from(invoicesTable).where(eq(invoicesTable.companyId, cid)).orderBy(desc(invoicesTable.createdAt)).limit(100);
  return res.json({ invoices: rows });
});

router.post("/demo-data/invoices", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const { total, status, customerId, dueDate } = req.body;
  if (!total) return res.status(400).json({ error: "total required" });

  let custId = customerId ? Number(customerId) : null;
  if (!custId) {
    const existing = await db.select({ id: customersTable.id }).from(customersTable).where(eq(customersTable.companyId, cid)).limit(1);
    if (existing.length > 0) {
      custId = existing[0].id;
    } else {
      const [newCust] = await db.insert(customersTable).values({ companyId: cid, firstName: "Demo", lastName: "Customer" }).returning();
      custId = newCust.id;
    }
  }

  const invNum = `INV-${Date.now().toString().slice(-6)}`;
  const amt = String(total);
  const [row] = await db.insert(invoicesTable).values({
    companyId: cid,
    customerId: custId,
    invoiceNumber: invNum,
    status: status || "paid",
    subtotal: amt,
    taxRate: "0",
    taxAmount: "0",
    total: amt,
    dueDate: dueDate || null,
    paidAt: (status === "paid" || !status) ? new Date() : null,
  }).returning();
  return res.status(201).json({ invoice: row });
});

router.delete("/demo-data/invoices/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  await db.delete(invoicesTable).where(and(eq(invoicesTable.id, Number(req.params.id)), eq(invoicesTable.companyId, cid)));
  return res.json({ ok: true });
});

// ── Leads ──
router.get("/demo-data/leads", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const rows = await db.select().from(leadsTable).where(eq(leadsTable.companyId, cid)).orderBy(desc(leadsTable.createdAt)).limit(100);
  return res.json({ leads: rows });
});

router.post("/demo-data/leads", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  const { firstName, lastName, email, phone, serviceInterest, status, source, estimatedValue } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: "firstName and lastName required" });
  const [row] = await db.insert(leadsTable).values({
    companyId: cid,
    firstName,
    lastName,
    email: email || null,
    phone: phone || null,
    serviceInterest: serviceInterest || null,
    status: status || "new",
    source: source || null,
    estimatedValue: estimatedValue ? String(estimatedValue) : null,
  }).returning();
  return res.status(201).json({ lead: row });
});

router.delete("/demo-data/leads/:id", requireDevAdmin, async (req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  await db.delete(leadsTable).where(and(eq(leadsTable.id, Number(req.params.id)), eq(leadsTable.companyId, cid)));
  return res.json({ ok: true });
});

// ── Seed Realistic Demo Data ──
router.post("/demo-data/seed", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();

  // Create customers
  const customerData = [
    { firstName: "James", lastName: "Mitchell", email: "james.mitchell@email.com", phone: "512-555-0101", city: "Austin", state: "TX" },
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@email.com", phone: "512-555-0102", city: "Austin", state: "TX" },
    { firstName: "Robert", lastName: "Torres", email: "r.torres@email.com", phone: "512-555-0103", city: "Round Rock", state: "TX" },
    { firstName: "Emily", lastName: "Johnson", email: "emily.j@email.com", phone: "512-555-0104", city: "Cedar Park", state: "TX" },
    { firstName: "David", lastName: "Williams", email: "dwilliams@email.com", phone: "512-555-0105", city: "Pflugerville", state: "TX" },
    { firstName: "Lisa", lastName: "Anderson", email: "lisa.a@email.com", phone: "512-555-0106", city: "Austin", state: "TX" },
    { firstName: "Michael", lastName: "Brown", email: "m.brown@email.com", phone: "512-555-0107", city: "Georgetown", state: "TX" },
    { firstName: "Jennifer", lastName: "Davis", email: "jen.davis@email.com", phone: "512-555-0108", city: "Austin", state: "TX" },
  ];
  const insertedCustomers = await db.insert(customersTable).values(
    customerData.map(c => ({ ...c, companyId: cid }))
  ).returning();

  // Create jobs (past 6 months)
  const serviceTypes = ["HVAC Repair", "AC Installation", "Furnace Service", "Duct Cleaning", "Heat Pump Install", "Maintenance"];
  const now = new Date();
  const jobEntries = [];
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const jobsThisMonth = 40 + Math.floor(Math.random() * 16); // 40-55 jobs/month
    for (let j = 0; j < jobsThisMonth; j++) {
      const day = 1 + Math.floor(Math.random() * 27);
      const jobDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const revenue = 150 + Math.floor(Math.random() * 501); // $150–$650
      const cust = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
      jobEntries.push({
        companyId: cid,
        customerId: cust.id,
        title: `${serviceTypes[Math.floor(Math.random() * serviceTypes.length)]} — ${cust.firstName} ${cust.lastName}`,
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        status: "completed" as const,
        actualRevenue: String(revenue),
        estimatedRevenue: String(revenue),
        scheduledStart: jobDate,
        createdAt: jobDate,
        updatedAt: jobDate,
      });
    }
  }
  const insertedJobs = await db.insert(jobsTable).values(jobEntries).returning();

  // Create paid invoices linked to jobs
  const invoiceEntries = insertedJobs.map((job, i) => ({
    companyId: cid,
    customerId: job.customerId,
    jobId: job.id,
    invoiceNumber: `INV-2026-${String(i + 1).padStart(3, "0")}`,
    status: "paid" as const,
    subtotal: job.actualRevenue || "0",
    taxRate: "8.25",
    taxAmount: String(Math.round(Number(job.actualRevenue || 0) * 0.0825)),
    total: String(Math.round(Number(job.actualRevenue || 0) * 1.0825)),
    paidAt: job.scheduledStart,
    createdAt: job.scheduledStart || new Date(),
    updatedAt: job.scheduledStart || new Date(),
  }));
  const insertedInvoices = await db.insert(invoicesTable).values(invoiceEntries).returning();

  // Create leads
  const leadData = [
    { firstName: "Alex", lastName: "Thompson", email: "alex.t@email.com", phone: "512-555-0201", serviceInterest: "AC Installation", status: "qualified", source: "website", estimatedValue: "2400" },
    { firstName: "Maria", lastName: "Garcia", email: "m.garcia@email.com", phone: "512-555-0202", serviceInterest: "HVAC Repair", status: "new", source: "referral", estimatedValue: "350" },
    { firstName: "Chris", lastName: "Lee", email: "chris.lee@email.com", phone: "512-555-0203", serviceInterest: "Duct Cleaning", status: "contacted", source: "google", estimatedValue: "450" },
    { firstName: "Amanda", lastName: "White", email: "a.white@email.com", phone: "512-555-0204", serviceInterest: "Heat Pump Install", status: "new", source: "facebook", estimatedValue: "3200" },
    { firstName: "Kevin", lastName: "Martinez", email: "k.martinez@email.com", phone: "512-555-0205", serviceInterest: "Furnace Service", status: "qualified", source: "yelp", estimatedValue: "800" },
    { firstName: "Rachel", lastName: "Wilson", email: "r.wilson@email.com", phone: "512-555-0206", serviceInterest: "Maintenance Plan", status: "proposal", source: "website", estimatedValue: "1200" },
  ];
  const insertedLeads = await db.insert(leadsTable).values(leadData.map(l => ({ ...l, companyId: cid }))).returning();

  return res.json({
    seeded: true,
    customers: insertedCustomers.length,
    jobs: insertedJobs.length,
    invoices: insertedInvoices.length,
    leads: insertedLeads.length,
  });
});

// ── Reset Demo Data ──
router.delete("/demo-data/reset", requireDevAdmin, async (_req: DevAdminRequest, res: Response) => {
  const cid = getDemoCompanyId();
  await db.delete(invoicesTable).where(eq(invoicesTable.companyId, cid));
  await db.delete(jobsTable).where(eq(jobsTable.companyId, cid));
  await db.delete(leadsTable).where(eq(leadsTable.companyId, cid));
  await db.delete(customersTable).where(eq(customersTable.companyId, cid));
  return res.json({ ok: true });
});

export default router;
