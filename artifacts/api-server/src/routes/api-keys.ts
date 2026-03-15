import { Router } from "express";
import { db } from "@workspace/db";
import { apiKeysTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireRole, requireFeature, type AuthRequest } from "../middlewares/auth.js";
import crypto from "crypto";

const router = Router();

router.use(requireAuth);
router.use(requireFeature("custom_api_access"));

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `sos_${crypto.randomBytes(24).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.substring(0, 12);
  return { key, hash, prefix };
}

router.get("/", async (req: AuthRequest, res) => {
  try {
    const keys = await db.select({
      id: apiKeysTable.id,
      label: apiKeysTable.label,
      keyHash: apiKeysTable.keyHash,
      lastUsedAt: apiKeysTable.lastUsedAt,
      isActive: apiKeysTable.isActive,
      createdAt: apiKeysTable.createdAt,
    }).from(apiKeysTable)
      .where(eq(apiKeysTable.companyId, req.companyId!))
      .orderBy(desc(apiKeysTable.createdAt));

    const maskedKeys = keys.map(k => ({
      ...k,
      keyPreview: `sos_${"*".repeat(8)}...${k.keyHash.substring(0, 6)}`,
    }));

    return res.json({ keys: maskedKeys });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { label } = req.body;
    const { key, hash, prefix } = generateApiKey();

    const [apiKey] = await db.insert(apiKeysTable).values({
      companyId: req.companyId!,
      keyHash: hash,
      label: label || "API Key",
    }).returning();

    return res.status(201).json({
      ...apiKey,
      key,
      message: "Store this key securely. It will not be shown again.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:keyId", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const { label, isActive } = req.body;
    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [apiKey] = await db.update(apiKeysTable)
      .set(updateData)
      .where(and(eq(apiKeysTable.id, Number(req.params.keyId)), eq(apiKeysTable.companyId, req.companyId!)))
      .returning();

    if (!apiKey) return res.status(404).json({ error: "not_found" });
    return res.json(apiKey);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:keyId", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    const [apiKey] = await db.update(apiKeysTable)
      .set({ isActive: false })
      .where(and(eq(apiKeysTable.id, Number(req.params.keyId)), eq(apiKeysTable.companyId, req.companyId!)))
      .returning();

    if (!apiKey) return res.status(404).json({ error: "not_found" });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
