import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, customersTable, usersTable } from "@workspace/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: any[] = [eq(jobsTable.companyId, req.companyId!)];
    if (status) conditions.push(eq(jobsTable.status, status as string));

    const jobs = await db.select().from(jobsTable)
      .where(and(...conditions))
      .orderBy(desc(jobsTable.scheduledStart))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(jobsTable).where(and(...conditions));

    return res.json({ jobs, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [job] = await db.insert(jobsTable).values({
      ...req.body,
      companyId: req.companyId!,
      scheduledStart: req.body.scheduledStart ? new Date(req.body.scheduledStart) : undefined,
      scheduledEnd: req.body.scheduledEnd ? new Date(req.body.scheduledEnd) : undefined,
    }).returning();
    return res.status(201).json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:jobId", async (req: AuthRequest, res) => {
  try {
    const jobs = await db.select().from(jobsTable)
      .where(and(eq(jobsTable.id, Number(req.params.jobId)), eq(jobsTable.companyId, req.companyId!)))
      .limit(1);
    if (jobs.length === 0) return res.status(404).json({ error: "not_found" });
    return res.json(jobs[0]);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/:jobId", async (req: AuthRequest, res) => {
  try {
    const updateData: any = { ...req.body, updatedAt: new Date() };
    if (req.body.scheduledStart) updateData.scheduledStart = new Date(req.body.scheduledStart);
    if (req.body.scheduledEnd) updateData.scheduledEnd = new Date(req.body.scheduledEnd);

    const [job] = await db.update(jobsTable)
      .set(updateData)
      .where(and(eq(jobsTable.id, Number(req.params.jobId)), eq(jobsTable.companyId, req.companyId!)))
      .returning();
    if (!job) return res.status(404).json({ error: "not_found" });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:jobId", async (req: AuthRequest, res) => {
  try {
    await db.delete(jobsTable)
      .where(and(eq(jobsTable.id, Number(req.params.jobId)), eq(jobsTable.companyId, req.companyId!)));
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:jobId/checkin", async (req: AuthRequest, res) => {
  try {
    const { lat, lng } = req.body;
    const [job] = await db.update(jobsTable)
      .set({
        status: "in_progress",
        checkInLat: lat,
        checkInLng: lng,
        checkInTime: new Date(),
        actualStart: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(jobsTable.id, Number(req.params.jobId)), eq(jobsTable.companyId, req.companyId!)))
      .returning();
    if (!job) return res.status(404).json({ error: "not_found" });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:jobId/complete", async (req: AuthRequest, res) => {
  try {
    const { actualRevenue, notes } = req.body;
    const [job] = await db.update(jobsTable)
      .set({
        status: "completed",
        actualEnd: new Date(),
        actualRevenue: actualRevenue?.toString(),
        notes: notes || undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(jobsTable.id, Number(req.params.jobId)), eq(jobsTable.companyId, req.companyId!)))
      .returning();
    if (!job) return res.status(404).json({ error: "not_found" });

    // Update customer job count
    if (job.customerId) {
      await db.update(customersTable)
        .set({ totalJobsCount: 1, updatedAt: new Date() })
        .where(eq(customersTable.id, job.customerId));
    }

    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
