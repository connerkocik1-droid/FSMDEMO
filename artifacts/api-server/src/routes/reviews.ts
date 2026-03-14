import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db/schema";
import { eq, and, count, desc, avg } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reviews = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.companyId, req.companyId!))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(reviewsTable).where(eq(reviewsTable.companyId, req.companyId!));
    const [{ avgRating }] = await db.select({ avgRating: avg(reviewsTable.rating) }).from(reviewsTable).where(eq(reviewsTable.companyId, req.companyId!));

    return res.json({
      reviews,
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
      averageRating: Number(avgRating) || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [review] = await db.insert(reviewsTable).values({
      ...req.body,
      companyId: req.companyId!,
    }).returning();
    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
