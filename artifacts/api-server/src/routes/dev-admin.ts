import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { demoSlotsTable, demoHostsTable, demoBookingsTable, demoRequestsTable, demoAccessTokensTable, liveDemoSessionsTable, tierVideosTable } from "@workspace/db/schema";
import { eq, sql, count, desc } from "drizzle-orm";
import crypto from "crypto";

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

export default router;
