import { Router } from "express";
import { db } from "@workspace/db";
import { locationsTable, companiesTable, usersTable } from "@workspace/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAuth, requireRole, requireFeature, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);
router.use(requireFeature("multi_location"));

router.get("/", async (req: AuthRequest, res) => {
  try {
    const locations = await db.select().from(locationsTable)
      .where(eq(locationsTable.companyId, req.companyId!));

    const [{ value: operatorCount }] = await db.select({ value: count() })
      .from(usersTable)
      .where(and(eq(usersTable.companyId, req.companyId!), eq(usersTable.role, "operator")));

    const companies = await db.select({ maxUsers: companiesTable.maxUsers, tier: companiesTable.tier })
      .from(companiesTable)
      .where(eq(companiesTable.id, req.companyId!))
      .limit(1);

    const maxUsers = companies[0]?.maxUsers || 75;
    const warningThreshold = Math.floor(maxUsers * 0.93);

    return res.json({
      locations,
      operatorCount: Number(operatorCount),
      maxOperators: maxUsers,
      atCapWarning: Number(operatorCount) >= warningThreshold,
      atCapBlock: Number(operatorCount) >= maxUsers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const { name, address, adminUserId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "validation_error", message: "Location name is required" });
    }

    const [{ value: operatorCount }] = await db.select({ value: count() })
      .from(usersTable)
      .where(and(eq(usersTable.companyId, req.companyId!), eq(usersTable.role, "operator")));

    const companies = await db.select({ maxUsers: companiesTable.maxUsers })
      .from(companiesTable)
      .where(eq(companiesTable.id, req.companyId!))
      .limit(1);

    const maxUsers = companies[0]?.maxUsers || 75;

    if (Number(operatorCount) >= maxUsers) {
      return res.status(403).json({
        error: "operator_cap_reached",
        message: `Your plan supports up to ${maxUsers} operators. Contact sales for Enterprise pricing.`,
        currentCount: Number(operatorCount),
        maxUsers,
      });
    }

    const [location] = await db.insert(locationsTable).values({
      companyId: req.companyId!,
      name,
      address: address || null,
      adminUserId: adminUserId || null,
    }).returning();

    return res.status(201).json(location);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/:locationId", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    const { name, address, adminUserId, isActive } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (adminUserId !== undefined) updateData.adminUserId = adminUserId;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [location] = await db.update(locationsTable)
      .set(updateData)
      .where(and(eq(locationsTable.id, Number(req.params.locationId)), eq(locationsTable.companyId, req.companyId!)))
      .returning();

    if (!location) return res.status(404).json({ error: "not_found" });
    return res.json(location);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:locationId", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const [location] = await db.update(locationsTable)
      .set({ isActive: false })
      .where(and(eq(locationsTable.id, Number(req.params.locationId)), eq(locationsTable.companyId, req.companyId!)))
      .returning();

    if (!location) return res.status(404).json({ error: "not_found" });
    return res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
