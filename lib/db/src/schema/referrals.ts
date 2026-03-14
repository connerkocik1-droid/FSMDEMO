import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  referredByCompanyId: integer("referred_by_company_id").references(() => companiesTable.id),
  referredToCompanyId: integer("referred_to_company_id").references(() => companiesTable.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  serviceNeeded: text("service_needed"),
  status: text("status").notNull().default("pending"),
  rewardAmount: numeric("reward_amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referralGroupsTable = pgTable("referral_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  region: text("region"),
  memberCount: integer("member_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const referralGroupMembersTable = pgTable("referral_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => referralGroupsTable.id),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReferralGroupSchema = createInsertSchema(referralGroupsTable).omit({ id: true, createdAt: true });
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
export type ReferralGroup = typeof referralGroupsTable.$inferSelect;
