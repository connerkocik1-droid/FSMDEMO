import { Router } from "express";
import { db } from "@workspace/db";
import { blogSubscribersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email, source = "blog" } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "invalid_email" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: "invalid_email" });
    }

    const allowedSources = ["blog", "blog-list", "blog-post", "blog-banner"];
    const sanitizedSource = allowedSources.includes(source) ? source : "blog";

    const existing = await db.select().from(blogSubscribersTable)
      .where(eq(blogSubscribersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.json({ message: "already_subscribed" });
    }

    const [subscriber] = await db.insert(blogSubscribersTable).values({
      email: email.toLowerCase().trim(),
      source: sanitizedSource,
    }).returning();

    return res.status(201).json({ message: "subscribed", subscriber });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
