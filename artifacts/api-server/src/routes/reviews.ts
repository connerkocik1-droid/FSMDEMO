import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, customersTable, jobsTable, companiesTable } from "@workspace/db/schema";
import { eq, and, count, desc, avg } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/token/:token", async (req, res) => {
  try {
    const reviews = await db.select({
      id: reviewsTable.id,
      companyId: reviewsTable.companyId,
      rating: reviewsTable.rating,
      status: reviewsTable.status,
      jobId: reviewsTable.jobId,
    }).from(reviewsTable)
      .where(eq(reviewsTable.reviewToken, req.params.token))
      .limit(1);

    if (reviews.length === 0) {
      return res.status(404).json({ error: "not_found", message: "Review link not found or expired" });
    }

    const review = reviews[0];

    if (review.status !== "pending") {
      return res.json({ alreadySubmitted: true, message: "This review has already been submitted. Thank you!" });
    }

    let companyName = "";
    if (review.companyId) {
      const companies = await db.select({ name: companiesTable.name }).from(companiesTable)
        .where(eq(companiesTable.id, review.companyId)).limit(1);
      companyName = companies[0]?.name || "";
    }

    return res.json({
      reviewId: review.id,
      companyName,
      jobId: review.jobId,
      alreadySubmitted: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/token/:token", async (req, res) => {
  try {
    const { rating, comment, testimonial } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "validation_error", message: "Rating must be between 1 and 5" });
    }

    const reviews = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.reviewToken, req.params.token))
      .limit(1);

    if (reviews.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    const review = reviews[0];
    if (review.status !== "pending") {
      return res.status(400).json({ error: "already_submitted" });
    }

    const isPositive = rating >= 4;

    const [updated] = await db.update(reviewsTable)
      .set({
        rating,
        comment: comment || null,
        testimonial: isPositive ? (testimonial || comment || null) : null,
        isPublic: isPositive,
        status: "submitted",
        reviewSource: "sms",
      })
      .where(eq(reviewsTable.id, review.id))
      .returning();

    return res.json({
      success: true,
      isPositive,
      message: isPositive
        ? "Thank you for your wonderful review! Would you mind sharing it publicly?"
        : "Thank you for your feedback. We'll use it to improve our service.",
      review: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const reviews = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.companyId, req.companyId!))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(reviewsTable).where(eq(reviewsTable.companyId, req.companyId!));
    const [{ avgRating }] = await db.select({ avgRating: avg(reviewsTable.rating) }).from(reviewsTable).where(and(eq(reviewsTable.companyId, req.companyId!), eq(reviewsTable.status, "submitted")));

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

router.post("/", requireAuth, async (req: AuthRequest, res) => {
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
