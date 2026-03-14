import { Router } from "express";
import { db } from "@workspace/db";
import { referralsTable, referralGroupsTable } from "@workspace/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const referrals = await db.select().from(referralsTable)
      .where(eq(referralsTable.companyId, req.companyId!))
      .orderBy(desc(referralsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(referralsTable).where(eq(referralsTable.companyId, req.companyId!));

    return res.json({ referrals, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [referral] = await db.insert(referralsTable).values({
      ...req.body,
      companyId: req.companyId!,
      referredByCompanyId: req.companyId!,
    }).returning();
    return res.status(201).json(referral);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/groups", async (req: AuthRequest, res) => {
  try {
    const groups = await db.select().from(referralGroupsTable).orderBy(desc(referralGroupsTable.createdAt));
    return res.json(groups);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/groups", async (req: AuthRequest, res) => {
  try {
    const [group] = await db.insert(referralGroupsTable).values(req.body).returning();
    return res.status(201).json(group);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
