import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";
import { usersTable } from "./users";

export const userInvitesTable = pgTable("user_invites", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  invitedBy: integer("invited_by").notNull().references(() => usersTable.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("operator"),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type UserInvite = typeof userInvitesTable.$inferSelect;
