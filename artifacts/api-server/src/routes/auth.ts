import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, companiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

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

    const tierMaxUsers: Record<string, number> = {
      free: 3,
      independent: 6,
      pro: 25,
      franchise: 75,
      enterprise: 200,
    };
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
