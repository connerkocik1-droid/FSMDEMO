import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, userProfilesTable, userInvitesTable } from "@workspace/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth.js";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }

    const users = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      role: usersTable.role,
      phone: usersTable.phone,
      isActive: usersTable.isActive,
      isOnboarded: usersTable.isOnboarded,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      avatarUrl: userProfilesTable.avatarUrl,
      displayName: userProfilesTable.displayName,
    })
    .from(usersTable)
    .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId))
    .where(eq(usersTable.companyId, req.companyId));

    const pendingInvites = await db.select()
      .from(userInvitesTable)
      .where(and(
        eq(userInvitesTable.companyId, req.companyId),
        eq(userInvitesTable.status, "pending"),
      ));

    return res.json({ users, pendingInvites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:id/role", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!["owner", "admin", "manager", "operator"].includes(role)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid role" });
    }

    if (userId === req.userId) {
      return res.status(400).json({ error: "validation_error", message: "Cannot change your own role" });
    }

    const [existing] = await db.select({ role: usersTable.role })
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.companyId, req.companyId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "not_found" });
    }

    const previousRole = existing.role;

    const [updated] = await db.update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(usersTable.id, userId), eq(usersTable.companyId, req.companyId)))
      .returning();

    await logAudit({
      companyId: req.companyId,
      userId: req.userId,
      action: "user_role_changed",
      entityType: "user",
      entityId: userId,
      metadata: { newRole: role, previousRole },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:id/deactivate", requireRole("owner"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const userId = parseInt(req.params.id);

    if (userId === req.userId) {
      return res.status(400).json({ error: "validation_error", message: "Cannot deactivate yourself" });
    }

    const { isActive } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ isActive: isActive ?? false, updatedAt: new Date() })
      .where(and(eq(usersTable.id, userId), eq(usersTable.companyId, req.companyId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "not_found" });
    }

    await logAudit({
      companyId: req.companyId,
      userId: req.userId,
      action: isActive ? "user_reactivated" : "user_deactivated",
      entityType: "user",
      entityId: userId,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/invite", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "validation_error", message: "Email is required" });
    }
    if (!["admin", "manager", "operator"].includes(role || "operator")) {
      return res.status(400).json({ error: "validation_error", message: "Invalid role" });
    }

    const existingUser = await db.select().from(usersTable)
      .where(and(eq(usersTable.email, email), eq(usersTable.companyId, req.companyId)))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "conflict", message: "User already exists in this company" });
    }

    const existingInvite = await db.select().from(userInvitesTable)
      .where(and(
        eq(userInvitesTable.email, email),
        eq(userInvitesTable.companyId, req.companyId),
        eq(userInvitesTable.status, "pending"),
      ))
      .limit(1);

    if (existingInvite.length > 0) {
      return res.status(409).json({ error: "conflict", message: "An invite is already pending for this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const [invite] = await db.insert(userInvitesTable).values({
      companyId: req.companyId,
      invitedBy: req.userId!,
      email,
      role: role || "operator",
      token,
      expiresAt,
    }).returning();

    await logAudit({
      companyId: req.companyId,
      userId: req.userId,
      action: "user_invited",
      entityType: "user_invite",
      entityId: invite.id,
      metadata: { email, role: role || "operator" },
    });

    return res.status(201).json({ invite, inviteLink: `/accept-invite/${token}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/invite/:inviteId", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const inviteId = parseInt(req.params.inviteId);

    const [deleted] = await db.update(userInvitesTable)
      .set({ status: "cancelled" })
      .where(and(
        eq(userInvitesTable.id, inviteId),
        eq(userInvitesTable.companyId, req.companyId),
        eq(userInvitesTable.status, "pending"),
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/invite/:inviteId/resend", requireRole("owner", "admin"), async (req: AuthRequest, res) => {
  try {
    if (!req.companyId) {
      return res.status(403).json({ error: "forbidden", message: "Company required" });
    }
    const inviteId = parseInt(req.params.inviteId);

    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const [updated] = await db.update(userInvitesTable)
      .set({ token: newToken, expiresAt: newExpiry })
      .where(and(
        eq(userInvitesTable.id, inviteId),
        eq(userInvitesTable.companyId, req.companyId),
        eq(userInvitesTable.status, "pending"),
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json({ invite: updated, inviteLink: `/accept-invite/${newToken}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/profile", async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId)).limit(1);
    let [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, req.userId)).limit(1);

    if (!profile) {
      [profile] = await db.insert(userProfilesTable).values({
        userId: req.userId,
        displayName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
        phone: user?.phone,
      }).returning();
    }

    return res.json({ user, profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/profile", async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { displayName, bio, phone, avatarUrl, preferredContact, firstName, lastName } = req.body;

    if (firstName !== undefined || lastName !== undefined) {
      await db.update(usersTable)
        .set({
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(phone !== undefined && { phone }),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, req.userId));
    }

    let [existing] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, req.userId)).limit(1);

    if (!existing) {
      [existing] = await db.insert(userProfilesTable).values({
        userId: req.userId,
      }).returning();
    }

    const [updated] = await db.update(userProfilesTable)
      .set({
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(preferredContact !== undefined && { preferredContact }),
        updatedAt: new Date(),
      })
      .where(eq(userProfilesTable.userId, req.userId))
      .returning();

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
