import { Router } from "express";
import { db } from "@workspace/db";
import { userInvitesTable, usersTable, companiesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const [invite] = await db.select({
      id: userInvitesTable.id,
      email: userInvitesTable.email,
      role: userInvitesTable.role,
      status: userInvitesTable.status,
      expiresAt: userInvitesTable.expiresAt,
      companyName: companiesTable.name,
      companyLogoUrl: companiesTable.logoUrl,
    })
    .from(userInvitesTable)
    .innerJoin(companiesTable, eq(userInvitesTable.companyId, companiesTable.id))
    .where(eq(userInvitesTable.token, token))
    .limit(1);

    if (!invite) {
      return res.status(404).json({ error: "not_found", message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res.status(410).json({ error: "expired", message: "This invite has already been used" });
    }

    if (new Date() > invite.expiresAt) {
      await db.update(userInvitesTable)
        .set({ status: "expired" })
        .where(eq(userInvitesTable.token, token));
      return res.status(410).json({ error: "expired", message: "This invite has expired" });
    }

    return res.json(invite);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:token/accept", async (req, res) => {
  try {
    const { token } = req.params;
    const { firstName, lastName } = req.body;

    const [invite] = await db.select().from(userInvitesTable)
      .where(and(
        eq(userInvitesTable.token, token),
        eq(userInvitesTable.status, "pending"),
      ))
      .limit(1);

    if (!invite) {
      return res.status(404).json({ error: "not_found", message: "Invite not found or already used" });
    }

    if (new Date() > invite.expiresAt) {
      await db.update(userInvitesTable)
        .set({ status: "expired" })
        .where(eq(userInvitesTable.id, invite.id));
      return res.status(410).json({ error: "expired", message: "This invite has expired" });
    }

    const clerkId = `invite_${invite.id}_${Date.now()}`;

    const [newUser] = await db.insert(usersTable).values({
      clerkId,
      email: invite.email,
      firstName: firstName || null,
      lastName: lastName || null,
      role: invite.role,
      companyId: invite.companyId,
      isActive: true,
      isOnboarded: false,
    }).returning();

    await db.update(userInvitesTable)
      .set({ status: "accepted" })
      .where(eq(userInvitesTable.id, invite.id));

    await logAudit({
      companyId: invite.companyId,
      userId: newUser.id,
      action: "invite_accepted",
      entityType: "user",
      entityId: newUser.id,
      metadata: { email: invite.email, role: invite.role },
    });

    return res.json({ user: newUser, message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
