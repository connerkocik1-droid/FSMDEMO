import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, companiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: number;
  clerkId?: string;
  userRole?: string;
  companyId?: number;
  companyTier?: string;
  isDemoSession?: boolean;
}

type Tier = "free" | "independent" | "pro" | "franchise" | "enterprise";
type Feature =
  | "gps_tracking"
  | "manual_sms"
  | "referral_network"
  | "basic_financials"
  | "ai_sms_workflow"
  | "full_analytics"
  | "tech_support_limited"
  | "landing_pages"
  | "multi_location"
  | "tech_support_priority"
  | "custom_api_access";

const tierHierarchy: Record<string, number> = {
  free: 0,
  independent: 1,
  pro: 2,
  franchise: 3,
  enterprise: 4,
};

const featureMinTier: Record<Feature, Tier> = {
  gps_tracking: "independent",
  manual_sms: "independent",
  referral_network: "independent",
  basic_financials: "independent",
  ai_sms_workflow: "pro",
  full_analytics: "pro",
  tech_support_limited: "pro",
  landing_pages: "franchise",
  multi_location: "franchise",
  tech_support_priority: "franchise",
  custom_api_access: "franchise",
};

function canAccessFeature(feature: Feature, tier: string): boolean {
  const requiredLevel = tierHierarchy[featureMinTier[feature]] ?? 0;
  const userLevel = tierHierarchy[tier] ?? 0;
  return userLevel >= requiredLevel;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const clerkId = req.headers["x-clerk-user-id"] as string;
  
  if (!clerkId) {
    return res.status(401).json({ error: "unauthorized", message: "Authentication required" });
  }

  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    
    if (users.length === 0) {
      const email = req.headers["x-clerk-user-email"] as string || "";
      const firstName = req.headers["x-clerk-user-first-name"] as string;
      const lastName = req.headers["x-clerk-user-last-name"] as string;

      const [newUser] = await db.insert(usersTable).values({
        clerkId,
        email,
        firstName,
        lastName,
        role: "owner",
        isOnboarded: false,
      }).returning();

      req.userId = newUser.id;
      req.clerkId = clerkId;
      req.userRole = newUser.role;
      req.companyId = newUser.companyId ?? undefined;
    } else {
      const user = users[0];
      req.userId = user.id;
      req.clerkId = clerkId;
      req.userRole = user.role;
      req.companyId = user.companyId ?? undefined;

      if (user.companyId) {
        const companies = await db.select({ tier: companiesTable.tier }).from(companiesTable).where(eq(companiesTable.id, user.companyId)).limit(1);
        if (companies.length > 0) {
          req.companyTier = companies[0].tier;
        }
      }
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "server_error", message: "Authentication failed" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "forbidden", message: "Insufficient permissions" });
    }
    next();
  };
}

export function requireTier(...tiers: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }

    try {
      const companies = await db.select({ tier: companiesTable.tier }).from(companiesTable).where(eq(companiesTable.id, req.companyId)).limit(1);
      
      if (companies.length === 0 || !tiers.includes(companies[0].tier)) {
        return res.status(403).json({ error: "upgrade_required", message: "This feature requires a higher plan" });
      }
      
      req.companyTier = companies[0].tier;
      next();
    } catch (err) {
      return res.status(500).json({ error: "server_error" });
    }
  };
}

export function requireFeature(feature: Feature) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tier = req.companyTier;
    if (!tier) {
      if (!req.companyId) {
        return res.status(403).json({ error: "forbidden", message: "Company required" });
      }
      const companies = await db.select({ tier: companiesTable.tier }).from(companiesTable).where(eq(companiesTable.id, req.companyId)).limit(1);
      if (companies.length === 0) {
        return res.status(403).json({ error: "forbidden", message: "Company not found" });
      }
      req.companyTier = companies[0].tier;
    }

    if (!canAccessFeature(feature, req.companyTier!)) {
      return res.status(403).json({
        error: "upgrade_required",
        message: `This feature requires the ${featureMinTier[feature]} plan or higher`,
        requiredTier: featureMinTier[feature],
      });
    }
    next();
  };
}
