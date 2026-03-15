import { Router } from "express";
import { db } from "@workspace/db";
import { demoRequestsTable, demoSlotsTable, demoBookingsTable, demoHostsTable } from "@workspace/db/schema";
import { nanoid } from "nanoid";
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
    const { firstName, lastName, email, phone, companyName, businessType, teamSize, message, preferredSlot, wantsRecorded, wantsPrivate } = req.body;

    const confirmationCode = `DEMO-${nanoid(8).toUpperCase()}`;

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
      wantsRecorded: Boolean(wantsRecorded),
      wantsPrivate: Boolean(wantsPrivate),
      confirmationCode,
      status: "pending",
    }).returning();

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

    return res.status(201).json(booking);
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

export default router;
