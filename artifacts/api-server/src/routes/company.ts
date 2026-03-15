import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, companySettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth.js";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.use(requireAuth);

router.get("/profile", async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, req.companyId)).limit(1);
    if (!company) return res.status(404).json({ error: "not_found" });
    return res.json(company);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/profile", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const { name, phone, email, address, city, state, zip, logoUrl, businessType } = req.body;
    const [updated] = await db.update(companiesTable)
      .set({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(businessType !== undefined && { businessType }),
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, req.companyId))
      .returning();

    await logAudit({
      companyId: req.companyId,
      userId: req.userId,
      action: "company_profile_updated",
      entityType: "company",
      entityId: req.companyId,
      metadata: req.body,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/settings", async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    let [settings] = await db.select().from(companySettingsTable)
      .where(eq(companySettingsTable.companyId, req.companyId)).limit(1);

    if (!settings) {
      [settings] = await db.insert(companySettingsTable)
        .values({ companyId: req.companyId })
        .returning();
    }

    return res.json(settings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/settings", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const { timezone, currency, dateFormat, brandColor, logoUrl, website, notificationPrefs } = req.body;

    let [existing] = await db.select().from(companySettingsTable)
      .where(eq(companySettingsTable.companyId, req.companyId)).limit(1);

    if (!existing) {
      [existing] = await db.insert(companySettingsTable)
        .values({ companyId: req.companyId })
        .returning();
    }

    const [updated] = await db.update(companySettingsTable)
      .set({
        ...(timezone !== undefined && { timezone }),
        ...(currency !== undefined && { currency }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(brandColor !== undefined && { brandColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(website !== undefined && { website }),
        ...(notificationPrefs !== undefined && { notificationPrefs }),
        updatedAt: new Date(),
      })
      .where(eq(companySettingsTable.companyId, req.companyId))
      .returning();

    await logAudit({
      companyId: req.companyId,
      userId: req.userId,
      action: "company_settings_updated",
      entityType: "company_settings",
      entityId: req.companyId,
      metadata: req.body,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
