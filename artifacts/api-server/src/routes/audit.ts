import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("owner", "admin"));

router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;
    const userFilter = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const actionFilter = req.query.action as string | undefined;

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const conditions = [
      eq(auditLogTable.companyId, req.companyId),
      gte(auditLogTable.createdAt, ninetyDaysAgo),
    ];

    if (userFilter) {
      conditions.push(eq(auditLogTable.userId, userFilter));
    }
    if (actionFilter) {
      conditions.push(eq(auditLogTable.action, actionFilter));
    }

    const entries = await db.select({
      id: auditLogTable.id,
      action: auditLogTable.action,
      entityType: auditLogTable.entityType,
      entityId: auditLogTable.entityId,
      metadata: auditLogTable.metadata,
      createdAt: auditLogTable.createdAt,
      userId: auditLogTable.userId,
      userName: sql<string>`COALESCE(${usersTable.firstName} || ' ' || ${usersTable.lastName}, ${usersTable.email})`,
    })
    .from(auditLogTable)
    .leftJoin(usersTable, eq(auditLogTable.userId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(auditLogTable.createdAt))
    .limit(limit)
    .offset(offset);

    const [{ value: totalCount }] = await db.select({ value: sql<number>`count(*)` })
      .from(auditLogTable)
      .where(and(...conditions));

    return res.json({
      entries,
      pagination: {
        page,
        limit,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
