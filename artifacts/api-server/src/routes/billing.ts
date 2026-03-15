import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("owner"));

const TIER_PRICING: Record<string, { monthly: number; annual: number; name: string }> = {
  free: { monthly: 0, annual: 0, name: "Free" },
  independent: { monthly: 39, annual: 299, name: "Independent" },
  pro: { monthly: 99, annual: 899, name: "Pro" },
  franchise: { monthly: 349, annual: 3199, name: "Franchise" },
  enterprise: { monthly: 0, annual: 0, name: "Enterprise" },
};

router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }

    const [company] = await db.select().from(companiesTable)
      .where(eq(companiesTable.id, req.companyId)).limit(1);

    if (!company) {
      return res.status(404).json({ error: "not_found" });
    }

    const pricing = TIER_PRICING[company.tier] || TIER_PRICING.free;

    return res.json({
      tier: company.tier,
      tierName: pricing.name,
      monthlyPrice: pricing.monthly,
      annualPrice: pricing.annual,
      maxUsers: company.maxUsers,
      stripeCustomerId: company.stripeCustomerId,
      stripeSubscriptionId: company.stripeSubscriptionId,
      isActive: company.isActive,
      invoices: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
