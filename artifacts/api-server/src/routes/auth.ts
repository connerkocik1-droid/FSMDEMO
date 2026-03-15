import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, companiesTable, companyAddonsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "serviceos-dev-jwt-secret-change-in-production";

const router = Router();

const tierMaxUsers: Record<string, number> = {
  free: 3,
  independent: 6,
  pro: 25,
  franchise: 75,
  enterprise: 200,
};

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName, businessType, tier, addons } = req.body;

    if (!firstName || !email || !password || !companyName || !businessType) {
      return res.status(400).json({ error: "missing_fields", message: "First name, email, password, company name, and business type are required." });
    }

    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "email_taken", message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const clerkId = `local_${randomUUID()}`;
    const selectedTier = tier || "free";

    const [company] = await db.insert(companiesTable).values({
      name: companyName,
      businessType,
      tier: selectedTier,
      maxUsers: tierMaxUsers[selectedTier] || 3,
      isActive: true,
    }).returning();

    const [user] = await db.insert(usersTable).values({
      clerkId,
      email,
      passwordHash,
      firstName,
      lastName,
      role: "owner",
      companyId: company.id,
      isOnboarded: true,
      isActive: true,
      status: "active",
    }).returning();

    if (addons && Array.isArray(addons) && addons.length > 0) {
      await db.insert(companyAddonsTable).values(
        addons.map((addonType: string) => ({
          companyId: company.id,
          addonType,
          isActive: true,
          quantity: 1,
        }))
      );
    }

    const addonRows = await db.select().from(companyAddonsTable).where(eq(companyAddonsTable.companyId, company.id));

    const token = jwt.sign({ userId: user.id, clerkId, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    return res.json({
      token,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        isOnboarded: user.isOnboarded,
      },
      company: {
        id: company.id,
        name: company.name,
        businessType: company.businessType,
        tier: company.tier,
        maxUsers: company.maxUsers,
      },
      addons: addonRows.map(a => ({ addonType: a.addonType, isActive: a.isActive })),
    });
  } catch (err: any) {
    if (err?.code === "23505" && err?.constraint?.includes("email")) {
      return res.status(409).json({ error: "email_taken", message: "An account with this email already exists." });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "server_error", message: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "missing_fields", message: "Email and password are required." });
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
    }

    const user = users[0];
    if (!user.passwordHash) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password." });
    }

    let company = null;
    let addons: { addonType: string; isActive: boolean }[] = [];

    if (user.companyId) {
      const companies = await db.select().from(companiesTable).where(eq(companiesTable.id, user.companyId)).limit(1);
      if (companies.length > 0) company = companies[0];

      const addonRows = await db.select().from(companyAddonsTable).where(eq(companyAddonsTable.companyId, user.companyId));
      addons = addonRows.map(a => ({ addonType: a.addonType, isActive: a.isActive }));
    }

    const token = jwt.sign({ userId: user.id, clerkId: user.clerkId, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    return res.json({
      token,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        isOnboarded: user.isOnboarded,
      },
      company: company ? {
        id: company.id,
        name: company.name,
        businessType: company.businessType,
        tier: company.tier,
        maxUsers: company.maxUsers,
      } : null,
      addons,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "server_error", message: "Login failed." });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) return res.status(404).json({ error: "not_found" });

    const user = users[0];
    let company = null;

    if (user.companyId) {
      const companies = await db.select().from(companiesTable).where(eq(companiesTable.id, user.companyId)).limit(1);
      if (companies.length > 0) company = companies[0];
    }

    return res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      companyId: user.companyId,
      company,
      isOnboarded: user.isOnboarded,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/setup", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { companyName, businessType, phone, address, city, state, zip, tier } = req.body;

    const selectedTier = tier || "free";

    const [company] = await db.insert(companiesTable).values({
      name: companyName,
      businessType,
      phone,
      address,
      city,
      state,
      zip,
      tier: selectedTier,
      maxUsers: tierMaxUsers[selectedTier] || 3,
      isActive: true,
    }).returning();

    const [updatedUser] = await db.update(usersTable)
      .set({ companyId: company.id, phone, isOnboarded: true, role: "owner", updatedAt: new Date() })
      .where(eq(usersTable.id, req.userId!))
      .returning();

    return res.json({
      id: updatedUser.id,
      clerkId: updatedUser.clerkId,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      phone: updatedUser.phone,
      companyId: updatedUser.companyId,
      company,
      isOnboarded: updatedUser.isOnboarded,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
