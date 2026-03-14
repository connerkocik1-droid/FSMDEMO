import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoRequestsTable = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name").notNull(),
  businessType: text("business_type").notNull(),
  teamSize: text("team_size"),
  message: text("message"),
  preferredSlot: text("preferred_slot"),
  wantsRecorded: boolean("wants_recorded").notNull().default(false),
  wantsPrivate: boolean("wants_private").notNull().default(false),
  confirmationCode: text("confirmation_code").notNull(),
  scheduledSlot: text("scheduled_slot"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDemoRequestSchema = createInsertSchema(demoRequestsTable).omit({ id: true, createdAt: true });
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequestsTable.$inferSelect;
