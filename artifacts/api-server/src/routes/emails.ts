import { Router } from "express";
import { db } from "@workspace/db";
import { emailLogTable } from "@workspace/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await db.select().from(emailLogTable)
      .orderBy(desc(emailLogTable.createdAt))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: count() }).from(emailLogTable);

    return res.json({ logs, total: total[0]?.count ?? 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
