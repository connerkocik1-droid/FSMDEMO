import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable } from "@workspace/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [eq(leadsTable.companyId, req.companyId!)];
    if (status) conditions.push(eq(leadsTable.status, status as string));

    const leads = await db.select().from(leadsTable)
      .where(and(...conditions))
      .orderBy(desc(leadsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(leadsTable).where(and(...conditions));

    return res.json({ leads, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [lead] = await db.insert(leadsTable).values({
      ...req.body,
      companyId: req.companyId!,
    }).returning();
    return res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:leadId", async (req: AuthRequest, res) => {
  try {
    const leads = await db.select().from(leadsTable)
      .where(and(eq(leadsTable.id, Number(req.params.leadId)), eq(leadsTable.companyId, req.companyId!)))
      .limit(1);
    if (leads.length === 0) return res.status(404).json({ error: "not_found" });
    return res.json(leads[0]);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/:leadId", async (req: AuthRequest, res) => {
  try {
    const [lead] = await db.update(leadsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(leadsTable.id, Number(req.params.leadId)), eq(leadsTable.companyId, req.companyId!)))
      .returning();
    if (!lead) return res.status(404).json({ error: "not_found" });
    return res.json(lead);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:leadId", async (req: AuthRequest, res) => {
  try {
    await db.delete(leadsTable)
      .where(and(eq(leadsTable.id, Number(req.params.leadId)), eq(leadsTable.companyId, req.companyId!)));
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
