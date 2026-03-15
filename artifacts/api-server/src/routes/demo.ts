import { Router } from "express";
import { db } from "@workspace/db";
import { demoRequestsTable, demoSlotsTable, demoBookingsTable, demoHostsTable, demoAccessTokensTable, liveDemoSessionsTable, liveDemoRegistrationsTable, tierVideosTable } from "@workspace/db/schema";
import { nanoid } from "nanoid";
import { randomUUID } from "crypto";
import { eq, sql, and, gte, count } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";

const router = Router();

async function getDemoConfig() {
  const configs = await db.select().from(demoSlotsTable).limit(1);
  if (configs.length === 0) {
    const [config] = await db.insert(demoSlotsTable).values({}).returning();
    return config;
  }
  return configs[0];
}

async function getNextDemoSlots() {
  const config = await getDemoConfig();
  const availableDays = (config.availableDays as string[]) || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeBlocks = (config.timeBlocks as { start: string; end: string }[]) || [{ start: "09:00", end: "10:00" }];
  const blockedDates = (config.blockedDates as { date: string }[]) || [];
  const maxPerDay = config.maxPerDay || 3;

  const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const allowedDays = new Set(availableDays.map(d => dayMap[d]).filter(d => d !== undefined));
  const blockedSet = new Set(blockedDates.map(b => b.date));

  const slots: any[] = [];
  const now = new Date();
  let date = new Date(now);
  date.setDate(date.getDate() + 1);

  let attempts = 0;
  while (slots.length < 3 && attempts < 30) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split("T")[0];

    if (allowedDays.has(dayOfWeek) && !blockedSet.has(dateStr)) {
      const bookingsOnDate = await db.select({ count: count() })
        .from(demoBookingsTable)
        .where(eq(demoBookingsTable.slotDate, dateStr));
      const bookingCount = bookingsOnDate[0]?.count ?? 0;

      if (bookingCount < maxPerDay) {
        for (const block of timeBlocks) {
          if (slots.length >= 3) break;
          const [hour, min] = block.start.split(":").map(Number);
          const slotDate = new Date(date);
          slotDate.setHours(hour, min, 0, 0);

          const fillRate = bookingCount / maxPerDay;

          slots.push({
            id: `slot-${slotDate.toISOString()}`,
            datetime: slotDate.toISOString(),
            date: dateStr,
            time: block.start,
            label: slotDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + ` at ${block.start}`,
            available: true,
            availability: fillRate >= 0.6 ? "filling_up" : "open",
          });
        }
      }
    }
    date.setDate(date.getDate() + 1);
    attempts++;
  }

  return slots;
}

router.get("/slots", async (_req, res) => {
  try {
    const slots = await getNextDemoSlots();
    return res.json({
      slots,
      calendarLink: process.env.DEMO_CALENDAR_URL || "https://calendly.com/serviceos/demo",
      videoLink: process.env.DEMO_VIDEO_URL || "",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyName, businessType, teamSize, message, preferredSlot, interestedIn, wantsRecorded, wantsPrivate } = req.body;

    const confirmationCode = `DEMO-${nanoid(8).toUpperCase()}`;

    const tierLabel = interestedIn
      ? interestedIn.charAt(0).toUpperCase() + interestedIn.slice(1)
      : undefined;

    const [request] = await db.insert(demoRequestsTable).values({
      firstName,
      lastName,
      email,
      phone,
      companyName,
      businessType,
      teamSize,
      message,
      preferredSlot,
      interestedIn: interestedIn || null,
      wantsRecorded: Boolean(wantsRecorded),
      wantsPrivate: Boolean(wantsPrivate),
      confirmationCode,
      status: "pending",
    }).returning();

    const salesEmail = process.env.SALES_EMAIL;
    if (salesEmail) {
      console.log(
        `[DEMO NOTIFICATION] New demo request from ${firstName} ${lastName} (${email})` +
        (tierLabel ? ` — interested in ${tierLabel} plan` : "") +
        ` — Confirmation: ${confirmationCode}`
      );
    }

    return res.status(201).json({
      id: request.id,
      confirmationCode: request.confirmationCode,
      createdAt: request.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/book", async (req, res) => {
  try {
    const { requestId, slotDate, slotTime } = req.body;

    const [booking] = await db.insert(demoBookingsTable).values({
      requestId,
      slotDate,
      slotTime,
      status: "confirmed",
    }).returning();

    if (requestId) {
      await db.update(demoRequestsTable)
        .set({ status: "confirmed", scheduledSlot: `${slotDate} ${slotTime}` })
        .where(eq(demoRequestsTable.id, requestId));
    }

    const demoCompanyId = parseInt(process.env.DEMO_COMPANY_ID || "1", 10);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const [accessToken] = await db.insert(demoAccessTokensTable).values({
      bookingId: booking.id,
      token,
      demoCompanyId,
      expiresAt,
    }).returning();

    const baseUrl = process.env.APP_BASE_URL || "";
    const demoAccessLink = `${baseUrl}/demo-access/${token}`;

    return res.status(201).json({
      ...booking,
      demoAccessToken: token,
      demoAccessLink,
      demoAccessExpiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/access/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const tokens = await db.select().from(demoAccessTokensTable)
      .where(eq(demoAccessTokensTable.token, token))
      .limit(1);

    if (tokens.length === 0) {
      return res.status(404).json({ valid: false, reason: "invalid" });
    }

    const accessToken = tokens[0];

    if (accessToken.isRevoked) {
      return res.status(403).json({ valid: false, reason: "revoked" });
    }

    if (new Date() > accessToken.expiresAt) {
      return res.status(410).json({ valid: false, reason: "expired" });
    }

    await db.update(demoAccessTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(demoAccessTokensTable.id, accessToken.id));

    return res.json({
      valid: true,
      demoCompanyId: accessToken.demoCompanyId,
      bookingId: accessToken.bookingId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/settings", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const config = await getDemoConfig();
    const hosts = await db.select().from(demoHostsTable);

    const bookings = await db.select().from(demoBookingsTable)
      .orderBy(sql`${demoBookingsTable.createdAt} DESC`)
      .limit(10);

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

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

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

router.patch("/settings", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { availableDays, timeBlocks, maxPerDay, bufferMin, durationMin, blockedDates, emailToggles, assignmentMethod } = req.body;

    const config = await getDemoConfig();
    const updateData: any = { updatedAt: new Date() };
    if (availableDays !== undefined) updateData.availableDays = availableDays;
    if (timeBlocks !== undefined) updateData.timeBlocks = timeBlocks;
    if (maxPerDay !== undefined) updateData.maxPerDay = maxPerDay;
    if (bufferMin !== undefined) updateData.bufferMin = bufferMin;
    if (durationMin !== undefined) updateData.durationMin = durationMin;
    if (blockedDates !== undefined) updateData.blockedDates = blockedDates;
    if (emailToggles !== undefined) updateData.emailToggles = emailToggles;
    if (assignmentMethod !== undefined) updateData.assignmentMethod = assignmentMethod;

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

router.post("/hosts", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { name, email, isActive } = req.body;
    const [host] = await db.insert(demoHostsTable).values({ name, email, isActive: isActive !== false }).returning();
    return res.status(201).json(host);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/hosts/:hostId", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { hostId } = req.params;
    const { name, email, isActive } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db.update(demoHostsTable)
      .set(updateData)
      .where(eq(demoHostsTable.id, parseInt(hostId)))
      .returning();

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/access/:tokenId/revoke", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { tokenId } = req.params;

    const [updated] = await db.update(demoAccessTokensTable)
      .set({ isRevoked: true })
      .where(eq(demoAccessTokensTable.id, parseInt(tokenId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/access-tokens", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const tokens = await db.select().from(demoAccessTokensTable)
      .orderBy(sql`${demoAccessTokensTable.createdAt} DESC`)
      .limit(20);

    return res.json(tokens);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/live-sessions", async (_req, res) => {
  try {
    const sessions = await db.select().from(liveDemoSessionsTable)
      .where(gte(liveDemoSessionsTable.datetime, new Date()))
      .orderBy(liveDemoSessionsTable.datetime);

    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const regCount = await db.select({ count: count() })
          .from(liveDemoRegistrationsTable)
          .where(eq(liveDemoRegistrationsTable.sessionId, session.id));
        return { ...session, registrationCount: regCount[0]?.count ?? 0 };
      })
    );

    return res.json(sessionsWithCounts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/live-sessions", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { title, description, datetime, durationMin, externalMeetingLink, maxRegistrations } = req.body;
    const [session] = await db.insert(liveDemoSessionsTable).values({
      title,
      description,
      datetime: new Date(datetime),
      durationMin: durationMin || 45,
      externalMeetingLink,
      maxRegistrations: maxRegistrations || 50,
    }).returning();
    return res.status(201).json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/live-sessions/:id", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
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
      .where(eq(liveDemoSessionsTable.id, parseInt(id)))
      .returning();

    if (!updated) return res.status(404).json({ error: "not_found" });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/live-sessions/:id", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.delete(liveDemoRegistrationsTable).where(eq(liveDemoRegistrationsTable.sessionId, parseInt(id)));
    await db.delete(liveDemoSessionsTable).where(eq(liveDemoSessionsTable.id, parseInt(id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/live-sessions/:id/register", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    const sessions = await db.select().from(liveDemoSessionsTable)
      .where(eq(liveDemoSessionsTable.id, parseInt(id)))
      .limit(1);

    if (sessions.length === 0) return res.status(404).json({ error: "session_not_found" });

    const regCount = await db.select({ count: count() })
      .from(liveDemoRegistrationsTable)
      .where(eq(liveDemoRegistrationsTable.sessionId, parseInt(id)));

    if (sessions[0].maxRegistrations && (regCount[0]?.count ?? 0) >= sessions[0].maxRegistrations) {
      return res.status(409).json({ error: "session_full" });
    }

    const [registration] = await db.insert(liveDemoRegistrationsTable).values({
      sessionId: parseInt(id),
      firstName,
      lastName,
      email,
    }).returning();

    return res.status(201).json(registration);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/live-sessions/:id/registrations", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const registrations = await db.select().from(liveDemoRegistrationsTable)
      .where(eq(liveDemoRegistrationsTable.sessionId, parseInt(id)))
      .orderBy(sql`${liveDemoRegistrationsTable.createdAt} DESC`);
    return res.json(registrations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/tier-videos", async (_req, res) => {
  try {
    const videos = await db.select().from(tierVideosTable).orderBy(tierVideosTable.id);
    return res.json(videos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/tier-videos/:tierName", requireAuth, requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { tierName } = req.params;
    const { videoUrl, description } = req.body;

    const existing = await db.select().from(tierVideosTable)
      .where(eq(tierVideosTable.tierName, tierName))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(tierVideosTable)
        .set({ videoUrl, description, updatedAt: new Date() })
        .where(eq(tierVideosTable.tierName, tierName))
        .returning();
      return res.json(updated);
    } else {
      const [created] = await db.insert(tierVideosTable).values({
        tierName,
        videoUrl,
        description,
      }).returning();
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
