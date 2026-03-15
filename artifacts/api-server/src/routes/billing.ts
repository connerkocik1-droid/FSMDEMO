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
  independent: { monthly: 79, annual: 708, name: "Independent" },
  pro: { monthly: 199, annual: 1788, name: "Pro" },
  franchise: { monthly: 449, annual: 3948, name: "Franchise" },
  enterprise: { monthly: 0, annual: 0, name: "Enterprise" },
};

const TIER_MAX_USERS: Record<string, number> = {
  free: 3,
  independent: 6,
  pro: 25,
  franchise: 75,
  enterprise: 999,
};

const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  independent_monthly: process.env.STRIPE_PRICE_INDEPENDENT_MONTHLY,
  independent_annual: process.env.STRIPE_PRICE_INDEPENDENT_ANNUAL,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  franchise_monthly: process.env.STRIPE_PRICE_FRANCHISE_MONTHLY,
  franchise_annual: process.env.STRIPE_PRICE_FRANCHISE_ANNUAL,
};

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return null;

  try {
    const Stripe = require("stripe");
    return new Stripe(stripeKey);
  } catch {
    return null;
  }
}

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

router.post("/create-subscription", async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }

    const { tier, billing } = req.body;

    if (!tier || !billing) {
      return res.status(400).json({ error: "bad_request", message: "tier and billing are required" });
    }

    if (!["independent", "pro", "franchise"].includes(tier)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid tier" });
    }

    if (!["monthly", "annual"].includes(billing)) {
      return res.status(400).json({ error: "bad_request", message: "Invalid billing period" });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: "stripe_not_configured",
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY.",
      });
    }

    const priceId = STRIPE_PRICE_IDS[`${tier}_${billing}`];
    if (!priceId) {
      return res.status(503).json({
        error: "price_not_configured",
        message: `Price ID for ${tier} ${billing} is not configured.`,
      });
    }

    const [company] = await db.select().from(companiesTable)
      .where(eq(companiesTable.id, req.companyId)).limit(1);

    if (!company) {
      return res.status(404).json({ error: "not_found" });
    }

    let customerId = company.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: company.email || undefined,
        name: company.name,
        metadata: { companyId: String(company.id) },
      });
      customerId = customer.id;

      await db.update(companiesTable)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(companiesTable.id, company.id));
    }

    const couponId = process.env.STRIPE_COUPON_FIRST30 || "FIRST30";

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      discounts: [{ coupon: couponId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        companyId: String(company.id),
        tier,
        billing,
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    await db.update(companiesTable)
      .set({
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, company.id));

    if (subscription.status === "active") {
      await db.update(companiesTable)
        .set({
          tier,
          maxUsers: TIER_MAX_USERS[tier] || 3,
          updatedAt: new Date(),
        })
        .where(eq(companiesTable.id, company.id));
    }

    return res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret || null,
      status: subscription.status,
    });
  } catch (err: any) {
    console.error("Stripe subscription error:", err);
    return res.status(500).json({
      error: "subscription_failed",
      message: err.message || "Failed to create subscription",
    });
  }
});

export default router;
