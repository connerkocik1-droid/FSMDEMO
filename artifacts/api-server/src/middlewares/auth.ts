import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  userId?: number;
  clerkId?: string;
  userRole?: string;
  companyId?: number;
  companyTier?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const clerkId = req.headers["x-clerk-user-id"] as string;
  
  if (!clerkId) {
    return res.status(401).json({ error: "unauthorized", message: "Authentication required" });
  }

  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    
    if (users.length === 0) {
      // Auto-create user on first access
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
      const { companiesTable } = await import("@workspace/db/schema");
      const { eq } = await import("drizzle-orm");
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
